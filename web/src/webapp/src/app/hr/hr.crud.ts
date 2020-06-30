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

import {Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { NgbModal,NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "../helpers/ngb-date-fr-parser-formatter"

import { faPlus,faCalendar,faArrowRight,faCheck,faClock } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';

import { BaseCrud } from '../basecrud';
import { HR } from './hr';
import { Site } from '../site/site';

import { POI } from '../poi/poi';
import { POIModal } from '../poi/poi-modal';
import { HRInstitutionsModal } from './hr.institutions-modal';
import { HRPOIModal } from './hr.poi-modal';
import { HRService } from './hr.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { AlertService } from '../alert/alert.service';
import { POIService } from '../poi/poi.service';
import { RouteService } from '../route/route.service';
import { Route } from '../route/route';
import { Subscription } from 'rxjs';
import { RouteRunService } from '../route-run/route-run.service';

@Component({
  templateUrl: './hr.crud.html',
  styleUrls: ['./hr.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class HRCrud extends BaseCrud implements OnInit,OnDestroy  {

  // override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : HR;

  // Incremented after any changes in the list of POIs received from host component
  changeInPOIs: number;

  // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance POI creation or deletion)
  bChanges:boolean;

  // Icons used in template
  faPlus = faPlus;
  faCalendar = faCalendar;
  faArrowRight = faArrowRight;
  faClock=faClock;
  faCheck=faCheck;

  birthdayDate:NgbDateStruct;

  // Bounds for the calendar
  hundreadYearsAgo:NgbDateStruct;
  nextYear:NgbDateStruct;

  // Pickup and delivery durations in seconds
  pickupDurationSeconds : number;
  deliveryDurationSeconds : number;

  // List of POIs for the hr, including the POIs associated to institutions
  POIs : POI[];

  // In case the SMS alerts are activated, this is the number of minutes of the duration
  //   between the SMS and the expected arrival on site.
  noticeDelayInMinutes:number;

  routes:Route[];

  private timerSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private hrService:HRService,
    private thService: ThesaurusService,
    private alertService: AlertService,
    private modalService: NgbModal,
    private POIService: POIService,
    private routeService : RouteService,
    private RouteRunService: RouteRunService
    ) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(hrService,thService,router);
      this.changeInPOIs = 0;
      this.POIs = [];
      this.bChanges=false;
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => {
        // After data loading, no changes have occured
        this.bChanges=false;
        // Force the display of POIs on the map
        this.changeInPOIs++;
        this.loadPOIs();
        // Compute the date as a NgbDateStruct
        var d = new Date(this.currentRecord.birthday_dt);
        this.birthdayDate = {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate()} as NgbDateStruct;
        if(this.currentRecord.pickup_duration!=null && this.currentRecord.pickup_duration!=undefined){
          this.pickupDurationSeconds = Math.round(this.currentRecord.pickup_duration / 1000);
        }
        else{
          this.pickupDurationSeconds = undefined;
        }
        if(this.currentRecord.delivery_duration!=null && this.currentRecord.delivery_duration!=undefined){
          this.deliveryDurationSeconds = Math.round(this.currentRecord.delivery_duration / 1000);
        }
        else{
          this.deliveryDurationSeconds = undefined;
        }
        // convert milliseconds in minutes;
        if(this.currentRecord.notify_yn=='Y' && this.currentRecord.notice_delay!=undefined && this.currentRecord.notice_delay!=null){
          this.noticeDelayInMinutes=Math.round(this.currentRecord.notice_delay/60000);
        }  
        this.loadRoutes();
      });
      this.hundreadYearsAgo = { day: 1, month: 1, year: (new Date()).getUTCFullYear()-100} as NgbDateStruct;
      this.nextYear = { day: 31, month: 12, year: (new Date()).getUTCFullYear()+1} as NgbDateStruct;
  }

  loadRoutes(){
    if(this.currentRecord && this.currentRecord.id){
      // Filter ongoing route : route with a driver_hr start dt, without an end dt
      var filters = {onGoingStatus:'S',hr_main_id:this.currentRecord.id};
      this.routeService.list(filters).subscribe( routes => {
        // If no routes are loaded and no routes were previously loaded, avoid map update
        var bWithPOIUpdates = ((this.routes!=undefined && this.routes.length>0) || routes.length>0);
        this.routes=routes
        for(let route of this.routes){
          for(let POI of route.POIs){
            if(POI.arrival_dt != undefined && POI.arrival_dt != null){
              // If arrival_dt is in the future, arrival_duration will be negative, 
              POI.arrival_duration = moment().valueOf() - POI.arrival_dt;
            }
            if(POI.visited_dt != undefined && POI.visited_dt != null){
              // If visited_dt is in the future, visited_duration will be negative (should not occur), 
              POI.visited_duration = moment().valueOf() - POI.visited_dt;
            }
          }
        }
        if(bWithPOIUpdates){
          this.loadPOIs();
          this.changeInPOIs++;
        }        
      });
    }
  }

  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    // Load HR
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
      
      // Set HR Type - cannot be modified through UI
      this.thService.list({cat:'HR_MAIN_TYPE'}).subscribe( response => {
        response.forEach( hrType => {
          if(hrType.code=='USER'){
            this.currentRecord.type_th = hrType.id;
          }
        })
      });
    });
    this.timerSubscription = this.RouteRunService.timer10Source.subscribe(val => {this.loadRoutes()});
  }

  /**
   * Override parent function so as to trigger a pickup or delivery duration computation
   * When reaching the editMode
   * @param event
   */
  public editModeChange(event){
    this.editMode = event.value;
    if(this.currentRecord.pickup_duration==null || this.currentRecord.pickup_duration==undefined ||
      this.currentRecord.delivery_duration==null || this.currentRecord.delivery_duration==undefined){
      // In case this.currentRecord.pickup_duration or this.currentRecord.delivery_duration is not defined,
      //   use default values for this.pickupDurationSeconds and this.deliveryDurationSeconds
      if(this.editMode!='view'){
        this.setDefaultPickupDeliveryDurations();
      }
    }
    if(this.editMode=="view"){
      // Reload data
      this.init(this.currentRecord.id)
    }
  }

  /**
   * Gather all the POIs within the same collection
   */
  loadPOIs(){
    this.POIs= [];
    for(let POI of this.currentRecord.home.POIs){
      this.POIs.push(POI);
    }
    if(this.routes){
      for(let route of this.routes){
        // Force the display of the POI with a "shuttle van" style on the map
        this.POIs.push({
          id:"",
          label:"Tournée "+route.label,
          geom:route.vehicle_current_location,
          site_type_code:'TRANSPORTER'
        } as POI);
      }
    }
    for(let establishment of this.currentRecord.institutions){
      for(let POI of establishment.POIs){
        // Propose a POI label corresponding to the establishment label
        POI.label = establishment.label;
        this.POIs.push(POI);
      }
    }
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

    this.currentRecord.home.POIs.push(poi);
    this.launchPOIModal(poi,this.currentRecord.home.POIs.length-1);
  }

  /**
   * Launch the POI modal window
   */
  protected launchPOIModal(poi: POI, i: number){

    const modalRef = this.modalService.open(POIModal);
    (modalRef.componentInstance as POIModal).poi = poi;
    (modalRef.componentInstance as POIModal).institutions = this.currentRecord.institutions;
    (modalRef.componentInstance as POIModal).editMode = this.editMode;

    modalRef.result.then((result) => {
      if(result=="delete"){
        this.currentRecord.home.POIs.splice(i,1);
      }
      // Trigger the change detection on map so that POIs display can be updated on map
      this.loadPOIs();
      this.changeInPOIs++;
      this.bChanges=true;
    }).catch((error) => {
      // Handle a poi that is not saved in database and not validated by user
      if(!poi.selected && !poi.id){
        this.currentRecord.home.POIs.splice(i,1);
        this.loadPOIs();
        this.changeInPOIs++;
      }
      console.log(error);
    });
  }

  /**
   * open the modal for adding or removing an establishment to the list of establishement
   */
  protected updateEstablishment(){
    const modalRef = this.modalService.open(HRInstitutionsModal, {size: 'lg'});
    (modalRef.componentInstance as HRInstitutionsModal).institutions = this.currentRecord.institutions;

    modalRef.result.then((result) => {
      if(result!=null){
        this.currentRecord.institutions=result;
        this.bChanges=true;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * open the modal for adding a POI to the list of POIs
   */
  protected addPOI(){
    this.modalService.open(HRPOIModal, {size: 'lg'});
  }

  /**
   * Function called just before saving
   */
  public checkData(){
    if(this.birthdayDate!=undefined){
      // JS months are indexed from 0 to 11 and not from 1 to 12 as in NgbDateStruct
      var d = new Date(this.birthdayDate.year, this.birthdayDate.month-1, this.birthdayDate.day);
      this.currentRecord.birthday_dt= d.getTime();
    }
    this.currentRecord.pickup_duration=this.pickupDurationSeconds*1000;
    this.currentRecord.delivery_duration=this.deliveryDurationSeconds*1000;
    // convert minutes into milliseconds;
    if(this.currentRecord.notify_yn=='Y' && this.noticeDelayInMinutes!=undefined && this.noticeDelayInMinutes!=null){
      this.currentRecord.notice_delay=this.noticeDelayInMinutes*60000;
    }
    if(this.currentRecord.notify_yn==undefined && this.currentRecord.notify_yn==null){
      this.currentRecord.notify_yn='N';
    }
  }

  /**
   * To be called when the mouse pointer leaves the button that is supposed to trigger the popover opening
   * @param popover : the popover component
   */
  onLinkMouseLeave(popover){
    // Reopen the popover for a few milliseconds, so that user can move the mouse pointer over the opover area
    popover.open()
    setTimeout(function(){
      if(!popover.mouseOnPopover){
        // If the mouse pointer is not in the opover area after the timeout, close the popover
        popover.close()
      }
    },100);
  }

  /**
   * Put a flag on the popover to tell that the mouse pointer entered that popover
   * @param popover : the popover component
   */
  onPopoverMouseEnter(popover){
    popover.mouseOnPopover=true;
  }

  /**
   * Handle popover leaving. We use a timeout so that we can move switch between the different parts of the popover without closing
   * @param popover : the popover component
   */
  onPopoverMouseLeave(popover){
    popover.mouseOnPopover=false;
    setTimeout(function(){
      if(!popover.mouseOnPopover){
        popover.close()
      }
    },100);
  }

  /**
   * In view mode, redirect to the page for viewing an institution site.
   * In edit mode, this does nothing since we should not exit an edit page without saving
   * @param site
   */
  viewInstitution(site:Site){
    if(this.editMode=='view'){
      var path = this.router.url.replace(/hr\/crud(\/[0-9a-zA-Z-]*)?$/i,"institution/crud/"+site.id);
      this.router.navigate([path]);
    }
  }

  /**
   * Set pickup and/or delivery durations with default values according to the transport mode
   */
  setDefaultPickupDeliveryDurations(){
    if(this.pickupDurationSeconds == undefined || String(this.pickupDurationSeconds) == '' ||
      this.deliveryDurationSeconds == undefined || String(this.deliveryDurationSeconds) == ''){
      if(this.currentRecord.transportmode_th != undefined || this.currentRecord.transportmode_th != ''){
        this.thService.get(this.currentRecord.transportmode_th).subscribe(thesaurusItem => {
          if(thesaurusItem.code=='FAUTEUIL'){
            // Do not erase values that were previously entered (even though they were proposed automatically)
            if(this.pickupDurationSeconds == undefined || String(this.pickupDurationSeconds) == ''){
              this.pickupDurationSeconds=180;
            }
            // Do not erase values that were previously entered (even though they were proposed automatically)
            if(this.deliveryDurationSeconds == undefined || String(this.deliveryDurationSeconds) == ''){
              this.deliveryDurationSeconds=180;
            }
          }
          if(thesaurusItem.code=='MARCHANT'){
            // Do not erase values that were previously entered (even though they were proposed automatically)
            if(this.pickupDurationSeconds == undefined || String(this.pickupDurationSeconds) == ''){
              this.pickupDurationSeconds=45;
            }
            // Do not erase values that were previously entered (even though they were proposed automatically)
            if(this.deliveryDurationSeconds == undefined || String(this.deliveryDurationSeconds) == ''){
              this.deliveryDurationSeconds=45;
            }
          }
        });
      }
    }
  }

  ngOnDestroy() {
    this.timerSubscription.unsubscribe();
  }
}
