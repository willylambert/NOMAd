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
import { Site } from '../site/site';
import { Demand } from '../demand/demand';

/**
 * Description on the HR class : the fields listed below all result from hrService.get service.
 */
export class HR extends BaseRecord{
    lastname: string;
    firstname: string;
    gender_th: string;
    gender_code: string;
    gender_label: string;
    birthday_dt: number;
    status_th: string;
    status_code: string;
    status_label: string;
    type_th: string;
    type_code: string;
    type_label: string;
    home:Site
    institutions:Site[];
    transporters:Site[];
    demands:Demand[];
    // Number of demands, in use for the HR list menu
    demands_count:number;
    pickup_duration:number;
    delivery_duration:number;
    // extracted from hr main details table
    crisis_risk: string;
    specific_arrangement: string;
    transportmode_th: string;
    transport_mode_code: string;
    // alert by sms
    phonenumber:string;
    notify_yn:string
    notice_delay:number;

  constructor() {
    super()
    this.institutions=[];
    this.transporters=[];
    this.home = new Site()
  }
}



