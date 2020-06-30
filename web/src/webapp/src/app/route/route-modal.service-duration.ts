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

import { Component,Input  } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { RoutePOI } from './route.poi';

@Component({
  templateUrl: './route-modal.service-duration.html',
})
export class RouteModalServiceDuration {

  @Input('POI') POI: RoutePOI;

  // Service duration in minutes
  serviceDuration:number;
  // Waiting duration before reaching the POI, in minutes
  waitingDuration:number;
  // pickup duration for all users that are picked on the POI, in minutes
  pickupDuration:number;
  // delivery duration for all users that are delivery on the POI, in minutes
  deliveryDuration:number;

  constructor(public activeModal: NgbActiveModal){
    this.serviceDuration=0;
    this.waitingDuration=0;
    this.pickupDuration=0;
    this.deliveryDuration=0;
  }

  validate(){
    // Convert minutes into milliseconds
    this.POI.service_duration=this.serviceDuration*60000;
    this.POI.waiting_duration=this.waitingDuration*60000;
    this.activeModal.close(true);
  }
}