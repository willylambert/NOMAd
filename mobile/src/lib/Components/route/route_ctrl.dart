/*
 * Copyright (c) 2020 INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and ODO Smart Systems
 *
 * This program has been developed in the context of the NOMAd project and is GPL v3 Licensed.
 * We would like to thank the European Union through the European regional development fund (ERDF) and the French region Auvergne-Rhône-Alpes for their financial support.
 * The following entities have been involved in the NOMAd project: INSA Lyon (DISP LAB EA 4570), IMT Atlantique (LS2N LAB UMR CNRS), Ressourcial, SYNERGIHP and Odo Smart System.
 *
 * This file is part of NOMAd.
 *
 * NOMAd is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * NOMAd is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with NOMAd.  If not, see <https://www.gnu.org/licenses/>.
 */

import 'dart:async';
import 'dart:math';

import 'package:f_logs/f_logs.dart';
import 'package:flutter/material.dart';
import 'package:mapbox_gl/mapbox_gl.dart';
import 'package:nomad_mobile_driver/Components/login/login_service.dart';
import 'package:nomad_mobile_driver/Components/route/poi.dart';
import 'package:nomad_mobile_driver/Components/route/route.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';
import 'package:nomad_mobile_driver/Components/route/route_service.dart';
import 'package:nomad_mobile_driver/config/app_config.dart';
import 'package:nomad_mobile_driver/service/routing_response.dart';
import 'package:nomad_mobile_driver/service/routing_service.dart';

import 'package:geolocator/geolocator.dart';

import '../../base_ctrl.dart';
import '../nomad_exception.dart';

class RouteCtrl extends BaseCtrl {
  
  // Nomad API
  RouteService _routeService = RouteService();

  // Third party routing API : TomTom, OSRM, ...
  RoutingService _routingService = RoutingService();

  // Reflect the route received from server
  DriverRoute route;

  // Store driver progression along route
  RouteProgression routeProgression = RouteProgression();

  // Number of remaining steps - used to show end service button
  int nbRemainingSteps;

  // Waiting for TomTom response
  bool bLoadingDirection = false;

  // Result of last call to router
  RoutingResponse _direction;

  // Timer start when service (aka route) starts
  Timer _routeProgressionTimer;

  // App Config
  AppConfig _appConfig;

  bool _bUpdateRouteProgressionIsRunning = false;

  RouteCtrl(BuildContext context){
    this.route = ModalRoute.of(context).settings.arguments;

    this._appConfig = AppConfig();
    loadData();
  }

  // Load route from server, 
  // Initialise steps for display
  void loadData() async {
    routeProgression.steps.clear();
    int i = 0;
    route.pois.forEach((poi){      
      RouteProgressionStep step = RouteProgressionStep(poi: poi);
      // Random duration / arrivalTime
      routeProgression.steps.add(step);
      i++;
    });

    if(route.startedDt!=null && route.endedDt==null){
      routeProgression.isServiceStarted = true;
      routeProgression.serviceStartDt = route.startedDt;
    }

    _startRouteUpdateTimer();

    // Set the driver progression
    await updateDriverProgression();
 }

  _startRouteUpdateTimer(){
    if(route.startedDt!=null && route.endedDt==null && _routeProgressionTimer==null){
      _routeProgressionTimer = Timer.periodic(Duration(seconds: 20), (timer) {
        if(!_bUpdateRouteProgressionIsRunning){
          this.updateRouteProgression();
        }
      });
    }
  }

  // update progression : set next step
  Future updateDriverProgression() async {
    FLog.info(text:"updateDriverProgression");
    int i=0;
    int nextStepIndex = 0;

    nbRemainingSteps = 0;
    routeProgression.steps.forEach((step){
      i++;
      // Target time received from server
      // Useful to show advance / late of vehicle
      step.targetTime = DateTime(route.dt.year, route.dt.month, route.dt.day);
      if(step.poi.targetHr!=null){
        step.targetTime = step.targetTime.add(Duration(milliseconds: step.poi.targetHr));
      }
      step.isNextStep = false;
      if(step.poi.visitedDt!=null){
        nextStepIndex = i;        
      }else{
        nbRemainingSteps++;
      }
    });

    FLog.info(text:"nextStepIndex " + nextStepIndex.toString() + " length=" + routeProgression.steps.length.toString());
    if(nextStepIndex!=null && nextStepIndex<routeProgression.steps.length){
      routeProgression.steps.elementAt(nextStepIndex).isNextStep = true;
    }    
    
    if(_routeProgressionTimer?.isActive ?? true){
      notifyListeners();
    }
    
    this.updateETA(bUpdateRoute: true);
  }

