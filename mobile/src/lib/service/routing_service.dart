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
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mapbox_gl/mapbox_gl.dart';
import 'package:nomad_mobile_driver/config/app_config.dart';
import 'package:nomad_mobile_driver/service/routing_response.dart';
import 'package:f_logs/f_logs.dart';

class RoutingService{

  static String authToken;
  static final RoutingService _singleton = new RoutingService._internal();
  DateTime lastGetDirectionsCallDt;
  
  RoutingService._internal(){
    // init singleton
  }

  factory RoutingService(){    
    return _singleton;
  }

  Future<RoutingResponse> getDirections(List<LatLng> waypoints) async {
    String sWaypoints = "";
    waypoints.forEach((waypoint){
      sWaypoints += waypoint.latitude.toString() + "," + waypoint.longitude.toString() + ":";
    });

    final appConfig = AppConfig();

    final url = "https://api.tomtom.com/routing/1/calculateRoute/" + sWaypoints + "/json?key=" + appConfig.tomtomApiToken + "&traffic=true";
    print(url);

    var response;

    try{
      response = await http.get(url);
    }catch(e){
     return RoutingResponse(errorDescription: "Erreur lors de la connexion au serveur de calcul d'itinéraire.",status: 500); 
    }

    print(response.body);
    
    final body = json.decode(response.body);
    if(response.statusCode==200){
      this.lastGetDirectionsCallDt = DateTime.now();
      return RoutingResponse.fromJson(body);      
    }else{
      if(response.statusCode==500){
        return RoutingResponse(errorDescription: body['error']['description'],status: response.statusCode);
      }else{
        return RoutingResponse(errorDescription: "Erreur lors de la connexion au serveur de calcul d'itinéraire.",status: response.statusCode);
      }
    }

  }

}