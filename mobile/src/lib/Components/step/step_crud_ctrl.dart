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

import 'package:flutter/material.dart';
import 'package:nomad_mobile_driver/Components/route/route.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';
import 'package:nomad_mobile_driver/Components/route/route_service.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../base_ctrl.dart';
import '../nomad_exception.dart';

class StepCrudCtrl extends BaseCtrl {
   
  // Nomad API
  RouteService _routeService = RouteService();

  RouteProgressionStep step;
  DriverRoute route;
   
  StepCrudCtrl(BuildContext context){
    final Map<String,dynamic> arguments = ModalRoute.of(context).settings.arguments;
    this.step = arguments["step"];
    this.route = arguments["route"];
  }

  // User is missing
  Future setCanceled(bool status) async {
    try{
      await _routeService.visitPoi(transportRouteId: route.id, poiId: step.poi.id,missing: true,visitedDt: DateTime.now().millisecondsSinceEpoch );
    } on NomadException catch(e){
      this.addError(e.errMsg);
    }
    
    this.step.poi.visited = true;
    this.step.poi.visitMissing = true;
    this.step.poi.visitedDt = DateTime.now();
    notifyListeners();
  }

  // User is visited
  Future setVisited(bool status) async {
    try{
      await _routeService.visitPoi(transportRouteId: route.id,poiId: step.poi.id,missing: false,visitedDt: DateTime.now().millisecondsSinceEpoch );
    } on NomadException catch(e){
      this.addError(e.errMsg);
    }       
    this.step.poi.visited = true;
    this.step.poi.visitMissing = false;
    this.step.poi.visitedDt = DateTime.now();
    notifyListeners();
  }

  openMap() async {
    // Android
    final url = "google.navigation:q="+this.step.poi.coordinates.latitude.toString()+","+this.step.poi.coordinates.longitude.toString();
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      // iOS
      final url = "comgooglemaps://?daddr="+this.step.poi.coordinates.latitude.toString()+","+this.step.poi.coordinates.longitude.toString()+"&directionsmode=driving";
      await launch(url);
    }
  }
}