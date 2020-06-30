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

import {Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';
import { faPlay,faStop,faPause, faRedo,faSpinner} from '@fortawesome/free-solid-svg-icons';
import { BaseCrud } from '../basecrud';

import {Optim} from './optim';
import {OptimService} from './optim.service';

import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { Subscription } from 'rxjs';

@Component({
  templateUrl: './optim.crud.html',
  styleUrls: ['./optim.scss'],
})
export class OptimCrud extends BaseCrud implements OnInit {

  public editorInstanceOptions: JsonEditorOptions;
  public editorParametersOptions: JsonEditorOptions;
  public editorSolutionOptions: JsonEditorOptions;
  @ViewChild('editorInstance', { static: true }) editorInstance: JsonEditorComponent;
  @ViewChild('editorParameters', { static: true }) editorParameters: JsonEditorComponent;
  @ViewChild('editorSolution', { static: false }) editorSolution: JsonEditorComponent;

  currentRecord : Optim;

  // Subscription to the optimService time to launch checks automatically once the optimization was launched
  private optimTimerSubscription: Subscription;

  faPlay = faPlay;
  faPause = faPause;
  faStop = faStop;
  faRedo = faRedo;
  faSpinner = faSpinner;

  bLoading:boolean = true;

  constructor(private optimService: OptimService,
                 private thService: ThesaurusService,
                  protected router: Router,
                     private route: ActivatedRoute) {
    super(optimService,thService,router);
    this.editorInstanceOptions = new JsonEditorOptions();
    this.editorInstanceOptions.modes = ['view'];
    this.editorInstanceOptions.mode = 'view';

    this.editorParametersOptions = new JsonEditorOptions();
    this.editorParametersOptions.modes = ['code','view'];
    this.editorParametersOptions.mode = 'view';

    this.editorSolutionOptions = new JsonEditorOptions();
    this.editorSolutionOptions.modes = ['view'];
    this.editorSolutionOptions.mode = 'view';

    // In case the optimization is running, launch regular calls to check the progression
    this.dataLoaded.subscribe((currentRecord) => {
      this.bLoading = false;
      if(this.currentRecord.status_code!='LOST' && this.currentRecord.status_code!='FINISHED'){
        this.optimTimerSubscribe();
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
    });
  }

  checkData(){
    this.currentRecord.instance = this.editorInstance.get();
    this.currentRecord.parameters = this.editorParameters.get();
    this.setEditorsMode(true);
  }

  optimEditModeChange(event){
    // Call parent method
    this.editModeChange(event);

    if(event.value=="edit"){
      this.setEditorsMode(false);
    }
  }

  setEditorsMode(readonly:boolean){
    if(!readonly){
      this.editorInstanceOptions.modes = ['tree','text'];
      this.editorInstanceOptions.mode = 'tree';
      this.editorParametersOptions.modes = ['tree','text'];
      this.editorParametersOptions.mode = 'tree';
    }else{
      this.editorInstanceOptions.modes = ['view'];
      this.editorInstanceOptions.mode = 'view';
      this.editorParametersOptions.modes = ['view'];
      this.editorParametersOptions.mode = 'view';
    }
    this.editorInstance.setOptions(this.editorInstanceOptions);
    this.editorParameters.setOptions(this.editorParametersOptions);

  }

  // TODO : à retravailler, le service n'existe plus
  solve() {
    /*
    this.optimService.solve(this.currentRecord.id).subscribe(data=> {
      super.init(this.currentRecord.id);
    });
    */
  }

  /**
   * Start a subscription to the optimService timer for checking the optimization results automatically
   */
  optimTimerSubscribe(){
    this.optimTimerSubscription = this.optimService.timer1Source.subscribe(result => {
      if(this.currentRecord && this.currentRecord.id){
        this.checkOptim();
      }
    });
  }

  /**
   * Stop the subscription to the optimService timer for checking the optimization results automatically
   **/
  optimTimerUnsubscribe(){
    if(this.optimTimerSubscription){
      this.optimTimerSubscription.unsubscribe();
    }
  }

  /**
   * Called on page destroy
   **/
  ngOnDestroy() {
    this.optimTimerUnsubscribe();
  }

  /**
   * Pause or wake up the optimization process
   */
  pauseOptim(){
    this.optimService.pause(this.currentRecord).subscribe(response => {
      this.currentRecord = response;
    });
   }

  /**
   * Stop the optimization process ()
   */
  stopOptim(){
    this.optimService.stop(this.currentRecord).subscribe(response => {
      this.currentRecord = response;
    });
  }

  /**
   * Check optimisation progress
   **/
  checkOptim(){
    this.optimService.check(this.currentRecord).subscribe(response => {
      // In case the current record has already finished, ignore the check response
      //   and unsubscribe to the checks
      if(this.currentRecord.status_code!='LOST' && this.currentRecord.status_code!='FINISHED'){
        this.currentRecord = response;
      }
      if(this.currentRecord.status_code=='LOST' || this.currentRecord.status_code=='FINISHED'){
        this.optimTimerUnsubscribe();
      }
    });
  }
}
