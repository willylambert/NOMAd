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

import { Component,OnInit,Input, Output,EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { Optim } from './optim';
import { OptimModalLaunch } from './optim-modal.launch';
import { OptimService } from './optim.service';
import { OptimModalError } from './optim-modal.error';

import { Site } from '../site/site';
import { Scenario } from '../scenario/scenario';
import { RouteSet } from '../route/route.set';

import { faCheck, faPlay, faPause, faStop, faRedo, faArrowLeft, faSpinner} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'optim-player',
  templateUrl: './optim.player.html',
  styleUrls: ['./optim.scss']
})
export class OptimPlayer implements OnInit,OnChanges  {

  // Whether the player is enabled or not
  @Input('enabled') enabled: boolean;

  // changed after any external request for setting the last optim results
  @Input('optimResultId') optimResultId: string;

  // Some input data that can be passed to the player in order to retrieve the optimization input data
  // Remark : the same structure serves for both sandbox and real modes, but some optional fields may be unset
  //   according to the chosen mode. Even when some fields are unset, it seems that this causes no compilation issues
  @Input('filters') filters:{
    timeSlotId:string,
    scenarioMain:Scenario,
    // Optional : calendarDt is not required in sandbox mode. It must be consistent with timeslot id and expressed in ms
    calendarDt:number,
    timeSlotAMPM:string,
    // Optional : institutions is required only in sandbox mode
    institutions:Site[]
  };

  // The input set of routes enables to display some statistics about the data that will
  //    be the input of the optimizations : number of users, number of vehicle categories, number of institutions
  // This parameter is optional, required only in sandbox mode
  @Input('routes') routes:RouteSet;

  // Enable to warn host components that optimized routes are available
  @Output() optimizedRoutesAvailable = new EventEmitter();

  // Indicate whether the optim has started. This enables no to launch twice an optimization
  optimStarting:boolean;
  
  // Result of the last check to the optimization server
  optimResult:Optim;

  // Optim result that was chosen by the user
  selectedOptimResult:Optim;

  // Time elapsed since the optimization was launched (in ms)
  optimElapsedTime:number;

  checkInProgress: boolean = false;
  stopInProgress: boolean = false;

  // Subscription to the optimService time to launch checks automatically once the optimization was launched
  private optimTimerSubscription: Subscription;

  // The icons
  faCheck = faCheck;
  faPlay = faPlay;
  faPause = faPause;
  faStop = faStop;
  faRedo = faRedo;
  faArrowLeft = faArrowLeft;
  faSpinner = faSpinner;

  constructor(
      private router: Router,
      private modalService: NgbModal,
      private optimService : OptimService) {
  }

  /**
   * Called when the input data is completely received
   */
  ngOnInit() {

  }

  /**
   * Function triggered on any data change.
   * We avoid relying on change detection in arrays since this may be ressource consuming
   * Enables to reset last optim results in case of external request for reseting the last optim results
   * @param changes : list of changed objects
   */
  ngOnChanges(changes: SimpleChanges) {
    if(changes.optimResultId && !changes.optimResultId.firstChange){
      // Some changes have been detected in the collection of POIs so we repaint them on the map
      this.resetOptimResults();
    }
  }

  /**
   * Reset the optim results
   */
  resetOptimResults(){
    if(this.optimResultId == "" || this.optimResultId == null || this.optimResultId == undefined){
      this.optimResult=undefined;
      this.selectedOptimResult=undefined;
    }
    else{
      this.optimService.get(this.optimResultId).subscribe(optim =>{
        this.optimResult = optim as Optim;
        this.selectedOptimResult = this.optimResult;
        if(this.optimResult.status_code=='FINISHED'){
          this.optimElapsedTime = this.optimResult.last_solution_dt-this.optimResult.start_dt;
        }
        else{
          this.optimElapsedTime = Date.now()-this.optimResult.start_dt;
        }        
      })      
    }
  }

  /**
   * Launch optimisation for the current set of routes
   */
  launchOptim(){
    const modalRef = this.modalService.open(OptimModalLaunch);
    (modalRef.componentInstance as OptimModalLaunch).filters = this.filters;
    (modalRef.componentInstance as OptimModalLaunch).routes = this.routes;
    modalRef.result.then((options) => {
      if(options){
        this.optimTimerUnsubscribe();
        this.optimStarting=true;
        this.resetOptimResults();
        if(this.routes){
          // If some routes are available, this is the sandbox mode
          this.optimService.fromRoutes(this.filters, options)
                           .subscribe(response=>this.onInstanceSuccess(response),error=>this.onInstanceError(error));
        }
        else{
          // The production mode, where the players receives a scenario id, a calendar id and a timeslot id
          // The optimization is not based on manual constructions by user
          this.optimService.fromScenario(this.filters, options)
                           .subscribe(response=>this.onInstanceSuccess(response),error=>this.onInstanceError(error));
        }
      }
    });
  }

