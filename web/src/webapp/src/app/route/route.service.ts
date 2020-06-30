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

import { Injectable } from '@angular/core';
import { Observable, Subject, throwError} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../basecrud.service';
import { CrudListResult,CrudGetResult } from '../helpers/crud-result';
import { POI,TransportPOI } from '../poi/poi';
import { Site } from '../site/site';
import { Route } from './route';
import { CrudSaveResult,CrudResult } from '../helpers/crud-result';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ScenarioSelectableDay, ScenarioSelectedDay, Scenario, ScenarioFilter } from '../scenario/scenario';
import { share, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RouteService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"route") }

  /**
   * Turn a list of sites into a semicolon-separated string containing the sites ids.
   * @param sites Site[] : an array of sites
   * @return string : the sites ids separated by semicolon characters
   */
  sitesToString(sites : Site[]) : string {
    // Turn institutions id list into a semicolon (;) separated string
    var sResult : string = "";
    if(sites!=undefined){
      for(let site of sites){
        if(sResult!=""){
          sResult+=";";
        }
        sResult+=site.id;
      }
    }
    return sResult
  }

  /**
   * Function that get a list of Route objects
   * @param filters : to filter the output list
   * @return Observable<Route[]> : an observable list of Route objects
   */
  list(filters): Observable<Route[]> {
    return super.list({
      institutions:this.sitesToString(filters.institutions),
      timeSlotId:filters.timeSlotId || "",
      demands:filters.demands || "",
      scenarioMainId:(filters.scenarioMain!=undefined?filters.scenarioMain.id : ""),
      onGoingStatus:filters.onGoingStatus || "",
      hr_main_id:(filters.hr_main_id!=undefined?filters.hr_main_id : "")
    }) as Observable<Route[]>;
  }

    /**
   * Function that get a list of Route objects
   * @param filters : to filter the output list
   * @return Observable<Route[]> : an observable list of Route objects
   */
  listRoutesByUserMainId(hrMainId: String): Observable<TransportPOI[]> {
    var ofList = new Subject<TransportPOI[]>();
    this.http.get(this.getURL('list-by-hrmainid/'+hrMainId))
             .subscribe(
               (response: CrudListResult) => {
                 ofList.next(response.data as TransportPOI[]);
               });
    return ofList;
  }


  /**
   * List the transport POIs corresponding to the provided list of institution ids.
   * @param institutions Site[] : list of institutions
   * @param timeSlotId string : considered timeSlotId
   * @param demands boolean : whether to work with transport demands or on POIs
   * @return Observable<TransportPOI[]> : observable list of TransportPOIs corresponding to the institutions
   */
  listPOIs(institutions : Site[], timeSlotId:string, demands:boolean) : Observable<TransportPOI[]> {
    var ofList = new Subject<TransportPOI[]>();
    this.http.get(this.getURL('poi/list'),{params:this.toString({
      institutions:this.sitesToString(institutions),
      timeSlotId:timeSlotId,
      demands:demands
    })})
             .subscribe(
               (response: CrudListResult) => {
                 ofList.next(response.data as TransportPOI[]);
               });
    return ofList;
  }

  /**
   * Compute the detailed route for the provided waypoints
   * A timeslot id and a departure local time or arrival local time are required since the computation
   *   of route directions is time-dependent
   * @param waypoints POI[] : a set of POIs
   * @param sTimeslotId string : a time slot id
   * @param iDepartureLocalTime integer : departure local time in ms
   * @param iArrivalLocalTime integer : local departure time in ms
   * @return Observable<any> : an observable on a set of routes formatted in a mapbox style
   */
  directions(waypoints : POI[],sTimeslotId,iDepartureLocalTime,iArrivalLocalTime) : Observable<any>{
    // Turn POIs into a string containing a list of coordinates in lon,lat;...;lon,lat format
    var sCoordinates : string = "";
    for(let waypoint of waypoints){
      if(sCoordinates!=""){
        sCoordinates+=";";
      }
      sCoordinates+=waypoint.geom.coordinates[0]
      sCoordinates+=",";
      sCoordinates+=waypoint.geom.coordinates[1];
    }
    // The type of the result is defined in the router documentation
    var ofGet = new Subject<any>();
    this.http.get(this.getURL('directions/'+sCoordinates),{params:this.toString({
      timeslotId:sTimeslotId,
      departureLocalTime:iDepartureLocalTime,
      arrivalLocalTime:iArrivalLocalTime,
    })}).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data);
      ofGet.complete();
    });
    return ofGet;
  }

  /**
   * Function that will call server for adding or updating object
   * @param data : object to insert/update
   * @return Observable<CrudSaveResult>
   */
  save(data) : Observable<CrudSaveResult>{
    // The presence of RouteService among attributes may cause a js error due to a circular structure
    // So we make a deep copy of the relevant attributes in the input data before sending to server
    var POIs=[];
    if(data.route.POIs){
      for(let POI of data.route.POIs){
        POIs.push({
          id:POI.id,
          hr_id:POI.hr_id,
          transport_demand_id:POI.transport_demand_id,
          waiting_duration:POI.waiting_duration,
          target_hr:POI.target_hr,
          target_hr_auto:POI.target_hr_auto,
          target_hr_manual:POI.target_hr_manual,
        });
      }
    }
    return super.save({
      timeSlotId:data.timeSlotId,
      route:{
        id:data.route.id,
        vehicleCategory:data.route.vehicleCategory?{id:data.route.vehicleCategory.id}:undefined,
        label:data.route.label,
        start_hr:data.route.start_hr,
        end_hr:data.route.end_hr,
        duration:data.route.duration,
        distance:data.route.distance,
        cost:data.route.cost,
        co2:data.route.co2,
        POIs:POIs,
        optimMainId:data.route.optim_main_id,
        driverId:data.route.driver?data.route.driver.id:undefined
      },
      scenarioMainId:data.scenarioMain.id,
      calendarDt:data.calendarDt
    });
  }

  /**
   * Function that will call server for getting routes from an optim instance
   * The optim instance must be linked to a scenario, calendar and timeslot, otherwise restore will fail
   * All the routes that are linked to the same scenario, calendar and timeslot but not linked to an
   *   optim instance will be deleted.
   * @param string : the optimId
   * @return Observable<Route[]>
   */
  restore(optimId : string): Observable<Route[]> {
    var ofList = new Subject<Route[]>();
    this.http.post(this.getURL('restore'),{optimId:optimId})
             .pipe(
               catchError(err => {
                   console.log('Handling error locally and rethrowing it...', err);
                   ofList.next(null);
                   return throwError(err);
               })
             )
             .subscribe( (response: CrudListResult) => {
               ofList.next(response.data as Route[]);
               return ofList;
             });
    return ofList;
  }

  /**
   * Get a calendar of the routes for a scenario/day/direction
   * @param data ScenarioFilter
   * @return Observable<{count:number;calendarDt:number}[]>
   */
  calendar(filters : ScenarioFilter): Observable<{count:number;date_dt:number}[]> {
    var ofList = new Subject<{count:number;date_dt:number}[]>();
    this.http.get(this.getURL('calendar'),{params:this.toString({
      calendarDt:filters.calendarDt,
      scenarioMainId:filters.scenarioMain.id,
      timeSlotId:filters.timeSlotId
    })}).subscribe( (response: CrudResult) => {
      ofList.next(response.data as {count:number;date_dt:number}[]);
    });
    return ofList;
  }

  /**
   * End a route
   */
  end(routeId : string): Observable<CrudResult>{
    return this.http.post(this.getURL('end'),{transport_route_id:routeId}).pipe(share()) as Observable<CrudResult>;
  }

  /**
   * Restart a route
   */
  resetProgression(routeId : string): Observable<CrudResult>{
    return this.http.post(this.getURL('reset-progression'),{transport_route_id:routeId}).pipe(share()) as Observable<CrudResult>;
  }

  /**
   * Sort the errors by level for the input route and input scope code
   * If some errors of level ERROR are present, only the errors of level ERROR are returned
   * Otherwise if some errors of level WARNING are present, only the errors of level WARNING are returned
   * Otherwise if some errors of level INFO are present, only the errors of level INFO are returned
   * @param sScopeCode  string : a scope code, for instance VEHICLE_CAT or TIME or HR
   * @param route Route : a route for which we need to synthetize the errors
   * @return an array of errors of the same level (ERROR or WARNING or INFO)
   */
  keepMostSevereErrors(sScopeCode: string,route : Route){
    var errorsForCurrentScope = [];
    var warningsForCurrentScope = [];
    var infosForCurrentScope = [];
    if(route!=undefined && route!=null && route.errors!=undefined && route.errors!=null){
      for(let error of route.errors){
        if(error.scope_code==sScopeCode){
          if(error.level_code=='ERROR'){
            errorsForCurrentScope.push(error);
          }
          if(error.level_code=='WARNING'){
            warningsForCurrentScope.push(error);
          }
          if(error.level_code=='INFO'){
            infosForCurrentScope.push(error);
          }          
        }
      }
    }
    // Keep only the errors for one level (the most severe)
    var aResults =[];
    if(errorsForCurrentScope.length>0){
      aResults = errorsForCurrentScope;
    }
    else{
      if(warningsForCurrentScope.length>0){
        aResults = warningsForCurrentScope;
      }  
      else{
        if(infosForCurrentScope.length>0){
          aResults = infosForCurrentScope;
        }              
      }                          
    }
    return aResults; 
  }

  /**
   * For each provided scope code or error, rework the list of errors to have a lighter array of errors
   *   - if there is an error, do not display warnings or infos
   *   - otherwise if there is a warning, do not display infos
   * @param aScopeCodes string[] : a set of error scope codes, for instance ['VEHICLE_CAT','TIME','HR']
   * @param route Route : route that contains an errors field to be simplified
   */
  synthesizeErrors(aScopeCodes:string[],route:Route){
    var errors=[];          
    for(let scope_code of aScopeCodes){
       errors = errors.concat(this.keepMostSevereErrors(scope_code,route));         
    }
    return errors;
  }  
}