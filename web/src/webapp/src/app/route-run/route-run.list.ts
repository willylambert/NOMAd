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

import { Component,Input,Output,EventEmitter } from '@angular/core';

// The fa-icons
import { faEuroSign,faLeaf,faTimes,faPen,faWheelchair,faChild,faHospital,faPlay,faMapMarker,faRoad,faShuttleVan,faSave,faPause,faRoute,faClock,faCheck} from '@fortawesome/free-solid-svg-icons';
import { Route } from '../route/route';
import { RouteSet } from '../route//route.set';
import { RouteService } from '../route/route.service';
import { Site } from '../site/site';

import { POIService } from '../poi/poi.service';
import { CrudResult, RestResult } from '../helpers/crud-result';

/**
 * Class for routes list inside the route crud
 */
@Component({
  selector: 'route-run-list',
  templateUrl: './route-run.list.html',
  styleUrls: ['../route/route.scss','route-run.scss']
})
export class RouteRunList{

  // All the institutions to be diplayed on the map
  @Input('involvedInstitutions') involvedInstitutions:Site[];

  // The set of routes
  @Input('routes') routes:RouteSet;

  @Output() routeChange = new EventEmitter();
  @Output() routeDisplayToggle = new EventEmitter();

  // The fa icons
  faTimes=faTimes;
  faPen=faPen;
  faWheelchair = faWheelchair;
  faChild = faChild;
  faHospital= faHospital;
  faPlay= faPlay;
  faPause= faPause;
  faMapMarker = faMapMarker;
  faRoad = faRoad;
  faShuttleVan = faShuttleVan;
  faSave = faSave;
  faRoute = faRoute;
  faClock = faClock;
  faEuroSign = faEuroSign;
  faLeaf = faLeaf;
  faCheck = faCheck;

  constructor(
    private POIService : POIService,
    private routeService: RouteService
  ) {
  }

  /**
   * Change the active route and update the map
   * @param route Route
   */
  changeRoute(route : Route){
    if(route.routeId!=this.routes.currentRouteId){
      this.routes.currentRouteId = route.routeId;
    }else{
      // Unselect current route
      this.routes.currentRouteId = null;
    }
    this.routeChange.emit();
  }

  /**
   * mark all step as unvisited
   * @param route Route* 
   */
  restartRoute(route : Route){

  }

  /**
   * mark route as ended
   * @param route Route
   */
  endRoute(route : Route){
    this.routeService.end(route.id).subscribe( (response: CrudResult) => {
      route.bHide = (response.result == RestResult.Ok);
    });
  }

  /**
   * mark route as ended
   * @param route Route
   */
  resetRouteProgression(route : Route){
    this.routeService.resetProgression(route.id).subscribe( (response: CrudResult) => {
      route.bHide = (response.result == RestResult.Ok);
    });
  }

  /**
   * Prevent from route folding when clicking on a button with a route panel
   * @param event Event : a click event for which we want to ignore default behavior
   */
  preventRouteFolding(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
  }

}
