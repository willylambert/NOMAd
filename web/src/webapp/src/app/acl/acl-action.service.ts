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
import { Observable,of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { BaseCrudService } from '../basecrud.service';

import { AclAction } from './acl-action';
import { CrudResult } from '../helpers/crud-result';
import { CacheService } from '../helpers/cache-service';

@Injectable({
  providedIn: 'root'
})
export class AclActionService extends BaseCrudService{

  constructor(protected http: HttpClient,
              protected cacheService: CacheService) { 
    super(http,"aclaction");
    this.cacheService.addUrlToCache(this.getURL("has-access"));
  }

  /**
  * List ACL actions
  */
  list(filters : {} ) : Observable<AclAction[]>{
    return super.list(filters) as Observable<AclAction[]>;
  }

  userHasAccess(userId: string,action: string) : Observable<CrudResult>{
    let params = {userId:userId,action:action};
    return this.http.get(this.getURL("has-access"),{params:this.toString(params)}) as Observable<CrudResult>;
  }

}