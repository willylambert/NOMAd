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

import { Injectable } from '@angular/core';
import { Observable,Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../basecrud.service';
import { CrudListResult,CrudResult,CrudSaveResult } from '../helpers/crud-result';
import { AcceptableDuration,POI,TransportPOI } from './poi';
import { Site } from '../site/site';
import { Demand } from '../demand/demand';

@Injectable({
  providedIn: 'root'
})
export class POIService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"poi") }

  /**
   * Turn a list of sites into a semicolon-separated string containing the sites ids.
   * @param sites Site[] : an array of sites
   * @return string : the sites ids separated by semicolon characters
   */
  sitesToString(sites : Site[]) : string {
    // Turn institutions id list into a semicolon (;) separated string
    var sResult : string = "";
    for(let site of sites){
      if(sResult!=""){
        sResult+=";";
      }
      sResult+=site.id;
    }
    return sResult
  }

  /**
  * Get a list of POIs. The following [optional] filters are available :
  *   siteId : restrict the POI search to a specific site
  *   siteType : restrict the POI search to a specific site type
  *   hrId : restrict the POI search to institutions POIs and to institutions attached to a specific HR
  *   siteStatus : restrict the POI search to a specific site status
  * @param filters : search filters
  */
  list(filters : {siteId : string, siteType : string, hrId : string,siteStatus:string} ) : Observable<POI[]>{
    return super.list(filters) as Observable<POI[]>;
  }

  /**
   * List the transport POIs corresponding to the provided list of institution ids.
   * @param institutions Site[] : list of institutions
   * @param sPattern string : research patterns on the HR lastname and firstname
   * @param bOnlyActiveHRs boolean : whether to look only for POIs associated to active HRs
   * @return Observable<TransportPOI[]> : observable list of TransportPOIs corresponding to the institutions
   */
  listTransportPOIs(institutions : Site[],sPattern:string,bOnlyActiveHRs:boolean) : Observable<TransportPOI[]> {
    var ofList = new Subject<TransportPOI[]>();
    this.http.get(this.getURL('list/transport'),{params:this.toString({
      institutions:this.sitesToString(institutions),
      pattern:sPattern,
      bOnlyActiveHRs:bOnlyActiveHRs
    })})
             .subscribe(
               (response: CrudListResult) => {
                 ofList.next(response.data as TransportPOI[]);
               });
    return ofList;
  }

  /**
  * Get a POI base on its id
  * @param POIId : the POI id
  */
  get(POIId) : Observable<POI> {
    return super.get(POIId) as Observable<POI>;
  }

  createRecord() : POI{
    return new POI();
  }

  /**
   * Call a reverse geocoder to find a POI address from a location
   * @param position : a latitude and a longitude
   */
  reverseGeocode(position : {lat:number,lng:number}) : Observable<CrudResult> {
    return this.http.get(this.getURL('reverse-geocode'),{params:this.toString(position)}) as Observable<CrudResult>;
  }

  /**
   * Update a POI service duration
   * @param data POI : the POI for which we need update the service duration
   */
  updateServiceDuration(data : POI): Observable<CrudSaveResult>{
    return this.http.post(this.getURL('update-service-duration'),data).pipe(share()) as Observable<CrudSaveResult>;
  }

  /**
   * Find the acceptable duration for a set of HR POIs represented by their ids
   * @param POIs string[] : an array of POI ids
   */
  updateAcceptableDurations(POIs : string[]) : Observable<{id:string,acceptableDurations:AcceptableDuration[]}[]>{
    var ofList = new Subject<{id:string,acceptableDurations:AcceptableDuration[]}[]>();
    this.http.post(this.getURL('update-acceptable-durations'),POIs)
         .subscribe(
           (response: CrudResult) => {
             ofList.next(response.data as {id:string,acceptableDurations:AcceptableDuration[]}[]);
           });
    return ofList;
  }

  /**
   * Find the acceptable durations for a location compared to a set of locations
   * All location coordinates must be provided in mapbox directions style (longitude,latitude)
   * @param poiCoordinates string : coordinates of the point for which we need compute an acceptable travel duration
   * @param institutionsCoordinates string: coordinates of the possible destination or orgins (using ; as a delimiter)
   * @param institutionsIds string: POI ids of the possible destination or orgins (using ; as a delimiter)
   */
  getAcceptableDurations(poiCoordinates : string, institutionsCoordinates:string, institutionsIds:string) : Observable<AcceptableDuration[]>{
    var ofList = new Subject<AcceptableDuration[]>();
    this.http.get(this.getURL('acceptable-durations'),{ params:this.toString({
      poiCoordinates:poiCoordinates,
      institutionsCoordinates:institutionsCoordinates,
      institutionsIds:institutionsIds
    })}).subscribe( (response: CrudResult) => {
      ofList.next(response.data as AcceptableDuration[]);
    });
    return ofList;
  }

  /**
   * Save a collection of acceptable duration to database
   * The id of the items from site_poisitepoi are directly provided as an input
   * @param acceptable_durations {id:string,acceptable_duration:number}[], where the durations are expressed in ms
   * @return Observable<CrudResult> where the field returned by the promise if a boolean
   */
  setAcceptableDurations(acceptable_durations : {id:string,acceptable_duration:number}[]) : Observable<CrudResult>{
    var ofList = new Subject<CrudResult>();
    this.http.post(this.getURL('save-acceptable-durations'),acceptable_durations)
         .subscribe(
           (response: CrudResult) => {
             ofList.next(response.data as CrudResult);
           });
    return ofList;
  }
  
}

