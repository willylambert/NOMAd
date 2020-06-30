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

import { Component,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {GridOptions} from "ag-grid-community";

import { SiteService } from '../site/site.service';
import { Site } from '../site/site';

@Component({
  templateUrl: './hr.institutions-modal.html',
})
export class HRInstitutionsModal {

    // The list of establishments sent by modal parent component
    @Input('institutions') institutions: Site[];

    public gridOptions: GridOptions;

    // The list of all institutions.
    // The type is the same as site but with an address field that aggregates all the address subfields
    public institutionsFormatted: {
        id:string;
        code:string;
        label:string;
        address:string;
        addr1:string;
        addr2:string;
        postcode:string;
        city:string;
        type_label:string;
        status_label:string;
        site_main_label_entity:string;
    }[];

    /**
     * Constructor
     * @param siteService
     * @param activeModal
     */
    constructor(private siteService: SiteService, public activeModal: NgbActiveModal) {
      this.siteService.list({
          typeCode:"INSTITUTION",statusCode:"ENABLED",search:"",startIndex:0,length:0}).subscribe((sites) => {
        this.institutionsFormatted=[];
        for(let site of sites){
          this.insertSite(site);
        }
      });
      this.gridOptions = {
        rowHeight:30,
        headerHeight:30,
        columnDefs : [
          {headerName: 'Référence', field: 'code', checkboxSelection: true},
          {headerName: 'Description', field: 'label'},
          {headerName: 'Adresse', field: 'address' },
        ]
      } as GridOptions;
  }

  /**
   * Called when grid is ready
   * @param params sent by the grid
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
    this.gridOptions.api.forEachNode(node=> {
      var selected = false;
      for(let institution of this.institutions){
        if(node.data.code == institution.code){
          selected = true;
          break;
        }
      }
      node.setSelected(selected);
    });
    params.api.sizeColumnsToFit();
  }

    /**
     * Insert a site in this.establishementsFormatted only if the site does not belong to this.establishments.
     * @param site a site to be inserted into this.establishementsFormatted
     */
    public insertSite(site){
      this.institutionsFormatted.push({
        id:site.id,
        code:site.code,
        label:site.label,
        address:this.formatAddress(site),
        addr1:site.addr1,
        addr2:site.addr2,
        postcode:site.postcode,
        city:site.city,
        type_label:site.type_label,
        status_label:site.status_label,
        site_main_label_entity:site.site_main_label_entity
      })
    }

    /**
     * Compute an address for a site by concatenating the site address subfields
     * @param site a site for which we need to compute the address in one field
     * @return string : the address for the site
     */
    public formatAddress(site){
      var address = "";
      if(site.addr1!=null){
        address+= site.addr1
      }
      if(site.addr2!=null){
        if(address!=''){
          address+=' - ';
        }
        address+= site.addr2
      }
      if(site.postcode!=null){
        if(address!=''){
          address+=' ';
        }
        address+= site.postcode
      }
      if(site.city!=null){
        if(address!=''){
          address+=' ';
        }
        address+= site.city
      }
      return address;
    }

  /**
   * Triggered on "Valider" button click : it will update this.establishments with selected items from
   *   this.establishementsFormatted
   */
  saveModal() {
    this.institutions = [];
    this.gridOptions.api.forEachNode(node=> {
      if(node.isSelected()){
        //get the institution data
        this.siteService.get(node.data.id).subscribe(response=>this.institutions.push(response as Site))
      }
    });
    // Send the list of establishments as a response
    this.activeModal.close(this.institutions);
  }
}