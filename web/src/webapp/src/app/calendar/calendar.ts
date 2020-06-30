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
import { POI } from '../poi/poi';
import { Route } from '../route/route';
import { first } from 'rxjs/operators';

/**
 * Description of the Calendar class
 */
export class Calendar extends BaseRecord{
  transport_demand_id : string;
  timeslot_th : string;
  HRPOI : POI;
  institutionPOI : POI;
  manually_updated_yn : string;
  transport_calendar_status_code : string;
  // Date of the calendar, expressed in ms
  // Should correspond to midnight GMT or server time
  date_dt : number;

  // Number of times demand is served for a given scenario / date / slot
  serviceCount:number;

  // List of routes
  routes:Route[];

}