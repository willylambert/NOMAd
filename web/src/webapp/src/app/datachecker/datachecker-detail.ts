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
/**
 * Description on the DataChecker class : the fields listed below all result from datacheckerDetailService.get service.
 */
export class DataCheckerDetail extends BaseRecord{
  id: string;
  datachecker_main_id: string;
  label: string;
  dt: number;
  ack_yn: string;
  ack_user_id: string;
  ack_dt: number;
  scenario_main_id: string;
  transport_demand_id: string;
  transport_calendar_id: string;
  transport_route_id: string;
  vehicle_category_id: string;
  site_poi_id: string;
  hr_main_id: string;
  // If a transport calendar is present, the associated date as a timestamp in ms + the timeslot id
  transport_calendar_dt:number;
  transport_calendar_timeslot_th:string;
  scope_th:string;
  scope_code:string;
  level_th:string;
  level_code:string;

  constructor() {
    super()
  }
}