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

import { BaseRecord } from '../baserecord';
import { Group } from '../group/group';
import { VehicleCategory } from '../vehicle-category/vehicle-category';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { TransportPOI } from '../poi/poi';

/*
 * The association between a transport group and a scenario
 * In the current version, there is no additional information (apart from the id and rec_st inherited from BaseRecord)
 */
export class ScenarioTransportGroup extends BaseRecord{
  data:Group;
  /**
   * Default constructor
   */
  constructor() {
    super()
    this.data=new Group();
  }
}

/*
 * The association between a vehicle category and a scenario
 */
export class ScenarioVehicleCategory extends BaseRecord{
  data:VehicleCategory;
  // The number of authorized vehicles in this scenario for this vehicle category
  quantity:number;
  // Whether the number of authorized vehicles in this scenario for this vehicle category is unlimited or not.
  // When unlimited, quantity field becomes useless.
  unlimited:boolean;
  /**
   * Default constructor
   */
  constructor() {
    super()
    this.data=new VehicleCategory();
  }
}

/**
 * Description on the Scenario class : the fields listed below all result from scenarioService.get service.
 */
export class Scenario extends BaseRecord{
  code:string;
  label:string;
  status_th:string;
  status_code:string;
  status_label:string;
  need_calendar_update_yn:string;

  // The validity start date for the scenario
  // This is not expressed as a number of ms since we only want to know which day was selected in the calendar.
  // Using a timestamp here without precising the time zone will lead to an ambiguous date (can be yesterday or
  //   tomorrow according to the time zone difference between client and server)
  startDt : NgbDateStruct;
  endDt : NgbDateStruct;

  // Groups of transport demands
  groups:ScenarioTransportGroup[];
  // List of vehicle categories associated to the scenario, with the max. number of vehicles that
  //   we can use from each vehicle category
  fleet:ScenarioVehicleCategory[];

  // Shortcut for counting the number of involved HRs, associated with transport mode code
  HRs:{id:string;hr_id:string;transport_mode_code:string}[];
  // Shortcut for accessing the list of transport demands
  demands:{id:string;hr_id:string;transport_mode_code:string}[];

  /**
   * Default constructor
   */
  constructor() {
    super()
    this.groups=[];
    this.fleet=[];
    this.HRs=[];
    this.demands=[];
  }
}

/**
 * Class for the selected days in the scencario day selector
 */
export class ScenarioSelectedDay {
  // The date as NgbDateStruct (year, month number [1-12], day number [1-31])
  data:NgbDateStruct;
  // The week day as string (using locale)
  weekDay:string;
  // The month as string (using locale)
  month:string;
  // timestamp belonging to the day and that enables to sort days chronologically
  timestamp:number
};

/**
 * Class for the selectable days in the scenario day selector
 */
export class ScenarioSelectableDay extends ScenarioSelectedDay{
  // Whether the day is selected or not
  selected:boolean;  
}

/**
 * The way a scenario will be propagated
 */
export class CopyMode{
  code:string;
  label:string;
  selected:boolean
}

/**
 * The necessary information to retrieve the information for the scenario route CRUD page
 */
export class ScenarioFilter {
  // The scenario id
  scenarioMain:Scenario;
  // the concerned calendar dt (epxressed at midnight server time in ms)
  calendarDt : number;
  // the concerned time slot id
  timeSlotId : string;
  // used by listRoutes from scenario
  routeStartDt : number;
  routeEndDt : number;
}

/**
 * The data for copying routes of a scenario from one half day to a set of half days
 */
export class ScenarioCopy extends ScenarioFilter{
  // The target list of days
  selectedDays:ScenarioSelectedDay[];
  // The way a scenario will be propagated
  copyMode:CopyMode;
  // A restriction to a set of routes belonging to the scenario
  selectedRouteIDs:{id:string}[];
}

/**
 * Structures describing a scenario minimap.
 */
export class ScenarioDay{
  // Day label
  label:string;
  // Whether there is a route or not in the morining or afternoon timeslot for the considered scenario
  AM:boolean;
  PM:boolean;
}
export class ScenarioInstitution{
  // Institution label
  label:string;
  weekDays:ScenarioDay[]
}
export class ScenarioDemands{
  withDemands: ScenarioInstitution[];
  withoutDemands: ScenarioInstitution[];
}
