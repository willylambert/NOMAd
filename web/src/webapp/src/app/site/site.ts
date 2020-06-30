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
import { AOI } from '../aoi/aoi';
import { Point } from 'geojson';

export class OpeningHours extends BaseRecord{
  timeslot_th : string;
  timeslot_code : string;
  timeslot_orderdisplay : number;
  timeslot_rec_st : string;
  dayLabel: string;
  start_hr : number;
  end_hr : number;
}

/**
 * Description on the Site class : the fields listed below all result from siteService.get service.
 */
export class Site extends BaseRecord{
  code: string;
  label: string;
  type_th: string;
  type_code: string;
  type_label: string;
  status_th: string;
  status_code: string;
  status_label: string;
  site_main_id_entity: string;
  site_main_code_entity: string;
  site_main_label_entity: string;
  AOIs:AOI[];
  POIs:POI[];
  // Opening hours make sense only for site of type INSTITUTION
  // The indicate the time windows to pick or delivery users
  pickupHours:OpeningHours[];
  deliveryHours:OpeningHours[];
  // Information about the first POI of the site (if defined)
  poi_geom: Point;
  poi_id: string;
  addr1: string;
  addr2: string;
  postcode: string;
  city: string;
  service_duration:number; // milliseconds
  // A color to represent the site on a map
  color:string;
  constructor() {
    super()
    this.AOIs=[];
    this.POIs=[];
    this.pickupHours=[];
    this.deliveryHours=[];
  }

  /**
   * A set of colors for mapping different sites if required.
   * In the current version, a set of 10 colors is provided
   * @param index : a color index between 0 and 9
   * @return string : a CSS color
   */
  static getColor(index){
    var colors = ['darkblue','green','orange','darkred','red','black','cadetblue','purple','blue'];
    if(index<0 || index>9) {
      index = 0;
    }
    return colors[index];
  }
}




