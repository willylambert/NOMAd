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

// Store poi status modification : isCanceled, delayed, ..
import 'package:nomad_mobile_driver/Components/route/poi.dart';

enum RouteStepType { driver, institution, wheelchair, walker }

class RouteProgressionStep{

  Poi poi; // poi from route
  int positionInRoute = 0; // position of Poi in route
  RouteStepType type;
  int arrivalDuration; // Arrival Duration in seconds
  DateTime arrivalTime; // Arrival Time 
  bool isNextStep = false;
  DateTime targetTime; // Target arrival Time
  
  // step order is not part of route returned by server,
  // we get it with nbStep
  static int nbStep = 0;

  RouteProgressionStep({poi: Poi}){
    this.poi = poi;
    this.positionInRoute = RouteProgressionStep.nbStep++;

    if(poi!=null){
      if(this.poi.siteTypeCode == 'HOME'){
        if(this.poi.transportModeCode == "FAUTEUIL"){
          this.type = RouteStepType.wheelchair;
        }else{
          this.type = RouteStepType.walker;
        }
      }else{
        if(this.poi.siteTypeCode == "INSTITUTION"){
          this.type = RouteStepType.institution;
        }
      }
    }    
  }

  /**
   * @return Duration : relative number of minutes of ahead or late compared to theorical (target) visit time
   */
  Duration getAheadDuration(){

    return this.targetTime.difference(this.arrivalTime);
  }

  setVisited(bool status){
    poi.visited = status;
    poi.visitedDt = DateTime.now();
  }

  // used to convert current step to insert-location api specs
  Map<String,dynamic> toRoutePoi(){
    return {
      "site_poi_id" : this.poi.id,
      "duration_to_poi" : this.arrivalDuration*1000,
      "orderroute" : this.positionInRoute
    };
  }

  String toString(){
    return this.poi.label + " visited:" + this.poi.visited.toString();
  }

}