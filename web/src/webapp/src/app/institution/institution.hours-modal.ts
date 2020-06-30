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

import { Component,Input,OnInit } from '@angular/core';

import { NgbActiveModal, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';

import { ThesaurusItem } from '../thesaurus/thesaurus';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { OpeningHours } from '../site/site';

@Component({
  templateUrl: './institution.hours-modal.html',
})
export class InstitutionHoursModal implements OnInit  {

  // Tell whether we are creating/updating some opening hours for HR pickup or for HR delivery
  @Input('bPickup') bPickup: boolean;

  // In creation mode, it will be undefined. In update mode, this is the opening period to be modified
  @Input('openingHours') openingHours : OpeningHours;

  // Tell whether we are creating or updating an opening period
  @Input('bEdit') bEdit : boolean;

  // The timeslot and time window that are chosen for the opening period
  days: ThesaurusItem[]; // In case of creation we use a multiselect
  day: ThesaurusItem; // In case of update we use a simple select
  startHour: number;
  endHour: number;

  // Times window in the ngbootstrap format
  earliest : NgbTimeStruct;
  latest : NgbTimeStruct;

  // All the timeslots from database
  timeSlots : ThesaurusItem[];

  /**
   * Constructor
   * @param siteService
   * @param activeModal
   */
  constructor(public activeModal: NgbActiveModal,private thesaurusService : ThesaurusService) {
    this.days=[];
  }

  /**
   * Called on component init
   */
  ngOnInit() {
    // If an input OpeningHours object is present, copy its fields to preset the formular
    if(this.openingHours && this.openingHours.timeslot_th){
      this.day = {
        id:this.openingHours.timeslot_th,
        code:this.openingHours.timeslot_code,
        label:this.openingHours.dayLabel,
        orderdisplay:this.openingHours.timeslot_orderdisplay,
        rec_st:this.openingHours.timeslot_rec_st
      }
      this.startHour=this.openingHours.start_hr;
      this.endHour=this.openingHours.end_hr;
      this.setTimeWindows();
    }
    // load all the available timeslots and filter them according to this.bPickup
    this.thesaurusService.list({cat:'TIMESLOT'}).subscribe(thesaurusItems=>{
      this.timeSlots=[];
      // Filter out the timeslot codes that do not correspond to this.bPickup and for each timeslot,
      //   keep only the first part of the label (the part that indicates the current day)
      for(let item of thesaurusItems){
        var aCodeParts = item.code.split('_');
        if(aCodeParts.length>1){
          // Pickup at the institution is possible only on the routes from the institution to the homes
          // Delivery at the institution is possible only on the routes from the homes to the institution
          if((aCodeParts[1]=='PM' && this.bPickup) || (aCodeParts[1]=='AM' && !this.bPickup)){
            var aLabelParts = item.label.split(' ');
            item.label = (aLabelParts.length>0) ? aLabelParts[0] : "";
            this.timeSlots.push(item);
          }
        }
      }
    });
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
    this.earliest=this.timeStampToTimeStruct(this.startHour);
    this.latest=this.timeStampToTimeStruct(this.endHour);
  }

  /**
   * Check that selected time windows are valid
   */
  checkTimes(){
    // Convert ngBootstrap times into unix time stamps
    this.startHour=undefined;
    this.endHour=undefined;
    if(this.earliest && this.earliest.hour!=undefined && this.earliest.minute!=undefined){
      this.startHour=this.earliest.hour*3600000+this.earliest.minute*60000;
    }
    if(this.latest && this.latest.hour!=undefined && this.latest.minute!=undefined){
      this.endHour=this.latest.hour*3600000+this.latest.minute*60000;
    }
  }

  /**
   * Remove the current opening period from its list
   */
  delete(){
    this.activeModal.close("delete");
  }

  /**
   * Post the selected opening period and close the modal
   */
  saveModal(){
    if(this.bEdit){
      // In edit mode : modify the input
      this.openingHours.timeslot_th=this.day.id;
      this.openingHours.timeslot_code=this.day.code;
      this.openingHours.timeslot_orderdisplay=this.day.orderdisplay;
      this.openingHours.timeslot_rec_st=this.day.rec_st;
      this.openingHours.dayLabel=this.day.label;
      this.openingHours.start_hr=this.startHour;
      this.openingHours.end_hr=this.endHour;
      this.activeModal.close();
    }
    else{
      // In add mode : post the set of new OpeningHours objects
      var openingHoursSet = [];
      for(let day of this.days){
        openingHoursSet.push({
          timeslot_th:day.id,
          timeslot_code:day.code,
          timeslot_orderdisplay:day.orderdisplay,
          timeslot_rec_st:day.rec_st,
          dayLabel:day.label,
          start_hr:this.startHour,
          end_hr:this.endHour
        } as OpeningHours );
      }
      this.activeModal.close(openingHoursSet);
    }
  }
}