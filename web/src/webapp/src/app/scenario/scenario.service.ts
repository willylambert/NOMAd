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
import { HttpClient } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { BaseCrudService } from '../basecrud.service';
import { Scenario,ScenarioDemands, ScenarioCopy, ScenarioFilter } from './scenario';
import { CrudSaveResult,RestResult, CrudListResult, CrudResult } from '../helpers/crud-result';
import { TransportPOI } from '../poi/poi';
import { Route } from '../route/route';
import { DemandCheckResult } from '../demand/demand';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"scenario") }

  /**
   * Get a minimap of the scenario in order to locate routes
   * @param string id : scenario id
   * @return Observable<ScenarioDemands> : an ScenarioDemands observable object
   */
  minimap(id:string) : Observable<ScenarioDemands> {
    var ofGet = new Subject<ScenarioDemands>();
    this.http.get(this.getURL('minimap/'+id)).subscribe( (response: {result:RestResult;data:ScenarioDemands}) => {
      ofGet.next(response.data);
      ofGet.complete();
    });
    return ofGet;
  }

  /**
   * Function that will call server for adding a scenario by duplication of an existing scenario
   * @param data : scenario to insert and id of the scenario du duplicate
   * @return Observable<CrudSaveResult>
   */
  duplicate(data : {scenarioMainId :string, newScenario:Scenario}) : Observable<CrudSaveResult>{
    return this.http.post(this.getURL('duplicate'),data).pipe(share()) as Observable<CrudSaveResult>;
  }

  /**
   * Function that will call server for adding a route into a scenario by duplication of an existing route
   *    from another scenario
   * @param data : the target scenario and the id of the route du duplicate
   * @return Observable<CrudSaveResult>
   */
  duplicateRoute(data : {routeId : string, newScenarioMainId:string}) : Observable<CrudSaveResult>{
    return this.http.post(this.getURL('duplicate-route'),data).pipe(share()) as Observable<CrudSaveResult>;
  }

  /**
   * Function that get a list of Route objects
   * @param filters : to filter the output list
   * @return Observable<Route[]> : an observable list of Route objects
   */
  listRoutes(filters:ScenarioFilter): Observable<Route[]> {
    var ofList = new Subject<Route[]>();
    this.http.get(this.getURL('route/list'),{params:this.toString({
      calendarDt:filters.calendarDt,
      scenarioMainId:filters.scenarioMain.id,
      timeSlotId:filters.timeSlotId,
      startDt:filters.routeStartDt,
      endDt:filters.routeEndDt,
    })})
    .subscribe((response: CrudListResult) => {
      ofList.next(response.data as Route[]);
    });
    return ofList;
  }

  /**
   * List the transport POIs corresponding to the provided scenario id and calendarDt.
   * @param filters {timeSlotId:string,calendarDt:number,scenarioMain:Scenario} : data to retrieve the POIs
   * @return Observable<TransportPOI[]> : observable list of TransportPOIs corresponding to the input filters
   */
  listPOIs(filters:{timeSlotId:string,calendarDt:number,scenarioMain:Scenario}){
    var ofList = new Subject<TransportPOI[]>();
    this.http.get(this.getURL('poi/list'),{params:this.toString({
      calendarDt:filters.calendarDt,
      scenarioMainId:filters.scenarioMain.id,
      timeSlotId:filters.timeSlotId
    })})
    .subscribe((response: CrudListResult) => {
      ofList.next(response.data as TransportPOI[]);
    });
    return ofList;
  }

  createRecord() : Scenario{
    return new Scenario();
  }

  /**
   * Copy some routes from one date + direction to a set of dates (provided as a set of days or set of weeks)
   * @param data ScenarioCopy
   */
  copy(data : ScenarioCopy) : Observable<CrudResult>{
    return this.http.post(this.getURL('calendar/copy'),{
      calendarDt:data.calendarDt,
      scenarioMainId:data.scenarioMain.id,
      timeSlotId:data.timeSlotId,
      copyMode:data.copyMode,
      selectedDays:data.selectedDays,
      selectedRouteIDs:data.selectedRouteIDs
    }) as Observable<CrudResult>;
  }
}


