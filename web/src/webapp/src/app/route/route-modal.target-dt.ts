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

import { Component,Input, OnInit  } from '@angular/core';

import { NgbActiveModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { RoutePOI } from './route.poi';
import { Route } from './route';

@Component({
  templateUrl: './route-modal.target-dt.html',
})
export class RouteModalTargetDt implements OnInit{

  @Input('POI') POI: RoutePOI;
  @Input('route') route: Route;

  // user-defined date in seconds (local time)
  manualDt:NgbTimeStruct;

  constructor(public activeModal: NgbActiveModal){
  }

  /**
   * Convert a local timestamp expressed in ms into a ngbTimeStruct
   * @param localTimeStampMs : number : a local time stamp is ms
   * @return NgbTimeStruct the same hour converted into a NgbTimeStruct
   */
  localTimeStampToNgbTimeStruct(localTimeStampMs) : NgbTimeStruct{
    var hours = Math.floor(localTimeStampMs/3600000);
    var minutes = Math.floor((localTimeStampMs-hours*3600000)/60000);
    var seconds = Math.floor((localTimeStampMs-hours*3600000-minutes*60000)/1000);
    return {hour:hours,minute:minutes,second:seconds} as NgbTimeStruct;
  }

  ngOnInit(){
    if(this.POI.target_hr==undefined || this.POI.target_hr == null){
      if(this.POI.routeInfo !=undefined && this.POI.routeInfo!=null && this.POI.routeInfo.startTime !=undefined && this.POI.routeInfo.startTime!=null){
        this.manualDt = this.localTimeStampToNgbTimeStruct(this.POI.routeInfo.startTime*1000);
      }
    }
    else{
      this.manualDt = this.localTimeStampToNgbTimeStruct(this.POI.target_hr);
    }
  }

  validate(){
    var localTimeMs;
    if(this.manualDt!=undefined){
      localTimeMs=3600000*this.manualDt.hour + 60000*this.manualDt.minute + 1000*this.manualDt.second
    }
    this.activeModal.close(localTimeMs);
  }

}