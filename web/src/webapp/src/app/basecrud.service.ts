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

import { EventEmitter } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable,Subject } from 'rxjs';
import { map,share } from 'rxjs/operators';

import { environment } from '../environments/environment';

import { BaseRecord } from './baserecord';
import { CrudListResult,CrudGetResult,CrudSaveResult } from './helpers/crud-result';

/**
 Base Class for all Crud Services
**/
export abstract class BaseCrudService {

  constructor(protected http: HttpClient,
              protected serviceObject: string   // Service name : user, vehicle-category, etc.
             ) {}

  /**
   * Generates a rest service URL base on the service name
   * @param service : service name (for instance 'list')
   */
  getURL(service:string):string{
    return environment.restURL+this.serviceObject+'/'+service;
  }

  /**
   * Function that get a list of BaseRecord like objects
   * @param filters : to filter the output list
   * @return Observable<BaseRecord[]> : an observable list of BaseRecord objects
   */
  list(filters): Observable<BaseRecord[]> {
    var ofList = new Subject<BaseRecord[]>();

    return this.http.get(this.getURL('list'),{params:this.toString(filters)}).pipe(
      map(
        (response: CrudListResult) => response.data)
      );


    return ofList;
  }

  /**
   * Function that will get a BaseRecord like object based on its ID
   * @param id : id of the BaseRecord like object to be retrieved
   * @return Observable<BaseRecord> : an observable BaseRecord object
   */
  get(id) : Observable<BaseRecord> {
    var ofGet = new Subject<BaseRecord>();

    this.http.get(this.getURL(id)).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data);
      ofGet.complete();
    });

    return ofGet;
  }

  /**
   * Given a cast a set of filter values to string
   * @param filters : a set of filters
   */
  toString(filters){
    let target: HttpParams = new HttpParams();
    Object.keys(filters).forEach((key: string) => {
      const value: string | number | boolean | Date = filters[key];
      if ((typeof value !== 'undefined') && (value !== null)) {
        target = target.append(key, value.toString());
      }
    });
    return target;
  }

  /**
   * Function that will call server for adding or updating object
   * @param data : object to insert/update
   * @return Observable<CrudSaveResult>
   */
  save(data) : Observable<CrudSaveResult>{
    return this.http.post(this.getURL('save'),data).pipe(share()) as Observable<CrudSaveResult>;
  }

  /**
   * Function that will call server for marking record as removed
   * @param data : the data to be sent for marking as removed
   * @return Observable<boolean> : whether mark as removed succeeded or not
   */
  markAsRemoved(data:BaseRecord) : Observable<boolean>{
    return this.http.post(this.getURL('mark-as-removed'),{id:data.id}) as Observable<boolean>;
  }

  /**
   * Function that will call server for deleting data
   * @param data : the data to be sent for deletion
   * @return Observable<boolean> : whether deletion succeeded or not
   */
  delete(data:BaseRecord) : Observable<boolean>{
    return this.http.post(this.getURL('delete'),{id:data.id}) as Observable<boolean>;
  }

  createRecord() : BaseRecord{
    return;
  }
}