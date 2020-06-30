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

import {Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { ScenarioService } from '../scenario/scenario.service';
import { Route } from '../route/route';
import { Scenario } from '../scenario/scenario';
import { combineLatest, Observable, Subject } from 'rxjs';
import { RouteService } from '../route/route.service';
import { faCalendar,faSpinner } from '@fortawesome/free-solid-svg-icons';
import { Utils } from '../helpers/utils';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'dashboard-route-list',
  templateUrl: './dashboard.route-list.html',
  styleUrls: ['./dashboard.scss']  
})
export class DashboardRouteList implements OnInit {
  
  routes: Route[] = [];

  startDt:NgbDate;
  endDt: NgbDate;

  faCalendar = faCalendar;
  faSpinner = faSpinner;

  bLoading: boolean = false;

  constructor(protected scenarioService: ScenarioService, 
              protected routeService: RouteService){
  }

  ngOnInit(): void {
    this.startDt = Utils.momentToNgbDate(moment().startOf("week"));
    this.endDt = Utils.momentToNgbDate(moment().endOf("week"));
    this.loadData();
  }

  loadData(){
    this.bLoading = true;
    this.loadRoutes(this.startDt,this.endDt).subscribe(routes => {
      this.routes = routes;
      this.bLoading = false;
    });
  }

  /**
   * Load route for EXPLOITATION scenario within given range
   * @param startDt ngbDate
   * @param endDt ngbDate
   * @return Route[]
   */
  loadRoutes(startDt: NgbDate,endDt: NgbDate) : Observable<Route[]>{
    let ret:Subject<Route[]>  = new Subject();

    var routes:Route[] = [];

    // Load scenarios in with 'production' status
    this.scenarioService.list({'status_code':'OPERATION'}).subscribe((result) => {
      let scenarios: Scenario[] = result as Scenario[];

      // For each scenario, get routes for current week
      this.routes = [];
      var tblObs = [];
      for(let scenario of scenarios){
        tblObs.push(
          this.scenarioService.listRoutes({scenarioMain:scenario,
                                             timeSlotId:null,
                                             calendarDt:null,
                                           routeStartDt:Utils.ngbDateToMoment(startDt).valueOf(),
                                             routeEndDt:Utils.ngbDateToMoment(endDt).valueOf()})
        );
      }
      
      // Wait for all REST to end results is an array of the individual result
      combineLatest(tblObs).subscribe((results:Route[]) => 
        {
          routes = [].concat(...results);
          for(var i=0;i<routes.length;i++){
            routes[i].institutionsLabel = 
              routes[i].POIs.filter(poi => poi.site_type_code=="INSTITUTION") // Filter POI, select only institution
                                 .filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i) // remove duplicates
                                 .map(poi => poi.label).join(", "); // join result on poi.label field
            
            routes[i].homesCount = routes[i].POIs.filter(poi => poi.site_type_code=="HOME").length;
          }

          routes.sort((a,b)=>a.date_dt-b.date_dt);

          ret.next(routes);
        }
      );
    });

    return ret;
  }


}