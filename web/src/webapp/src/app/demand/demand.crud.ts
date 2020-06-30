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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { faCalendar,faTimes } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';

import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "../helpers/ngb-date-fr-parser-formatter"

import { BaseCrud } from '../basecrud';
import { Demand } from './demand';
import { DemandCrudModalPOI } from './demand.crud-modal.poi';
import { DemandService } from './demand.service';
import { HR } from '../hr/hr';
import { POI } from '../poi/poi';
import { POIService } from '../poi/poi.service';
import { Site } from '../site/site';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { ThesaurusItem } from '../thesaurus/thesaurus';


@Component({
  templateUrl: './demand.crud.html',
  styleUrls: ['./demand.scss'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class DemandCrud extends BaseCrud implements OnInit  {

  // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance POI creation or deletion)
  bChanges:boolean;

  // Shortcuts to tell wether some afternoon of morning timeslots are selected
  bMorning:boolean;
  bAfternoon:boolean;

  // Override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : Demand;

  // Incremented after any changes in the list of POIs received from host component
  changeInPOIs: number;

  // List of POIs to be displayed on the map
  POIs : POI[];

  // Tells whether there is a conflict in the POIs choices (HR list of institutions that do not match the chosen institution)
  bPOIConflict : boolean;

  // The timeslots
  timeSlotsAM : {selected:boolean,data:ThesaurusItem}[];
  timeSlotsPM : {selected:boolean,data:ThesaurusItem}[];

  faCalendar=faCalendar;
  faTimes=faTimes;

  // Times windows in the ngbootstrap format
  pickupEarliest : NgbTimeStruct;
  pickupLatest : NgbTimeStruct;
  deliveryEarliest : NgbTimeStruct;
  deliveryLatest : NgbTimeStruct;

  // The demand bounds converted into ms for easier dates comparison
  startDtMs : number;
  endDtMs : number;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private demandService:DemandService,
    private thService: ThesaurusService,
    private modalService: NgbModal,
    private POIService:POIService) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(demandService,thService,router);
      this.bChanges = false;
      this.changeInPOIs=0;
      this.POIs=[];
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => { this.onDataLoaded() });

  }

  /**
   * To be called on data loading.
   */
  onDataLoaded(){
    // Convert NgbDateStruct structures into unix time stamp for comparison
    this.onDateSelect();
    this.formatInstitutionPOILabel();
    this.formatHRPOILabel();
    this.checkConflict();
    this.setTimeslots();
    this.setTimeWindows();
    this.setPOIs();
  }

  /**
   * To be called at any date change in the time picker : it will keep this.currentRecord up to date
   * @param date
   */
  onDateSelect(){
    if(this.currentRecord.endDt && this.currentRecord.endDt.year && this.currentRecord.endDt.month && this.currentRecord.endDt.day){
      this.endDtMs=moment().set({
        'year':this.currentRecord.endDt.year,
        'month':this.currentRecord.endDt.month-1,
        'date':this.currentRecord.endDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
    if(this.currentRecord.startDt && this.currentRecord.startDt.year && this.currentRecord.startDt.month && this.currentRecord.startDt.day){
      this.startDtMs=moment().set({
        'year':this.currentRecord.startDt.year,
        'month':this.currentRecord.startDt.month-1,
        'date':this.currentRecord.startDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
  }

  /**
   * Update the set of POIs (for map display)
   */
  setPOIs(){
    this.POIs=[];
    if(this.currentRecord.HRPOI){
      this.POIs.push(this.currentRecord.HRPOI)
    }
    if(this.currentRecord.institutionPOI){
      this.POIs.push(this.currentRecord.institutionPOI)
    }
    if(this.currentRecord.HRPOI || this.currentRecord.institutionPOI){
      this.changeInPOIs++;
    }
  }

  /**
   * Fill in this.timeSlotsAM and this.timeSlotsPM, based on the timeslot ids found in this.currentRecord.timeslots
   */
  setTimeslots(){
    this.bMorning = false;
    this.bAfternoon = false;
    if(this.currentRecord.timeslots == undefined){
      this.currentRecord.timeslots=[];
    }
    this.thService.list({cat:'TIMESLOT'}).subscribe(thesaursItems=>{
      this.timeSlotsAM=[];
      this.timeSlotsPM=[];
      for(let thesaurusItem of thesaursItems){
        if(thesaurusItem.code.endsWith('AM')){
          this.timeSlotsAM.push({selected:false,data:thesaurusItem});
        }
        else{
          if(thesaurusItem.code.endsWith('PM')){
            this.timeSlotsPM.push({selected:false,data:thesaurusItem});
          }
        }
      }
      for(let timeslot of this.currentRecord.timeslots){
        for(let timeSlotAM of this.timeSlotsAM){
          if(timeslot.timeslot_th==timeSlotAM.data.id){
            timeslot.bMorning=true;
            this.bMorning = true;
            timeSlotAM.selected=true;
          }
        }
        for(let timeSlotPM of this.timeSlotsPM){
          if(timeslot.timeslot_th==timeSlotPM.data.id){
            timeslot.bMorning=false;
            this.bAfternoon = true;
            timeSlotPM.selected=true;
          }
        }
      }
    })
  }

  /**
   * Format HRPOI label, since we want the HR name to appear in the label
   */
  formatHRPOILabel(){
    var label = this.currentRecord.HRPOI.hr_firstname+" "+this.currentRecord.HRPOI.hr_lastname;
    if(label!=""){
      label+=" ";
    }
    if(this.currentRecord.HRPOI.label!=null && this.currentRecord.HRPOI.label!=undefined){
      label+="("+this.currentRecord.HRPOI.label+")";
    }
    this.currentRecord.HRPOI.label=label;
  }

  /**
   * Format institutionPOI label, since we want the site label to appear in the label
   */
  formatInstitutionPOILabel(){
    var label = "";
    if(this.currentRecord.institutionPOI.site_main_label!=null && this.currentRecord.institutionPOI.site_main_label!=undefined){
      label+=this.currentRecord.institutionPOI.site_main_label;
    }
    if(label!=""){
      label+=" ";
    }
    if(this.currentRecord.institutionPOI.label!=null && this.currentRecord.institutionPOI.label!=undefined){
      label+="("+this.currentRecord.institutionPOI.label+")";
    }
    this.currentRecord.institutionPOI.label = label;
  }


  /**
   * Called after DOM completion. It will request data from server if an id is found
   */
  ngOnInit() {
    // Load Demand
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
      if(routeParams.id==undefined || routeParams.id==""){
        // Data initialization in case this is a new demand creation
        this.bPOIConflict = false;
        this.setTimeslots();
      }
    });
  }

  /**
   * Handle the modal for HR POI picking
   */
  launchModalHR(){
    this.bChanges = true;
    const modalRef = this.modalService.open(DemandCrudModalPOI,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as DemandCrudModalPOI).siteType = 'HOME';
    (modalRef.componentInstance as DemandCrudModalPOI).bConflict = this.bPOIConflict;
    if(this.currentRecord.institutionPOI){
      // In case this.currentRecord.institutionPOI, we use it as a filter for HR POI picking
      var filterInstitution = new Site();
      filterInstitution.id = this.currentRecord.institutionPOI.site_main_id;
      filterInstitution.label = this.currentRecord.institutionPOI.site_main_label;
      (modalRef.componentInstance as DemandCrudModalPOI).institution = filterInstitution;
    }
    (modalRef.componentInstance as DemandCrudModalPOI).selectedPOI = this.currentRecord.HRPOI;
    modalRef.result.then((result) => {
      if(result!=undefined && result!=null){
        this.currentRecord.HRPOI=result;
        this.checkConflict();
        this.setPOIs();
      }
    });
  }

  /**
   * Handle the modal for institution POI picking
   */
  launchModalInstitutions(){
    this.bChanges = true;
    const modalRef = this.modalService.open(DemandCrudModalPOI,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as DemandCrudModalPOI).siteType = 'INSTITUTION';
    (modalRef.componentInstance as DemandCrudModalPOI).bConflict = this.bPOIConflict;
    if(this.currentRecord.HRPOI){
      // In case this.currentRecord.HRPOI, we use it as a filter for institution POI picking
      var filterHR = new HR();
      filterHR.id=this.currentRecord.HRPOI.hr_id;
      filterHR.firstname=this.currentRecord.HRPOI.hr_firstname;
      filterHR.lastname=this.currentRecord.HRPOI.hr_lastname;
      (modalRef.componentInstance as DemandCrudModalPOI).HR = filterHR;
    }
    (modalRef.componentInstance as DemandCrudModalPOI).selectedPOI = this.currentRecord.institutionPOI;
    modalRef.result.then((result) => {
      if(result!=undefined && result!=null){
        this.currentRecord.institutionPOI=result;
        this.checkConflict();
        this.setPOIs();
      }
    });
  }

  /**
   * Conflicts between institutionPOI and HRPOI are allowed in the current version but we will warn user
   */
  checkConflict(){
    this.bPOIConflict = false;
    if(this.currentRecord.HRPOI && this.currentRecord.institutionPOI){
      // List the institution POIs attached to the HR
      this.POIService.list({siteId:"",siteType:'INSTITUTION',hrId:this.currentRecord.HRPOI.hr_id,siteStatus:"ENABLED"}).subscribe((POIs) => {
        this.bPOIConflict = true;
        for(let POI of POIs){
          if(this.currentRecord.institutionPOI.id == POI.id){
            this.bPOIConflict = false;
            break;
          }
        }
      });
    }
  }

  /**
   * In case of change in the set of timeslots, keep this.currentRecord up-to date
   * @param timeSlot
   */
  toggleTimeSlot(timeSlot:{selected:boolean,data:ThesaurusItem}){
    this.bChanges = true;
    this.bMorning = false;
    this.bAfternoon = false;
    timeSlot.selected=!timeSlot.selected
    // Recompute this.currentRecord.timeslots
    this.currentRecord.timeslots = [];
    for(let timeslot of this.timeSlotsAM){
      if(timeslot.selected){
        this.currentRecord.timeslots.push({timeslot_th:timeslot.data.id,bMorning:true})
        this.bMorning = true;
      }
    }
    for(let timeslot of this.timeSlotsPM){
      if(timeslot.selected){
        this.bAfternoon = true;
        this.currentRecord.timeslots.push({timeslot_th:timeslot.data.id,bMorning:false})
      }
    }
  }

  /**
   * Check that selected time windows are valid
   */
  checkTimes(){
    // Convert ngBootstrap times into unix time stamps
    this.currentRecord.pickupStartHour=undefined;
    this.currentRecord.pickupEndHour=undefined;
    this.currentRecord.deliveryStartHour=undefined;
    this.currentRecord.deliveryEndHour=undefined;
    if(this.pickupEarliest && this.pickupEarliest.hour!=undefined && this.pickupEarliest.minute!=undefined){
      this.currentRecord.pickupStartHour=this.pickupEarliest.hour*3600000+this.pickupEarliest.minute*60000;
    }
    if(this.pickupLatest && this.pickupLatest.hour!=undefined && this.pickupLatest.minute!=undefined){
      this.currentRecord.pickupEndHour=this.pickupLatest.hour*3600000+this.pickupLatest.minute*60000;
    }
    if(this.deliveryEarliest && this.deliveryEarliest.hour!=undefined && this.deliveryEarliest.minute!=undefined){
      this.currentRecord.deliveryStartHour=this.deliveryEarliest.hour*3600000+this.deliveryEarliest.minute*60000;
    }
    if(this.deliveryLatest &&  this.deliveryLatest.hour!=undefined && this.deliveryLatest.minute!=undefined){
      this.currentRecord.deliveryEndHour=this.deliveryLatest.hour*3600000+this.deliveryLatest.minute*60000;
    }

  }

  /**
   * Conversion between unix timstamps and NgbTimeStruct without taking time zones into account
   * @param timestamp number : unix timestamp to convert
   * @return NgbTimeStruct : a time as NgbTimeStruct
   */
  private timeStampToTimeStruct(timestamp : number) : NgbTimeStruct{
    // Do not use moment for conversion since we do not want timezone to be taken into account
    var result;
    if(timestamp!=undefined && timestamp!=null){
      var iNumberOfHours = Math.floor(timestamp/3600000);
      var iNumberOfMinutes = Math.floor((timestamp-iNumberOfHours*3600000)/60000);
      result = {hour:iNumberOfHours,minute:iNumberOfMinutes,second:0};
    }
    return result;
  }

  /**
   * Conversion from unix timstamps received from server into NgbTimeStruct times used on client side
   */
  setTimeWindows(){
    this.pickupEarliest=this.timeStampToTimeStruct(this.currentRecord.pickupStartHour);
    this.pickupLatest=this.timeStampToTimeStruct(this.currentRecord.pickupEndHour);
    this.deliveryEarliest=this.timeStampToTimeStruct(this.currentRecord.deliveryStartHour);
    this.deliveryLatest=this.timeStampToTimeStruct(this.currentRecord.deliveryEndHour);
  }

  setDefaultPickupTimeWindows(){
    if(this.currentRecord.pickupStartHour==undefined){
      this.currentRecord.pickupStartHour=6*3600000;
      this.pickupEarliest=this.timeStampToTimeStruct(this.currentRecord.pickupStartHour);
    }
    if(this.currentRecord.pickupEndHour==undefined){
      this.currentRecord.pickupEndHour=9*3600000;
      this.pickupLatest=this.timeStampToTimeStruct(this.currentRecord.pickupEndHour);
    }
    this.currentRecord.bPickupTimeWindow=true;
  }

  setDefaultDeliveryTimeWindows(){
    if(this.currentRecord.deliveryStartHour==undefined){
      this.currentRecord.deliveryStartHour=14*3600000;
      this.deliveryEarliest=this.timeStampToTimeStruct(this.currentRecord.deliveryStartHour);
    }
    if(this.currentRecord.deliveryEndHour==undefined){
      this.currentRecord.deliveryEndHour=19*3600000;
      this.deliveryLatest=this.timeStampToTimeStruct(this.currentRecord.deliveryEndHour);
    }
    this.currentRecord.bDeliveryTimeWindow=true;
  }

}
