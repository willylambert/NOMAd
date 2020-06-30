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
import { Point } from 'geojson';
import * as L from 'mapbox.js';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';

// The fa-icons
import { faWheelchair,faChild} from '@fortawesome/free-solid-svg-icons';


/**
 * Decription of an entry from the POIs matrix.
 */
export class POIPOI extends BaseRecord {
  site_poi_id_start:string;
  site_poi_id_end:string;
  acceptable_duration:number; // in milliseconds
}

/**
 * Description on the POI class : the fields listed below all result from poiService.get service.
 */
export class POI extends BaseRecord{
  site_main_id: string;
  position: number;
  label: string;
  addr1: string;
  addr2: string;
  postcode :string;
  city :string;
  country_th :string;
  type_th :string;
  site_type_th :string;
  site_type_code :string;
  site_type_label :string;
  service_duration : number; // milliseconds
  geom: Point;
  site_main_label: string;
  // Optional attribute to tell whether the POI is selected or not
  // For instance we can use it to tell whether the POI belongs to a route or not.
  selected:boolean;
  // Matrix that indicates the known relations with other other POIs
  matrix:POIPOI[];

  // If previous  POI in route is at the same coordinates, there is no service duration for this POI
  doNotApplyServiceDuration: boolean;

}

/**
 * Acceptable duration computed between a home POI and an institution POI
 */
export class AcceptableDuration {
  homePOIId : string;
  institutionPOIId : string;
  fromInstitution : number;
  toInstitution : number;
}

/**
 * List of institutions associated to a transport POI
 * Each institution goes with its id, label and some information about its first POI :
 *  - id of the first institution POI,
 *  - acceptable transport durations between the transport POI and the institution POI (from and to)
 */
export class TransportPOIInstitution{
  id:string;
  label:string;
  poi_id:string;
  // In order to get this acceptable duration, we consider only the first POI in the institution
  home_to_institution_acceptable_duration:number;
  institution_to_home_acceptable_duration:number;
}

/**
 * Extension of the POI class to enable information that is specific to HR transport
 */
export class TransportPOI extends POI{
  // In case the POI is associated to a HR, here is a set of information about this HR
  hr_lastname:string;
  hr_firstname:string;
  hr_gender_label:string;
  hr_birthday_dt:number;
  hr_crisis_risk:string;
  hr_specific_arrangement:string;
  hr_pickup_duration:number;
  hr_delivery_duration:number;
  hr_id:string;
  // The HR transport mode
  transport_mode_code:string;
  // The list of institutions the HR is attached to
  institutions:TransportPOIInstitution[];
  // In case the POI is associated to a transport_demand, here is the transport_demand information
  transport_demand_id:string;
  transport_demand_institution_id:string;
  transport_demand_institution_label:string;
  transport_demand_institution_poi_id:string;
  // The estimated duration between the home poi and the institution involved by the transport demand
  home_to_institution_duration:number;
  // The corresponding id is site_poisitepoi table
  home_to_institution_id:string;
  // The estimated duration between the the institution involved by the transport demand and the home poi
  institution_to_home_duration:number;
  // The corresponding id is site_poisitepoi table
  institution_to_home_id:string;
  // The acceptable duration between the home poi and the institution involved by the transport demand
  home_to_institution_acceptable_duration:number;
  // The acceptable duration between the the institution involved by the transport demand and the home poi
  institution_to_home_acceptable_duration:number;
  // Whether to use a time window or not
  bPickupTimeWindow : boolean;
  bDeliveryTimeWindow : boolean;
  // Time windows are given in ms
  pickupStartHour:number;
  pickupEndHour:number;
  deliveryStartHour:number;
  deliveryEndHour:number;
  // The acceptable duration in milliseconds between the POI and the corresponding institution POI.
  // If the POI is associated to a transport demand, the acceptable duration is computed between
  //   the POIs involved in the transport demand, and the direction between the POIs is involved by
  //   the transport_demand.
  // If the POI is not associated to a transport demand, we consider the closest matching institution
  //   and the first POI for this institution
  acceptableDuration:number;

  faWheelchair = faWheelchair;
  faChild = faChild;

  /**
   *
   */
  constructor(){
    super();
  }

  /**
   * Get a HTML with the PNG icon corresponding to the POI
   * @return string : some HTML code with a PNG icon
   */
  getPNGIcon() : string{
    var icon = '';
    if(this.site_type_code=='HOME'){
      if(this.transport_mode_code=='FAUTEUIL'){
        icon = '<img src="assets/img/wheelchair_icon.png"></img>'
      }
      else{
        if(this.transport_mode_code=='MARCHANT'){
          icon = '<img src="assets/img/child_icon.png"></img>'
        }
      }
    }
    if(this.site_type_code=='INSTITUTION'){
      icon = '<img src="assets/img/hospital_icon.png"></img>'
    }
    if(this.site_type_code=='TRANSPORTER'){
      icon = '<img src="assets/img/shuttleVan_icon.png"></img>'
    }
    return icon;
  }

