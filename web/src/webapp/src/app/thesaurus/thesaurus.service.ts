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
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../basecrud.service';
import { ThesaurusItem } from './thesaurus';
import { CrudResult } from '../helpers/crud-result';

@Injectable({
  providedIn: 'root'
})
export class ThesaurusService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"thesaurus") }

  /**
  * Get a list of thseaurus items. The following [optional] filters are available :
  *   cat : the concerned thesaurus category
  * @param filters : search filters
  */
  list(filters : {cat: string} ) : Observable<ThesaurusItem[]>{
    return super.list(filters) as Observable<ThesaurusItem[]>;
  }

  /**
  * Get a thesaurus item base on its id
  * @param thesaurusId : the thesaurus item id
  */
  get(thesaurusId) : Observable<ThesaurusItem> {
    return super.get(thesaurusId) as Observable<ThesaurusItem>;
  }

  /**
  * Knowing a thesaurus id, try to know whether this corresponds to a forward route or not
  * @param thesaurusId : the thesaurus item id
  */
  isMorning(thesaurusId) : Observable<boolean> {
    var ofGet = new Subject<boolean>();
    this.http.get(this.getURL('is-morning/'+thesaurusId)).subscribe( (response: CrudResult) => {
      ofGet.next(response.data as boolean);
      ofGet.complete();
    });
    return ofGet;
  }

}