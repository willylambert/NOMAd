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

import { Component } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { SiteService } from '../site/site.service';
import { Site } from '../site/site';
import { HR } from '../hr/hr';
import { HRService } from '../hr/hr.service';
import { GridOptions } from 'ag-grid-community';

@Component({
  templateUrl: './hr-driver.select-modal.html',
})
export class HRDriverSelectModal {

    public transporters: Site[];

    public drivers:HR[];

    public transporterId:Site;

    public selectedDriver:HR;

    public gridOptions: GridOptions;

    public columnDefs = [
      {
        headerName: 'Prénom',
        field: 'firstname',
        checkboxSelection: true
      }, 
      {
        headerName: 'Nom',
        field: 'lastname',
      }, 
      {
        headerName: 'Statut',
        field: 'status_label'
      }
    ];

    /**
     * Constructor
     * @param siteService
     * @param activeModal
     */
    constructor(private siteService: SiteService, public activeModal: NgbActiveModal, public hrService:HRService) {
      this.gridOptions = <GridOptions>{
        rowHeight:30,
        headerHeight:30
      };
      this.siteService.list({
        typeCode: "TRANSPORTER", statusCode: null, search: '', startIndex: null, length: null
      }).subscribe(sites => {
        console.log('transporters',sites)
        this.transporters = sites
      });
    }

    onTransporterChange(){
      console.log("transporter change")
      // Reset the driver id
      this.selectedDriver=undefined;
      //TODO : ce serait bien d'avoir un filtre par transporteur
      this.hrService.list({typeCode: 'DRIVER', statusCode: null ,
        search: null, startIndex: null, length: null})
      .subscribe(hrs => {
        console.log("drivers",hrs)
        this.drivers = hrs;
      });
    }

    gridReady(params){
      params.api.sizeColumnsToFit();
    }
    onSelected(event){
      if(event.node.isSelected()){
        this.selectedDriver=event.node.data;
      }
    }

  /**
   * Triggered on "Valider" button click
   */
  saveModal() {
    this.activeModal.close(this.selectedDriver);
  }
}