  /**
   * Get a HTML with the SVG icon corresponding to the POI
   * @param color : string : the color for the icon
   * @param bSelected : boolean : whether to get the SVG icon for a selected POI or a non-selected POI
   * @return string : some HTML code with a SVG icon
   */
  getSVGIcon(color,bSelected){
    // SVGs in use here are inspired by font-awesome SVGs
    var icon;
    var svgChild = "<svg height='25' width='25' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'><path fill='"+color+"' d='M 120 72 c 0 -39.765 32.235 -72 72 -72 s 72 32.235 72 72 c 0 39.764 -32.235 72 -72 72 s -72 -32.236 -72 -72 Z m 254.627 1.373 c -12.496 -12.497 -32.758 -12.497 -45.254 0 L 242.745 160 H 141.254 L 54.627 73.373 c -12.496 -12.497 -32.758 -12.497 -45.254 0 c -12.497 12.497 -12.497 32.758 0 45.255 L 104 213.254 V 480 c 0 17.673 14.327 32 32 32 h 16 c 17.673 0 32 -14.327 32 -32 V 368 h 16 v 112 c 0 17.673 14.327 32 32 32 h 16 c 17.673 0 32 -14.327 32 -32 V 213.254 l 94.627 -94.627 c 12.497 -12.497 12.497 -32.757 0 -45.254 Z'/></svg>";
    // enlarge viewbox to account for stroke width
    var svgChildLight = "<svg height='25' width='25' viewBox='-50 -50 600 600' xmlns='http://www.w3.org/2000/svg'><path fill='"+color+"' fill-opacity='0.3' stroke='"+color+"' stroke-width='30' d='M 120 72 c 0 -39.765 32.235 -72 72 -72 s 72 32.235 72 72 c 0 39.764 -32.235 72 -72 72 s -72 -32.236 -72 -72 Z m 254.627 1.373 c -12.496 -12.497 -32.758 -12.497 -45.254 0 L 242.745 160 H 141.254 L 54.627 73.373 c -12.496 -12.497 -32.758 -12.497 -45.254 0 c -12.497 12.497 -12.497 32.758 0 45.255 L 104 213.254 V 480 c 0 17.673 14.327 32 32 32 h 16 c 17.673 0 32 -14.327 32 -32 V 368 h 16 v 112 c 0 17.673 14.327 32 32 32 h 16 c 17.673 0 32 -14.327 32 -32 V 213.254 l 94.627 -94.627 c 12.497 -12.497 12.497 -32.757 0 -45.254 Z'/></svg>"
    var svgWheelchair = "<svg height='25' width='25' viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'><path fill='"+color+"' d='M 496.101 385.669 l 14.227 28.663 c 3.929 7.915 0.697 17.516 -7.218 21.445 l -65.465 32.886 c -16.049 7.967 -35.556 1.194 -43.189 -15.055 L 331.679 320 H 192 c -15.925 0 -29.426 -11.71 -31.679 -27.475 C 126.433 55.308 128.38 70.044 128 64 c 0 -36.358 30.318 -65.635 67.052 -63.929 c 33.271 1.545 60.048 28.905 60.925 62.201 c 0.868 32.933 -23.152 60.423 -54.608 65.039 l 4.67 32.69 H 336 c 8.837 0 16 7.163 16 16 v 32 c 0 8.837 -7.163 16 -16 16 H 215.182 l 4.572 32 H 352 a 32 32 0 0 1 28.962 18.392 L 438.477 396.8 l 36.178 -18.349 c 7.915 -3.929 17.517 -0.697 21.446 7.218 Z M 311.358 352 h -24.506 c -7.788 54.204 -54.528 96 -110.852 96 c -61.757 0 -112 -50.243 -112 -112 c 0 -41.505 22.694 -77.809 56.324 -97.156 c -3.712 -25.965 -6.844 -47.86 -9.488 -66.333 C 45.956 198.464 0 261.963 0 336 c 0 97.047 78.953 176 176 176 c 71.87 0 133.806 -43.308 161.11 -105.192 L 311.358 352 Z'/></svg>"
    // enlarge viewbox to account for stroke width
    var svgWheelchairLight = "<svg height='25' width='25' viewBox='-50 -50 600 600' xmlns='http://www.w3.org/2000/svg'><path fill='"+color+"' fill-opacity='0.3' stroke='"+color+"' stroke-width='30' d='M 496.101 385.669 l 14.227 28.663 c 3.929 7.915 0.697 17.516 -7.218 21.445 l -65.465 32.886 c -16.049 7.967 -35.556 1.194 -43.189 -15.055 L 331.679 320 H 192 c -15.925 0 -29.426 -11.71 -31.679 -27.475 C 126.433 55.308 128.38 70.044 128 64 c 0 -36.358 30.318 -65.635 67.052 -63.929 c 33.271 1.545 60.048 28.905 60.925 62.201 c 0.868 32.933 -23.152 60.423 -54.608 65.039 l 4.67 32.69 H 336 c 8.837 0 16 7.163 16 16 v 32 c 0 8.837 -7.163 16 -16 16 H 215.182 l 4.572 32 H 352 a 32 32 0 0 1 28.962 18.392 L 438.477 396.8 l 36.178 -18.349 c 7.915 -3.929 17.517 -0.697 21.446 7.218 Z M 311.358 352 h -24.506 c -7.788 54.204 -54.528 96 -110.852 96 c -61.757 0 -112 -50.243 -112 -112 c 0 -41.505 22.694 -77.809 56.324 -97.156 c -3.712 -25.965 -6.844 -47.86 -9.488 -66.333 C 45.956 198.464 0 261.963 0 336 c 0 97.047 78.953 176 176 176 c 71.87 0 133.806 -43.308 161.11 -105.192 L 311.358 352 Z'/></svg>"
    if(bSelected){
      if(this.transport_mode_code=='FAUTEUIL'){
        var url = encodeURI("data:image/svg+xml," + svgWheelchair).replace('#','%23');
        icon = new L.Icon({iconUrl: url,iconSize: [25, 25],iconAnchor: [12, 12]})
      }
      else{
        var url = encodeURI("data:image/svg+xml," + svgChild).replace('#','%23');
        icon = new L.Icon({iconUrl: url,iconSize: [25, 25],iconAnchor: [12, 12]})
      }
    }
    else{
      if(this.transport_mode_code=='FAUTEUIL'){
        var url = encodeURI("data:image/svg+xml," + svgWheelchairLight).replace('#','%23');
        icon = new L.Icon({iconUrl: url,iconSize: [25, 25],iconAnchor: [12, 12]})
      }
      else{
        var url = encodeURI("data:image/svg+xml," + svgChildLight).replace('#','%23');
        icon = new L.Icon({iconUrl: url,iconSize: [25, 25],iconAnchor: [12, 12]})
      }
    }
    return icon;
  }

