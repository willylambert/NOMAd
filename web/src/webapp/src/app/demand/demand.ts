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

import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BaseRecord } from '../baserecord';
import { POI,TransportPOI } from '../poi/poi';
import { Calendar } from '../calendar/calendar';

/**
 * Description of the Demand class
 */
export class Demand extends BaseRecord{
  // The concerned institution POI, can be the start or the end point depending on the considered timeslot
  // When the considered timeslot belongs to morning, the institution POI will be the end POI
  institutionPOI : POI;
  // The concerned HR POI, can be the start or the end point depending on the considered timeslot
  // When the considered timeslot belongs to morning, the HR POI will be the start POI
  HRPOI : TransportPOI;
  // The concerned timeslots within a week
  timeslots : {timeslot_th:string,bMorning:boolean}[];

  // Whether to use a time window or not
  bPickupTimeWindow : boolean;
  bDeliveryTimeWindow : boolean;

  // Time windows described as unix timestamps in ms, assuming the time window is the same for all morning
  //   timeslots of the same demand and the same for all afteroon timeslots of the same demand.
  pickupStartHour : number;
  pickupEndHour : number;
  deliveryStartHour : number;
  deliveryEndHour : number;

  // The occurrences of the demand in the calendar
  calendars : Calendar[];

  // The validity start date for the demand
  // User defines it once and then it will be used to compute every occurrences for this demand.
  // This is not expressed as a number of ms since we only want to know which day was selected in the calendar.
  // Using a timestamp here without precising the time zone will lead to an ambiguous date (can be yesterday or
  //   tomorrow according to the time zone difference between client and server)
  startDt : NgbDateStruct;
  endDt : NgbDateStruct;

  constructor() {
    super()
    this.timeslots=[];
    this.calendars=[];
  }
}

/**
 * Description of the Demand check result class
 */
export class DemandCheckResult extends Demand{

  // whether the demand is concerned by the check
  bConcerned: boolean;
  // the number of routes found that serve the demand
  routesCount: number;
  
  constructor() {
    super()
  }
}


