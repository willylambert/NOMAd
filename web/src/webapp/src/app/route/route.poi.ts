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

import { TransportPOI,TransportPOIInstitution } from '../poi/poi';
import { Site } from '../site/site';
import { RouteSet } from './route.set';

/**
 * Extension of the TransportPOI class to enable POI insertion in route
 */
export class RoutePOI extends TransportPOI{
  // Information returned by a router, maybe unset if no route was computed.
  routeInfo:{
    // The start time and end time for the POI, in seconds (from 0 or from unix origin).
    startTime:number;
    endTime:number;
    // The duration between the POI and the next POI in the route as returned by the router in seconds.
    durationAfter:number;
    // The distance between the POI and the next POI in the route as returned by the router in meters.
    distanceAfter:number;
    // For a HR, time spent on waiting in the vehicle in the route
    hrTransportDuration;
    // ratio between the hrTransportDuration and the acceptable duration
    hrTransportDurationRatio;
  }

  // Additional duration that is added to the normal driving duration to reach the POI just in time.
  // During this waiting period, the driver may drive slower or stop somewhere before starting pickup
  //   and delivery operations
  waiting_duration;
  // Time spent on the POI to pickup or deliver some passengers
  pickupDuration;
  deliveryDuration;

  // target date to reach the poi : this is a timestamp expressed into milliseconds
  // In the current version, the target_hr will contain a copy of routeInfo.startTime
  // The target_hr is supposed to be the date at which the vehicle reaches a POI, before starting the 
  //   service duration of the POI
  target_hr :number
  // Same but manually defined
  target_hr_manual :number
  // Same but automatically defined
  target_hr_auto :number

  // Estimated arrival timestamp (ms) on a POI as provided by tomtom router
  // The information is provided by mobile terminals
  // When the POI was served, the timestamp at which the POI was served may be stored in arrival_dt
  arrival_dt : number ;
  // number of ms between arrival_dt and now (may be negative if arrival_dt is in the future)
  arrival_duration:number;

  // The timestamp (ms) at which the POI was marked as served by a route driver
  visited_dt : number
  // number of ms between visited_dt and now (may be negative if visited_dt is in the future)
  visited_duration:number;

  // Indicate whether the POI is the next POI to be visited or not
  bIsNextPOI:boolean;

  /**
   *
   */
  constructor(){
    super();
    this.waiting_duration=0;
  }

  /**
   * Sets a RoutePOI from an institution Site
   * @param institution Site
   */
  fromInstitution(institution : Site){
    this.geom=institution.poi_geom;
    this.site_type_code=institution.type_code;
    this.label=institution.label;
    this.city=institution.city;
    this.id=institution.poi_id;
    this.site_main_id=institution.id;
    this.service_duration=institution.service_duration;
  }
}

/**
 * A set of POIs that can belong to no route
 */
export class SelectablePOISet{
    list:TransportPOI[];

    /**
     *
     */
    constructor(){
      this.list=[];
    }

    /**
     * Return the list of institutions for a POI which id is given as an input
     * @param id string : a POI id
     * @return TransportPOIInstitution[] : an array of institutions
     */
    getPOIInstitutions(id:string) : TransportPOIInstitution[]{
      var result : TransportPOIInstitution[] = [];
      for(let POI of this.list){
        if(POI.id==id){
          result=POI.institutions;
        }
      }
      return result;
    }

    /**
     * Search for missing POIs : if some home POIs are present in the input set of routes but not present
     *   in this.list, they will be copied into this.list.
     * @param routes RouteSet : a set of routes
     */
    fromRoutes(routes:RouteSet){
      for(let route of routes.list){
        for(let routePOI of route.POIs){
          if(routePOI.site_type_code=='HOME'){
            var bFound=false;
            for(let POI of this.list){
              if(routePOI.id==POI.id){
                bFound=true;
                break;
              }
            }
            if(!bFound){
              this.list.push(routePOI);
            }
          }
        }
      }
    }

}