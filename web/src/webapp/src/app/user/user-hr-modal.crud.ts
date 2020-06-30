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

import { Component, OnInit,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {GridOptions} from "ag-grid-community";

import { User } from '../user/user';
import { HR } from '../hr/hr';
import { HRService } from '../hr/hr.service';

@Component({
  templateUrl: './user-hr-modal.crud.html',
})
export class UserHRModalCrud implements OnInit {

  // The input user data
  @Input('user') user: User;

  // Whether we want single or multiple user picking
  @Input('bMultiple') bMultiple: boolean;

  @Input('userTypeCode') userTypeCode: string;

  // The list of all available hrs
  hrs: HR[];

  // The list of all selected hrs
  selectedHRs: HR[];

  // A search pattern that will apply to HR lastname or firstname
  search : string;

  // TODO : replace by a smarter debounce using some rxjs functions like debounceTime
  // Temporary handler for debounce function, to be replaced by some rxjs functions like debounceTime
  debounceCounter : number;

  public gridOptions: GridOptions;

  /**
   * Constructor
   * @param hrService
   * @param activeModal
   */
  constructor(public hrService:HRService,public activeModal: NgbActiveModal) {
    this.gridOptions = <GridOptions>{ rowHeight:30, headerHeight:30,};
    this.gridOptions.columnDefs = [
      {headerName: 'Référence', field: 'code',checkboxSelection: true },
      {headerName: 'Nom', field: 'lastname' },
      {headerName: 'Prénom', field: 'firstname' },
    ];
    this.debounceCounter=0;
    this.selectedHRs=[];    
  }

  /**
   * Called when the input data is completely received
   */
  async ngOnInit() {
    await this.loadHRs();
    for(let hr of this.user.hrs){
      this.selectedHRs.push(hr);
    }
  }

  /**
   * Reload the list of HRs
   */
  loadHRs(){
    console.log("loadHRs",this.userTypeCode);
    return this.hrService.list({
      typeCode:this.userTypeCode,
      statusCode:"",
      search:this.search,
      startIndex:0,
      length:null
    }).subscribe(hrs =>{
      this.hrs = hrs
      this.displayCheckBoxes();
    });
  }

  /**
   * Function to be called on search pattern change. Handles HR list update and debounce
   */
  onPatternChange(){
    this.debounceCounter++;
    var that=this;
    setTimeout(function(){
      that.debounceCounter--;
      if(that.debounceCounter==0){
        that.loadHRs();
      }
    },500);
  }

  /**
   * Make sur the check boxes display is up-to-date.
   * To be called every time this.selectedPOI is updated from outside the ag-grid
   */
  displayCheckBoxes(){
    // Test wether grid is ready or not
    if(this.gridOptions.api){
      this.gridOptions.api.forEachNode(node=> {
        var selected = false;
        for(let hr of this.user.hrs){
          if(node.data.id == hr.id){
            selected = true;
            break;
          }
        }
        node.setSelected(selected);
      });
    }
  }

  /**
   * Fill the ag grid checkboxes
   * @param params
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
  }

  /**
   * Called when a select box of the grid is being clicked
   * @param event Event : the ag grid click event
   */
  onSelected(event){
    if(event.node.isSelected()){
      // add the hr to this.selectedHRs
      var bAlreadyPresent = false;
      for(var i=0;i<this.selectedHRs.length;i++){
        if(this.selectedHRs[i].id==event.data.id){
          bAlreadyPresent=true;
          break;
        }
      }
      if(!bAlreadyPresent){
        this.selectedHRs.push(event.data)
      }
    }
    else{
      // remove the hr from this.selectedHRs
      for(var i=0;i<this.selectedHRs.length;i++){
        if(this.selectedHRs[i].id==event.data.id){
          this.selectedHRs.splice(i,1);
          break;
        }
      }
    }
  }

  /*
  * Send data to calling page.
  */
  saveModal() {
    this.activeModal.close(this.selectedHRs);
  }
}
