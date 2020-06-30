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
import { Observable, of } from 'rxjs';
import { share } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BaseCrudService } from '../basecrud.service';

import { User } from './user';
import { CrudSaveResult } from '../helpers/crud-result';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"user") }

  /**
  * Get a list of users. The following [optional] filters are available :
  *   typeCodes : user types (see USER_MAIN_TYPE category in thesaurus), comma separated code
  *   search : serch pattern to apply on login, firstname and lastname
  * @param filters : search filters
  */
  list(filters : {typeCodes:string, search:string} ) : Observable<User[]>{
    return super.list(filters) as Observable<User[]>;
  }

  save(user : User){
    return super.save(user) as Observable<CrudSaveResult>;
  }

  updatePassword(user : User) : Observable<CrudSaveResult>{
    return this.http.post(this.getURL('update-password'),user).pipe(share()) as Observable<CrudSaveResult>;
  }

  createRecord(){
    return new User();
  }

}
