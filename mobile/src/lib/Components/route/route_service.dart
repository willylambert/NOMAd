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

import "dart:async";
import "dart:convert";
import 'package:f_logs/f_logs.dart';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import "package:http/http.dart" as http;
import 'package:nomad_mobile_driver/Components/app_context/app_context.dart';
import 'package:nomad_mobile_driver/Components/app_context/app_context_service.dart';
import 'package:nomad_mobile_driver/Components/login/login_service.dart';
import 'package:nomad_mobile_driver/Components/nomad_exception.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';

import "../route_list/route_list_response.dart";

class RouteService{

  /**
   * Get route for a user at a given date
   * @param username : string
   * @param dt : timestamp of day
   */
  Future <RouteListResponse> getRoutes({@required String userMainId, @required DateTime dt}) async {

    final AppContext context = await AppContextService().getContext();

    RouteListResponse result;

    final parameters = {
      "hr_main_id" : userMainId,
      "year" : dt.year.toString(),
      "month" : dt.month.toString(),
      "day" : dt.day.toString()
    };

    final uri = Uri.http(context.apiEndpoint, "/rest/hr/routes",parameters);

    FLog.info(text:uri.toString());

    final response = await http.get(uri, headers: {"Authorization":LoginService.authToken,"Content-type":"application/json"});
    if(response.statusCode == 200){ 
      FLog.info(text:"routes : " + response.body);      
      result = RouteListResponse.fromJson(json.decode(response.body));
    }else{
      FLog.info(text:"Error " + response.statusCode.toString() + " " + response.body);
      throw NomadException(errMsg: response.body,errCode: response.statusCode);
    }

    return Future.value(result);
  }

  insertLocation({@required String transportRouteId, @required String userMainId, @required List<RouteProgressionStep> routeSteps, @required Position position}) async {

    final AppContext context = await AppContextService().getContext();
    final uri = Uri.http(context.apiEndpoint,"/rest/route/insert-location");

    List<Map<String,dynamic>> nextPois = List<Map<String,dynamic>>();

    routeSteps.forEach( (step){
      if(step.arrivalDuration!=null && step.arrivalDuration>0){
        nextPois.add(step.toRoutePoi());
      }
    });

    final body = {
      "transport_route_id" : transportRouteId,
      "user_main_id" : userMainId,
      "next_pois" : nextPois,
      "dt" : (position.timestamp.millisecondsSinceEpoch/1000).round()*1000,
      "lng" : position.longitude,
      "lat" : position.latitude,
      "h" : position.heading.toInt(),
      "s" : position.speed.toInt(),
      "a" : position.accuracy.toInt()
    };

    var response;

    try{
      response = await http.post(uri,body:json.encode(body), headers: {"Authorization":LoginService.authToken,"Content-type":"application/json"});
    }on Exception {
      FLog.error(text:"network error ");
      throw NomadException(errMsg: "Erreur réseau");
    }    

    if(response.statusCode == 200){
      FLog.info(text:"insert location : ok " + response.body);
    }else{
      FLog.error(text:"Error " + response.statusCode.toString() + " " + response.body);
      throw NomadException(errMsg: ";-( Erreur serveur " + response.statusCode.toString());
    }
  }

  // Notify server that route is started
  startRoute({@required String transportRouteId}) async {

    final AppContext context = await AppContextService().getContext();
    final uri = Uri.http(context.apiEndpoint,"/rest/route/start");

    final body = {
      "transport_route_id" : transportRouteId,
    };
    
    FLog.info(text:"starting route for " + transportRouteId);

    var response;

    try{
      response = await http.post(uri,body:json.encode(body), headers: {"Authorization":LoginService.authToken,"Content-type":"application/json"});
    }on Exception {
      FLog.error(text:"network error ");
      throw NomadException(errMsg: "Erreur réseau");
    }

    if(response.statusCode == 200){
      FLog.info(text:"route start : ok");
    }else{
      FLog.error(text:"Error " + response.statusCode.toString() + " " + response.body);
      throw NomadException(errMsg: "Erreur serveur");
    }
  }

  // Notify server that route is ended
  endRoute({@required String transportRouteId}) async {

    final AppContext context = await AppContextService().getContext();
    final uri = Uri.http(context.apiEndpoint,"/rest/route/end");

    final body = {
      "transport_route_id" : transportRouteId,
    };
    
    FLog.info(text:"ending route for " + transportRouteId);

    var response;

    try{
      response = await http.post(uri,body:json.encode(body), headers: {"Authorization":LoginService.authToken,"Content-type":"application/json"});
    }on Exception {
      FLog.error(text:"network error ");
      throw NomadException(errMsg: "Erreur réseau");
    }

    if(response.statusCode == 200){
      FLog.info(text:"route ended : ok ");
      return true;
      
    }else{
      FLog.error(text:"Error " + response.statusCode.toString() + " " + response.body);
      throw NomadException(errMsg: "Erreur serveur");
    }
  }

  // Notify the visit of a POI
  visitPoi({@required String transportRouteId, @required String poiId, @required bool missing, String comments, @required int visitedDt}) async {
    final AppContext context = await AppContextService().getContext();
    final uri = Uri.http(context.apiEndpoint,"/rest/route/visit");

    final body = {
      "poiId" : poiId,
      "transportRouteId" : transportRouteId,
      "missing" : missing,
      "comments" : comments,
      "visited_dt" : visitedDt
    };
    
    FLog.info(text:"set visit for poi " + poiId);

    var response;
    try{
      response = await http.post(uri,body:json.encode(body), headers: {"Authorization":LoginService.authToken,"Content-type":"application/json"});
    }on Exception {
      FLog.error(text:"network error ");
      throw NomadException(errMsg: "Erreur réseau");
    }

    if(response.statusCode == 200){
      FLog.info(text:"set visit : ok ");
      return true;
      
    }else{
      FLog.error(text:"Error " + response.statusCode.toString() + " " + response.body);
      throw NomadException(errMsg: "Erreur serveur");
    }

  }

}