  /**
   * What to do in case the instance is sucessflully created
   * @param response
   */
  onInstanceSuccess(response){
    this.optimTimerSubscribe();
    this.optimStarting=false;
    this.optimResult = response;
    // initial solution check for very small instances
    this.checkOptim();
  }

  /**
   * What to do in case the instance creation fails
   * @param error
   */
  onInstanceError(error){
    console.log("optimService.fromScenario error",error);
    this.optimStarting=false;
  }

  /**
   * Redirect to the optim crud page
   * @param optimId string : the optim id
   */
  private viewOptim(optimId : string){
    var path = this.router.url.replace(
      /logistics\/route\/crud(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?$/i,
      "optim/crud/"+optimId
    );
    window.open(path);
  }

  /**
   * Open a modal to display the error details
   */
  displayOptimFailure(){
    const modalRef = this.modalService.open(OptimModalError);
    (modalRef.componentInstance as OptimModalError).currentRecord = this.optimResult;
  }

  /**
   * Start a subscription to the optimService timer for checking the optimization results automatically
   */
  optimTimerSubscribe(){
    this.optimTimerSubscription = this.optimService.timer2Source.subscribe(result => {
      if(this.optimResult && this.optimResult.id){
        this.checkOptim();
      }
    });
  }

  /**
   * Stop the subscription to the optimService timer for checking the optimization results automatically
   */
  optimTimerUnsubscribe(){
    if(this.optimTimerSubscription){
      this.optimTimerSubscription.unsubscribe();
    }
  }

  /**
   * Check optimisation progress
   */
  checkOptim(){
    if(!this.checkInProgress){
      this.checkInProgress = true;
      this.optimService.check(this.optimResult).subscribe(response => {
        this.optimResult = response;

        this.checkInProgress = false;
        this.optimElapsedTime = Date.now()-this.optimResult.start_dt;
        // If no solution was selected by user yet, select one
        if(this.selectedOptimResult == undefined || this.selectedOptimResult.id ==undefined ||
          this.selectedOptimResult.id == null || this.selectedOptimResult.id =="" ||
          this.selectedOptimResult.solution == undefined || this.selectedOptimResult.solution == null ){
          this.selectSolution();
        }
        if(this.optimResult.status_code=='LOST' || this.optimResult.status_code=='FINISHED'){
          this.optimTimerUnsubscribe();
          this.selectSolution();
        }
      });
    }
  }

  /**
   * Matrix is divided in blocks
   * @param optimResult 
   */
  getMatrixComputeProgressionLabel(optimResult){
    var label = "";
    if(optimResult.matrix_blocks != undefined){
      var nbDone = 0;
      for(let block of optimResult.matrix_blocks.blocks){
        if(block.data!= undefined && block.data !== false){
          nbDone++;
        }
      }
      if(optimResult.matrix_blocks.blocks.length>0){
        label = nbDone + "/" + optimResult.matrix_blocks.blocks.length;
      }
    }
    return label;
  }

  /**
   * Pause or wake up the optimization process
   */
  pauseOptim(){
    this.optimService.pause(this.optimResult).subscribe(response => {
      this.optimResult = response;
    });
   }

  /**
   * Stop the optimization process ()
   */
  stopOptim(){
    this.stopInProgress = true;
   this.optimService.stop(this.optimResult).subscribe(response => {
     this.optimResult = response;
     this.stopInProgress = false;
   });
  }

  /**
   * Select the last optim results and display this solution
   */
  selectSolution(){
    if(this.optimResult != undefined && this.optimResult.id != undefined &&
      this.optimResult.id != null && this.optimResult.id != "" &&
      this.optimResult.solution != undefined && this.optimResult.solution != null ){
      // Save a copy of the last optim results into this.selectedOptimResult
      this.selectedOptimResult = this.optimResult;
      this.displaySolution(true);
    }
  }

  /**
   * Get the set of routes corresponding to the found solution and request for display
   * @param boolean bOverwrite : when set ot true, overwrite the already loaded routes with the same optim_main_id
   */
  displaySolution(bOverwrite){
    this.optimService.toRoutes(this.selectedOptimResult).subscribe(routes => {
      // Emit the set of routes for the host components
      this.optimizedRoutesAvailable.emit({routes:routes,bOverwrite:bOverwrite});
    },
    error=>{
      console.log("error",error);
    });    
  }

  /**
   * Called on page destroy
   */
  ngOnDestroy() {
    this.optimTimerUnsubscribe();
  }  
}