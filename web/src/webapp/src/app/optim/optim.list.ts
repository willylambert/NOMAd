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

import {Component, OnInit } from '@angular/core';
import { GridOptions } from "ag-grid-community";
import {Optim} from './optim';
import {OptimService} from './optim.service';
import { Subscription } from 'rxjs';
import { DurationPipe } from '../helpers/duration.pipe';
import { TimePipe } from '../helpers/time.pipe';
import { DatePipe } from '../helpers/date.pipe';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  templateUrl: './optim.list.html',
})
export class OptimList implements OnInit {

  // The list of optimization instances
  optims : Optim[];

  // a search pattern
  search: string;

  // the ag grid columns
  public columnDefs = [
    {headerName: 'Référence', field: 'code',cellRendererFramework: OptimListClickableComponent},
    {headerName: 'Scénario', field: 'scenario_main_label'},
    {headerName: 'Libellé', field: 'label'},
    {headerName: 'Date de démarrage', field: 'start_dt',valueFormatter:this.formatStartDt},
    {headerName: 'Durée', field: 'last_solution_dt',valueFormatter:this.formatDuration},
    {headerName: 'Statut', field: 'status_label',valueFormatter:this.formatStatusLabel},
    {headerName: 'Solution', field: 'with_solution',valueFormatter:this.formatSolution},
  ];

  public gridOptions: GridOptions;

  // Subscription to the optimService time to update the list regularly
  private optimTimerSubscription: Subscription;

  // Forbid the launching of a new optim list when the former optim list has not started.
  public bLoadingComplete : boolean;

  // We keep the last nbDays days for the optim list
  public nbDays : number;

  // The selected scenario id (will be instanciated in the optim navbar)
  public scenarioId : string;

  constructor(
    protected optimService:OptimService
  ) {
    this.gridOptions = <GridOptions>{
      rowHeight:30,
      headerHeight:30
    };    
    this.search="";
    this.nbDays=1;
    this.bLoadingComplete = false;
  }

  /**
   * Format the date
   * @param params : ag grid parameter pointing to the start_dt field
   */
  formatStartDt(params){
    var sStartDt = "le "+new DatePipe().transform(params.value);
    sStartDt    += " à "+new TimePipe().transform(params.value);
    return sStartDt;
  }

  getOptimServerStatus(){
    return this.optimService.optimServerStatus;
  }

  /**
   * Format the duration
   * @param params : ag grid parameter pointing to the last_solution_dt field
   */
  formatDuration(params){
    var sDuration = "";
    if(params.value != undefined && params.value != null){
      sDuration = new DurationPipe().transform((params.value - params.data.start_dt).toString())
    }  
    return sDuration;    
  }

  /**
   * Format the status label
   * @param params : ag grid parameter pointing to the status_label field
   */
  formatStatusLabel(params){
    var sStatusLabel = params.value;
    if(params.value== undefined || params.value == null){
      if(params.data.with_time_matrix && params.data.with_distance_matrix){
        sStatusLabel="En attente";
      }
      else{
        sStatusLabel="Calcul de matrice en cours";
      }
    }
    return sStatusLabel;    
  }

  /**
   * Format the solution summary
   * @param params : ag grid parameter pointing to the solution field
   */
  formatSolution(params){
    var sSolution = "";
    if(params.value == undefined || params.value == null || !params.value){
      sSolution="Pas de solution";
    }
    else{
      sSolution=params.data.routes_count + " tournée";
      if(params.data.routes_count!=1){
        sSolution+="s";
      }
      if(params.data.cost !=null && params.data.cost !=undefined  && typeof(params.data.cost)==="string"){
        sSolution+=","+parseFloat(params.data.cost).toFixed(2)+"\u20ac";    
      }      
    }
    return sSolution;
  }

  /**
   * Called when page is loaded
   */
  ngOnInit() {
    this.updateList()
    this.optimTimerSubscription = this.optimService.timer2Source.subscribe(result => {
      if(this.bLoadingComplete){
        this.updateList();
      }
    });
  }

  /**
   * Called when some characters are typed in the search bar
   * @param event
   */
  updateSearch(event){
    this.search = event.value;
    this.updateList();
  }

  /**
   * Called when the period filter is updated
   * @param event 
   */
  updateNbDays(event){
    this.nbDays = event.value;
    this.updateList();    
  }

  /**
   * Called when the scenario filter is updated
   * @param event 
   */
  updateScenarioId(event){
    this.scenarioId = event.value;
    this.updateList();     
  }

  /**
   * Update the list of instances
   */
  updateList(){
    this.bLoadingComplete = false;
    this.optimService.list({
      search:this.search,
      descendingOrder:true,
      status_code:"",
      scenarioMainId:this.scenarioId,
      timeSlotId:"",
      calendarDt:undefined,
      // By default, we get only the optimizations over the 2 last days
      nbDays:this.nbDays
    }).subscribe(optims => {
      this.optims = optims;
      this.bLoadingComplete = true;
    });
  }

  /**
   * Called on page destroy
   */
  ngOnDestroy() {
    if(this.optimTimerSubscription){
      this.optimTimerSubscription.unsubscribe();
    }
  }

  /**
   * Resize grid on ag grid load
   * @param params 
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
  }
}

// Component that enables clickable link in the first column of the ag grid
@Component({
  selector: 'ag-clickable',
  template: "<button [routerLink]=\"['/optim/crud',params.node.data.id]\" class='btn btn-link'>{{params.node.data.code}}</button>",
})
export class OptimListClickableComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}