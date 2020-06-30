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
import { HttpClient } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { BaseCrudService } from '../basecrud.service';
import { CrudResult } from '../helpers/crud-result';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Scenario } from '../scenario/scenario';
import { Calendar } from './calendar';
import { share } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CalendarService extends BaseCrudService{

  constructor(protected http: HttpClient) { super(http,"calendar") }

  getCalendarDt(date : NgbDateStruct){
    var ofGet = new Subject<number>();
    this.http.get(this.getURL('to-timestamp'),{params:this.toString({
        year:date.year,
        month:date.month,
        day:date.day
      })})
      .subscribe((response: CrudResult) => {
        ofGet.next(response.data as number);
        ofGet.complete();
      });
      return ofGet;
  }

  /**
   * List the items from transport_calendar on a scenario provided the scenario id, a calendar date and a timeslot id.
   * @param filters {timeSlotId:string,calendarDt:number,scenarioMain:Scenario} : data to specialize the check
   * @return Observable<Calendar[]> : the check report
   */
  list(filters:{timeSlotId:string,calendarDt:number,scenarioMain:Scenario}){
    // The response is supposed ex
    var ofList = new Subject<Calendar[]>();
    this.http.get(this.getURL('list'),{params:this.toString({
      startDt:filters.calendarDt,
      endDt:filters.calendarDt+86400*1000,
      scenarioMainId:filters.scenarioMain.id,
      timeSlotId:filters.timeSlotId
    })})
    .subscribe((response: CrudResult) => {
      ofList.next(response.data as Calendar[]);
    });
    return ofList;
  }

  /**
   * Update the transport calendars for one scenario
   * The function accepts some input filters in data input parameter, with the following fields:
   *   scenarioMainId : mandatory : the target scenario id
   *   calendarDt : optional, must be provided if timeSlotId is provided : target calendar date, expressed at midnight server time
   *   timeSlotId : optional, must be provided if calendarDt is provided : target timeslot ID
   * @param data { scenarioMainId : string, calendarDt : number, timeSlotId : string }
   */
  update(data : { scenarioMainId : string, calendarDt : number, timeSlotId : string } ) : Observable<CrudResult>{
    return this.http.post(this.getURL('update'),data).pipe(share()) as Observable<CrudResult>;
  }

  setStatus(data : { id : string, status_code : string } ) : Observable<CrudResult>{
    return this.http.post(this.getURL('set-status'),data).pipe(share()) as Observable<CrudResult>;
  }

}


