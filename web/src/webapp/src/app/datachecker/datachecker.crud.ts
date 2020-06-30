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
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { BaseCrud } from '../basecrud';
import { HR } from '../hr/hr';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { DataCheckerService } from './datachecker.service';
import { DataChecker } from './datachecker';
import { GridOptions, RowNode } from 'ag-grid-community';
import { ContextService } from '../helpers/context.service';
import { DataCheckerDetailService } from './datachecker-detail.service';
import { DataCheckerDetail } from './datachecker-detail';
import { forkJoin } from 'rxjs';

@Component({
  templateUrl: './datachecker.crud.html',
})
export class DataCheckerCrud extends BaseCrud implements OnInit  {

  // override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : HR;

  checkerdetails: DataCheckerDetail[];
  selectedCheckerDetails: RowNode[];

  public gridOptions: GridOptions;

  public searchText: string = "";

  // The progress indicator for the check run
  public bDatacheckerRunning:boolean;

  public columnDefs = [
    {
      headerName: 'Description',
      field: 'label',
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      checkboxSelection:true,
    },
    {
      headerName: 'Dernière exécution',
      field: 'dt',
      valueFormatter:this.formatDate,
    }    
  ];  

  formatDate(data){
    return moment(data.value).format("DD/MM/YYYY HH:MM:SS");
  }

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private datacheckerService:DataCheckerService,
    private thService: ThesaurusService,
    private contextService: ContextService,
    private datacheckerDetailService: DataCheckerDetailService) 
    {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(datacheckerService,thService,router);

      // Load context if any
      var context = this.contextService.getLocalContext(this.constructor.name);
      if(context!=null && context!=undefined && context.searchText!=undefined && context.searchText!=null && context.searchText!=""){
        this.searchText=context.searchText;
      }
      else{
        this.searchText="";
      }
      this.gridOptions = <GridOptions>{
                  rowHeight:30,
                  headerHeight:30,
                  isExternalFilterPresent: this.isExternalFilterPresent,
                  doesExternalFilterPass: this.doesExternalFilterPass
        };

      this.gridOptions.isExternalFilterPresent  = this.isExternalFilterPresent.bind(this);
      this.gridOptions.doesExternalFilterPass = this.doesExternalFilterPass.bind(this);

      this.selectedCheckerDetails = [];
      this.dataLoaded.subscribe(currentRecord=>{
        this.loadData();
      })

  }

  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    // Load DataChecker
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);      
    });        
  }

  loadData(){
    this.datacheckerDetailService.list({
      'datachecker_main_id':this.currentRecord.id,
      'scenario_main_id':'',
      'transport_demand_id':'',
      'transport_calendar_id':'',
      'transport_route_id':'',
      'vehicle_category_id':'',
      'site_poi_id':'',
      'hr_main_id':''
    }).subscribe(checkerdetails => {
      this.checkerdetails = checkerdetails;
    });
    this.selectedCheckerDetails = [];
  }

  run(dataChecker : DataChecker){
    this.bDatacheckerRunning=true;
    this.datacheckerService.run({datacheckerId:dataChecker.id}).subscribe(result => {
      this.bDatacheckerRunning=false;
      this.loadData();
    });
  }

  removeSelectedCheckerDetailsClick(){
    this.removeSelectedCheckerDetails();
  }

  removeSelectedCheckerDetails(){
    var tblObs = [];
    for (const rowNode of this.selectedCheckerDetails){
      tblObs.push(this.datacheckerDetailService.delete(rowNode.data));
    }
    forkJoin(tblObs).subscribe(result => this.loadData());
  }

  gridReady(params){
    params.api.sizeColumnsToFit();
  }

  gridSelection(params){
    this.selectedCheckerDetails = this.gridOptions.api.getSelectedNodes();
  }

  isExternalFilterPresent() {
    return this.searchText!="";
  }

  doesExternalFilterPass(node) {
    var search = node.data.label;
    return search.toLowerCase().indexOf(this.searchText)>=0;
  }

  /**
   * Called when the search text is modified
   * @param event : the event after text yping in the search input widget
   */
  search(event){
    this.searchText = event.value.toLowerCase();
    this.gridOptions.api.onFilterChanged();
  }

  /**
   * Called on page leaving, enables to keep the filters into memory
   */
  ngOnDestroy() {
    this.contextService.setLocalContext(this.constructor.name,{searchText:this.searchText});
  }  

}