  /**
   * Called by routeProgresssionTimer
   * Update ETA
   * Send updated location and routeProgression to server
   */
  Future updateRouteProgression() async {
    FLog.info(text:"updateRouteProgression");

    _bUpdateRouteProgressionIsRunning = true;

    var bUpdateRoute = false;
    if(this._routingService.lastGetDirectionsCallDt!=null){
      bUpdateRoute = DateTime.now().isAfter( this._routingService.lastGetDirectionsCallDt.add( Duration(seconds: this._appConfig.recalculateRouteInterval)));
    }

    await this.updateETA(bUpdateRoute: bUpdateRoute);

    Position location;
    try{
      location = await Geolocator().getCurrentPosition(desiredAccuracy: LocationAccuracy.best);
    }catch(e){
      print(e.toString());
    }

    if(location!=null){
      try{
        await _routeService.insertLocation(position: location, routeSteps: routeProgression.steps, transportRouteId: route.id, userMainId: LoginService.userMainId);
      } on NomadException catch(e){
        this.addError(e.errMsg);
      }
    }
    
    if(_routeProgressionTimer.isActive){
      notifyListeners();
    }

    _bUpdateRouteProgressionIsRunning = false;
  }

  /**
   * Start Service :
   *   => Estimate ETA for each pois (with TomTom)
   *   => Launch GPS Location retrieval
   *   => Notify server with current location and updated ETA
   */
  void startService() async {

    this.bLoadingDirection = true;
    notifyListeners();

    // Add Start Step at the beggining of the list
    final step = RouteProgressionStep(poi: Poi(label:"Début de service"));
    step.setVisited(true);
    routeProgression.steps.insert(0, step);
    routeProgression.isServiceStarted = true;
    routeProgression.serviceStartDt = DateTime.now();
    this.route.startedDt = routeProgression.serviceStartDt;

    _startRouteUpdateTimer();

    notifyListeners();

    // Notify Server
    try{
      await this._routeService.startRoute(transportRouteId: this.route.id);
    } on NomadException catch(e){
      this.addError(e.errMsg);
    }       

    this.updateRouteProgression();

    await updateDriverProgression();    
  }

  void endService() async {
    routeProgression.isServiceStarted = false;
    routeProgression.serviceEndDt = DateTime.now();
    final step = RouteProgressionStep(poi: Poi(label:"Fin de service",visitMissing: false));
    step.setVisited(true);
    routeProgression.steps.add(step);

    // Notify Server
    try{
      await this._routeService.endRoute(transportRouteId: this.route.id);
    } on NomadException catch(e){
      this.addError(e.errMsg);
    }         
    
    if(_routeProgressionTimer.isActive){
      notifyListeners();
    }

    _routeProgressionTimer?.cancel();
  }

  /**
   * Update ETA for each points of the route
   * @param bUpdateRoute : call server to an updated / new route
   */
  Future updateETA({bUpdateRoute:bool}) async {
    FLog.info(text:"updateETA, call Router :" + bUpdateRoute.toString());
    if(bUpdateRoute){
      // Build waypoints
      List<LatLng> waypoints = List<LatLng>();
      Position position;
      try{
        position = await Geolocator().getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      } catch (e) {
        print(e.toString());
      }

      if(position==null){
        return Future.value(false);
      }

      waypoints.add(LatLng(position.latitude,position.longitude));
      routeProgression.steps.forEach((step){
        if(step.poi!=null && step.poi.visitedDt==null){
          print("add waypoint" + step.poi.label);
          waypoints.add(step.poi.coordinates);
        }
      });

      // Get directions with traffic
      bLoadingDirection = true;
      if(_routeProgressionTimer?.isActive ?? true){
        notifyListeners();
      }
      final updatedDirection = await _routingService.getDirections(waypoints);
      bLoadingDirection = false;
      if(updatedDirection.routes!=null){
        _direction = updatedDirection;
        FLog.info(text: "Updated route retrieved");
      }else{
        FLog.warning(text:"Failed to retrieve updated route");
      }
    }

    if(_direction!=null && _direction.routes!=null){
      // Compute timeoffset in seconds.
      int timeOffset = (_direction.routes.elementAt(0).departureTime.millisecondsSinceEpoch - DateTime.now().millisecondsSinceEpoch)~/1000;

      print("timeOffset : " + timeOffset.toString());

      // Set arrival time and duration
      int i=0;
      int travelDuration = 0;
      routeProgression.steps.forEach((step){
        if(step.poi!=null && step.poi.visitedDt==null){
          travelDuration += _direction.routes.elementAt(0).legs.elementAt(i).travelTimeInSeconds+timeOffset;
          step.arrivalDuration = travelDuration;
          step.arrivalTime = DateTime.now().add(Duration(seconds: step.arrivalDuration));
          i++;
        }
      }); 
    }

    if(_routeProgressionTimer?.isActive ?? true){
      notifyListeners(); 
    }

  }

  @override
  void dispose(){
    this._routeProgressionTimer?.cancel();      
    super.dispose();
  }

}