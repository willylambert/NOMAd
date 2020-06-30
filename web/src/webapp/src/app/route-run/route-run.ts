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

import { Component, OnInit, OnDestroy } from '@angular/core';

import { RouteService } from '../route/route.service';
import { RouteSet } from '../route/route.set';
import { POIService } from '../poi/poi.service';
import { Site } from '../site/site';
import { filter } from 'rxjs/operators';
import { SelectablePOISet } from '../route/route.poi';

import * as moment from 'moment';
import { RouteRunService } from './route-run.service';
import { Subscription } from 'rxjs';

/**
 * Class to for routes CRUD
 */
@Component({
  selector: 'route-run',
  templateUrl: './route-run.html',
  styleUrls: ['../route/route.scss']
})
export class RouteRun implements OnInit,OnDestroy  {

  // The set of routes
  routes:RouteSet;

  // All the institutions to be diplayed on the map
  institutions:Site[];

  // The POIs 
  POIs: SelectablePOISet;

  // Copy of the currentRouteIndex stored in routes.currentRouteId to prevent losing the 
  //   currentRouteIndex after routes reload
  currentRouteIndex:string;

  private timerSubscription: Subscription;

  constructor(
    protected routeService: RouteService,
    private POIService : POIService,
    private RouteRunService: RouteRunService
  ) {
    this.POIs = new SelectablePOISet();
  }
 
  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    this.loadRoutes();
    //this.timerSubscription = this.RouteRunService.timer10Source.subscribe(val => {this.loadRoutes()});
  }


  /**
   * Enable to load routes that were saved into database
   */
  loadRoutes(){
    // save currentRoute index in case it is defined before reloading
    if(this.routes){
      this.currentRouteIndex = this.routes.currentRouteId;
    }
    this.routes=new RouteSet(this.POIService);
    this.routes.institutions=this.institutions;
    this.routes.bLoading=true;
  
    // Filter ongoing route : route with a driver_hr start dt, without an end dt
    var filters = {onGoingStatus:'S'};

    this.routeService.list(filters).subscribe( routes => this.onRoutesAvailable(routes,false));

  }

    /**
   * When routes are available, load them into this.routes
   * @param routes
   * @param boolean bChanged : whether the set of routes has to be saved to database by user or not
   */
  onRoutesAvailable(routes,bChanged : boolean){
    for(let route of routes){
      this.routes.loadRoute(route,bChanged);
    }
    this.routes.bLoading=false;
    if(this.routes.currentRouteId == undefined || this.routes.currentRouteId == null || this.routes.currentRouteId == ""){
      // restore the current route index if defined
      this.routes.currentRouteId = this.currentRouteIndex;
    }
    this.POIs.fromRoutes(this.routes);
    this.computeDurations();
  }

  updateMap(){ 
    
  }

  displayRoutes(){
    
  }

  computeDurations(){
    for(let route of this.routes.list){
      if( route.start_driver_dt !=null && route.start_driver_dt !=undefined){
        route.start_driver_duration = moment().valueOf() - route.start_driver_dt;
      }
      var bNextPOIFound= false;
      for(let POI of route.POIs){
        if(POI.arrival_dt != undefined && POI.arrival_dt != null){
          // If arrival_dt is in the future, arrival_duration will be negative, 
          POI.arrival_duration = moment().valueOf() - POI.arrival_dt;
        }
        if(POI.visited_dt != undefined && POI.visited_dt != null){
          // If visited_dt is in the future, visited_duration will be negative (should not occur), 
          POI.visited_duration = moment().valueOf() - POI.visited_dt;
        }
        POI.bIsNextPOI=false;
        if(POI.arrival_duration!=undefined && POI.arrival_duration!=null && POI.arrival_duration<0 && !bNextPOIFound){
          bNextPOIFound=true;
          POI.bIsNextPOI=true;
        }
      }
    }
  }
  
  ngOnDestroy() {
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
    }
  }
}
