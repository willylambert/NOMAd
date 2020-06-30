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
import { Site } from '../site/site';
import { SiteService } from '../site/site.service';

@Component({
  templateUrl: './user-site-modal.crud.html',
})
export class UserSiteModalCrud implements OnInit {

  // The input user data
  @Input('user') user: User;

  // The list of all available sites
  sites: Site[];

  // The list of all selected sites
  selectedSites: Site[];

  // Filter on the type of the researche sites
  sFilter: string;

  // A search pattern that will apply to hr lastname or firstname
  search : string;

  // TODO : replace by a smarter debounce using some rxjs functions like debounceTime
  // Temporary handler for debounce function, to be replaced by some rxjs functions like debounceTime
  debounceCounter : number;

  public gridOptions: GridOptions;

  /**
   * Constructor
   * @param siteService
   * @param activeModal
   */
  constructor(public siteService:SiteService,public activeModal: NgbActiveModal) {
    this.gridOptions = <GridOptions>{ rowHeight:30, headerHeight:30,};
    this.gridOptions.columnDefs = [
      {headerName: 'Référence', field: 'code',checkboxSelection: true },
      {headerName: 'Description', field: 'label' },
    ];
    this.sFilter='';
    this.debounceCounter=0;
    this.selectedSites=[];
  }

  /**
   * Called when the input data is completely received
   */
  ngOnInit() {
    if(this.user.type_code=='INSTITUTION' || this.user.type_code=='TRANSPORT_ORGANIZER'){
      this.sFilter='INSTITUTION'
    }
    this.loadSites();
    for(let site of this.user.sites){
      this.selectedSites.push(site);
    }
  }

  /**
   * Set the site type filter
   * @param newValue string : new site type filter value
   */
  setFilter(newValue){
    this.sFilter=newValue;
    this.loadSites();
  }

  /**
   * Reload the list of sites
   */
  loadSites(){
    this.siteService.list({typeCode:this.sFilter,statusCode:"",search:this.search,startIndex:0,length:null}).subscribe(sites =>{
      this.sites = sites
      this.displayCheckBoxes();
    });
  }

  /**
   * Function to be called on search pattern change. Handles site list update and debounce
   */
  onPatternChange(){
    this.debounceCounter++;
    var that=this;
    setTimeout(function(){
      that.debounceCounter--;
      if(that.debounceCounter==0){
        that.loadSites();
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
        for(let site of this.user.sites){
          if(node.data.id == site.id){
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
      // add the site to this.selectedSites
      var bAlreadyPresent = false;
      for(var i=0;i<this.selectedSites.length;i++){
        if(this.selectedSites[i].id==event.data.id){
          bAlreadyPresent=true;
          break;
        }
      }
      if(!bAlreadyPresent){
        this.selectedSites.push(event.data)
      }
    }
    else{
      // remove the site from this.selectedSites
      for(var i=0;i<this.selectedSites.length;i++){
        if(this.selectedSites[i].id==event.data.id){
          this.selectedSites.splice(i,1);
          break;
        }
      }
    }
  }

  /*
  * Send data to calling page.
  */
  saveModal() {
    this.activeModal.close(this.selectedSites);
  }
}
