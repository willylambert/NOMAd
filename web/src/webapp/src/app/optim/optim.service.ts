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

import { Injectable,OnDestroy } from '@angular/core';
import { Observable,Subject, Subscription, timer } from 'rxjs';
import { share } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { BaseCrudService } from '../basecrud.service';
import { Optim, OptimOptions } from './optim';
import { CrudGetResult } from '../helpers/crud-result';
import { Site } from '../site/site';
import { Scenario } from '../scenario/scenario';
import { CrudResult } from '../helpers/crud-result';
import { Route } from '../route/route';
import { AclActionService } from '../acl/acl-action.service';

@Injectable({
  providedIn: 'root'
})
export class OptimService extends BaseCrudService implements OnDestroy{

  private timerSubscription: Subscription;

  // Timer that will be triggered every 10 seconds (for processing FIFO)
  public timer10Source:any;

  // Timer that will be triggered every 2 seconds (for optim-list refreshing)
  public timer2Source:any;

  // Timer that will be triggered every seconds
  public timer1Source:any;

  public processFifoInProgress: boolean;

  public optimServerStatus: string; // 'connected' or 'unreachable'

  constructor(protected http: HttpClient,
    private aclService: AclActionService) {
    super(http,"optim")
    // Launch a timer that will tick every 10 seconds.
    // That timer will enable to set automatical checks to the progress of optimization jobs
    this.timer10Source = timer(1000, 10000);
    // The following check enables to make sur that the optimization FIFO will be processed (or requested to
    //   process) every 10 seconds after optimService instanciation.
    // TODO : I think we should launch that subscription from another location, for instance
    //        in the authentication service
    // Check that the current user has access to '/optim/process-fifo' before launching
    //   the polling over that rest service
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.aclService.userHasAccess(currentUser.user_main_id,'/optim/process-fifo').subscribe((response: CrudResult) => {
      if(response.data){
        this.timerSubscription = this.timer10Source.subscribe(val => this.processFIFO());
      }
    });

    this.timer2Source = timer(5000, 5000);
    this.timer1Source = timer(3000, 3000);

    this.processFifoInProgress = false;

  }

  list(filters : {
    search:string,
    descendingOrder:boolean,
    status_code:string,
    scenarioMainId:string,
    timeSlotId:string,
    calendarDt:number,
    nbDays:number
  }) : Observable<Optim[]>{
    return super.list(filters) as Observable<Optim[]>;
  }

  createRecord() : Optim{
    return new Optim();
  }

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

  // Creation of an instance from a set of routes
  fromRoutes(
    filters:{timeSlotId:string,scenarioMain:Scenario,institutions:Site[]},
    options:OptimOptions
  ): Observable<Optim>{
    var ofGet = new Subject<Optim>();
    // Format the route filters before sending to server
    this.http.post(this.getURL('from-routes'),{
      institutions:this.sitesToString(filters.institutions),
      timeSlotId:filters.timeSlotId,
      scenarioMainId:filters.scenarioMain.id,
      options:options
    }).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data as Optim);
      ofGet.complete();
    });
    return ofGet;
  }

  // Creation of an instance from a scenario
  fromScenario(
    filters:{timeSlotId:string,scenarioMain:Scenario,calendarDt:number},
    options:OptimOptions
  ): Observable<Optim>{
    var ofGet = new Subject<Optim>();
    // Format the filters before sending to server
    this.http.post(this.getURL('from-scenario'),{
      calendarDt:filters.calendarDt,
      timeSlotId:filters.timeSlotId,
      scenarioMainId:filters.scenarioMain.id,
      options:options
    }).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data as Optim);
      ofGet.complete();
    });
    return ofGet;
  }
  // Check the execution of an instance
  check(optim:Optim): Observable<Optim>{
    var ofGet = new Subject<Optim>();
    this.http.post(this.getURL('check'),optim).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data as Optim);
      ofGet.complete();
    });
    return ofGet;
  }

  // Pause/Unpause the job if possible and return the updated job information
  pause(optim:Optim): Observable<Optim>{
    var ofGet = new Subject<Optim>();
    this.http.post(this.getURL('pause'),optim).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data as Optim);
      ofGet.complete();
    });
    return ofGet;
  }

  // Stop (kill the job on optim server) the job if possible and return the updated job information
  stop(optim:Optim): Observable<Optim>{
    var ofGet = new Subject<Optim>();
    this.http.post(this.getURL('stop'),optim).subscribe( (response: CrudGetResult) => {
      ofGet.next(response.data as Optim);
      ofGet.complete();
    });
    return ofGet;
  }

  // Turn a job into a set of routes
  toRoutes(optim:Optim): Observable<Route[]>{
    var ofGet = new Subject<Route[]>();

    this.http.get(this.getURL('to-routes/'+optim.id)).subscribe( (response: CrudResult) => {
      ofGet.next(response.data as Route[]);
      ofGet.complete();
    });

    return ofGet;
  }

  // Get default params for optimization
  defaultParams() : Observable<OptimOptions>{
    var ofGet = new Subject<OptimOptions>();
    this.http.get(this.getURL('default-params')).subscribe( (response: CrudResult) => {
      ofGet.next(response.data as OptimOptions);
      ofGet.complete();
    });
    return ofGet;
  }

  // request optim FIFO to process
  processFIFO(){
    if(!this.processFifoInProgress){
      this.processFifoInProgress = true;
      this.http.post(this.getURL('process-fifo'),{}).subscribe((response: CrudResult)=>{
        this.processFifoInProgress = false;
        this.optimServerStatus = response.data.toString();
      });
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }


}