  /**
   * Get a Font Awesome Icon corresponding to the POI
   * @param color : string : the color for the icon
   * @return FontAwesomeIcon : a font awesome icon
   */
  getFAIcon(color){
    var icon;
    if(this.transport_mode_code=='FAUTEUIL'){
      icon = new FontAwesomeIcon({icon:faWheelchair,markerColor:color})
    }
    else{
      icon = new FontAwesomeIcon({icon:faChild,markerColor:color})
    }
    return icon;
  }

  /**
   * Check that the input institution belongs to the POI institutions list
   * @param institutionId string : input institution to be tested against the POI institutions
   * @return boolean : whether the input institution is found among the POI institutions
   */
  matchesInstitutions(institutionId:string) : boolean{
    var bInstitutionFound=false;
    for(let institution of this.institutions){
      if(institution.id==institutionId){
        bInstitutionFound=true;
        break;
      }
    }
    return bInstitutionFound;
  }

  /**
   * Compute a color for the POI
   * @param institutionWithColors : Site[] : a set of known institution ids, to know the existing colors
   * @return string : a CSS color
   */
  getColor(institutionWithColors:Site[]){
    var sColor = "";
    if(this.site_type_code=='HOME'){
      if(this.transport_demand_institution_id){
        // The POI corresponds to a transport demand
        for(var i=0; i<institutionWithColors.length; i++){
          if(institutionWithColors[i].id == this.transport_demand_institution_id){
            sColor = Site.getColor(i);
            break;
          }
        }
      }
      else{
        // The POI corresponds to a hr-home, so it may be linked to several institutions
        // In that case we use the color for the first found institution
        for(let institution of this.institutions){
          for(var i=0; i<institutionWithColors.length; i++){
            if(institutionWithColors[i].id == institution.id){
              sColor = Site.getColor(i);
              break;
            }
          }
          if(sColor!=""){
            break;
          }
        }
      }
    }
    else{
      // The POI corresponds to an institution
      for(var i=0; i<institutionWithColors.length; i++){
        if(institutionWithColors[i].id == this.site_main_id){
          sColor = Site.getColor(i);
          break;
        }
      }
    }
    // In case no color is found, provide one by default.
    if(sColor==""){
      sColor="hotpink";
    }
    return sColor;
  }

  /**
   * Copy some fields from a Transport POI into this
   * @param POI :TransportPOI
   */
  copyFromPOI(POI:TransportPOI){
    this.transport_mode_code=POI.transport_mode_code;
    this.site_type_code=POI.site_type_code;
    this.site_main_id=POI.site_main_id;
    this.transport_demand_institution_id=POI.transport_demand_institution_id;
    this.institutions=POI.institutions;
  }

  /**
   * Copy some fields from an institution Site into this
   * @param institution:Site
   */
  copyFromInstitution(institution:Site){
    this.site_type_code=institution.type_code;
    this.site_main_id=institution.id;
    this.label=institution.label;
    this.id=institution.poi_id;
  }
}
