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

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

import {Observable} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';

import { BaseCrud } from '../basecrud';
import { Site } from './site';

import { POI } from '../poi/poi';
import { POIModal } from '../poi/poi-modal';
import { AOI } from '../aoi/aoi';
import { SiteService } from './site.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { AlertService } from '../alert/alert.service';

@Component({
  selector: 'app-site-crud',
  templateUrl: './site.crud.html',
  styleUrls: ['./site.css']
})
export class SiteCrud extends BaseCrud implements OnInit  {

  // override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : Site;

  // Incremented after any changes in the list of POIs received from host component
  changeInPOIs: number;

  // Incremented after any changes in the list of AOIs received from host component
  changeInAOIs: number;

  // The entity to which the site is attached : we load the full entity so that we can display its label
  entity:Site;

  // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance POI or AOI creation or deletion)
  bChanges:boolean;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected siteService:SiteService,
    protected thService: ThesaurusService,
    protected alertService: AlertService,
    protected modalService: NgbModal) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(siteService,thService,router);
      this.changeInPOIs = 0;
      this.changeInAOIs = 0;
      this.entity=new Site();
      this.bChanges=false;
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => {
        // After data loading, no changes have occured
        this.bChanges=false;
        // Force the display of POIs and AOIs on the map
        this.changeInPOIs++;
        this.changeInAOIs++;
        // Load the entity attached to the site (if any)
        var entityId = this.currentRecord.site_main_id_entity;
        if(entityId!=undefined){
          this.siteService.get(entityId).subscribe( data => {
            this.entity=data as Site;
          });
        }
        else{
          this.entity=new Site();
        }
      });
  }

  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    // Load Site
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
    });
  }

  /**
   * Triggered by map-leaflet Component after a marker drawing event on the map
   */
  public newPOI(event){
    var poi = {
      addr1:event.value.properties.addr1,
      addr2:event.value.properties.addr2,
      postcode:event.value.properties.postcode,
      city:event.value.properties.city,
      geom:event.value.geometry
    } as POI;
    this.currentRecord.POIs.push(poi);
    poi.position = this.currentRecord.POIs.length;
    this.launchPOIModal(poi,this.currentRecord.POIs.length-1);
  }

  /**
   * Triggered by map-leaflet Component after a polygon drawing event on the map
   */
  public newAOI(event){
    this.currentRecord.AOIs.push({ geom:event.value.geometry } as AOI);
    this.bChanges=true;
  }

  /**
   * Remove a POI from the list of POIs and also from the map
   */
  protected launchPOIModal(poi: POI, i: number){
    const modalRef = this.modalService.open(POIModal);
    (modalRef.componentInstance as POIModal).poi = poi;
    (modalRef.componentInstance as POIModal).editMode = this.editMode;

    modalRef.result.then((result) => {
      if(result=="delete"){
        this.currentRecord.POIs.splice(i,1);
      }
      // Trigger the change detection on map so that POIs display can be updated on map
      this.changeInPOIs++;
      this.bChanges=true;
    }).catch((error) => {
      // Handle a poi that is not saved in database and not validated by user
      if(!poi.selected && !poi.id){
        this.currentRecord.POIs.splice(i,1);
        this.changeInPOIs++;
      }
      console.log(error);
    });
  }


  /**
   * Remove a AOI from the list of AOIs and also from the map
   */
  protected deleteAOI(index:number){
    this.currentRecord.AOIs.splice(index,1);
    // Trigger the change detection on map so that AOIs display can be updated on map
    this.changeInAOIs++;
    this.bChanges=true;
  }

  /**
   * Copy into currentRecord the data that will be sent for an update or insert
   */
  public checkData(){
    this.currentRecord.site_main_id_entity=this.entity.id;
  }

  // Function to search an entity through the entity typeahead
  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term =>
        this.siteService.list({typeCode:'',statusCode:'',search:term,startIndex:0,length:0})
      )
    )

  // Function to format an entity through the entity typeahead
  formatter = (x: {code: string}) => x.code;

}
