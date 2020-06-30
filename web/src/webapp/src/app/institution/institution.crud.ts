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

import {Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { SiteCrud } from '../site/site.crud';
import { SiteService } from '../site/site.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { AlertService } from '../alert/alert.service';
import { InstitutionHoursModal } from '../institution/institution.hours-modal';
import { OpeningHours } from '../site/site';

@Component({
  selector: 'app-institution-crud',
  templateUrl: './institution.crud.html',
  styleUrls: ['./institution.scss']
})
export class InstitutionCrud extends SiteCrud  {

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected siteService:SiteService,
    protected thService: ThesaurusService,
    protected alertService: AlertService,
    protected modalService: NgbModal) {
      super(route,router,siteService,thService,alertService,modalService);
  }

  /**
   * Just before a new institution creation, give the site type code
   */
  checkData(){
    this.currentRecord.type_code='INSTITUTION';
  }

  /**
   * Edit an item from a list of opening hours after a user click in the list.
   * @param bPickup boolean : whether this is an opening hour for pickup or for delivery
   * @param openingHours : OpeningHours : the clicked opening period in the list
   */
  editHours(bPickup : boolean ,openingHours : OpeningHours){
    if(this.editMode!= 'view'){
      const modalRef = this.modalService.open(InstitutionHoursModal);
      (modalRef.componentInstance as InstitutionHoursModal).bPickup = bPickup;
      (modalRef.componentInstance as InstitutionHoursModal).openingHours = openingHours;
      (modalRef.componentInstance as InstitutionHoursModal).bEdit = true;

      modalRef.result.then((result) => {
        // Since the pickup hours and delivery hours are sorted by a pipe, we can not rely on an index
        //  passed by the ngFor
        if(result=="delete"){
          if(bPickup){
            var indexToDelete;
            for(var i=0;i<this.currentRecord.pickupHours.length;i++){
              if(this.currentRecord.pickupHours[i].timeslot_code == openingHours.timeslot_code &&
                this.currentRecord.pickupHours[i].start_hr == openingHours.start_hr &&
                 this.currentRecord.pickupHours[i].end_hr == openingHours.end_hr){
                indexToDelete=i;
                break;
              }
            }
            if(indexToDelete!=undefined){
              this.currentRecord.pickupHours.splice(indexToDelete,1);
            }
          }
          else{
            var indexToDelete;
            for(var i=0;i<this.currentRecord.deliveryHours.length;i++){
              if(this.currentRecord.deliveryHours[i].timeslot_code == openingHours.timeslot_code &&
                this.currentRecord.deliveryHours[i].start_hr == openingHours.start_hr &&
                 this.currentRecord.deliveryHours[i].end_hr == openingHours.end_hr){
                indexToDelete=i;
                break;
              }
            }
            if(indexToDelete!=undefined){
              this.currentRecord.deliveryHours.splice(indexToDelete,1);
            }
          }
        }
      }).catch((error) => {
        console.log(error);
      });
    }
  }

  /**
   * Launch the popup to add some new opening hours
   * @param bPickup boolean : whether this is an opening hour for pickup or for delivery
   */
  addHours(bPickup :boolean){
    const modalRef = this.modalService.open(InstitutionHoursModal);
    (modalRef.componentInstance as InstitutionHoursModal).bPickup = bPickup;
    (modalRef.componentInstance as InstitutionHoursModal).bEdit = false;

    modalRef.result.then((result) => {
      if(result!="" && result!=undefined && result!=null){
        if(bPickup){
          this.currentRecord.pickupHours = this.currentRecord.pickupHours.concat(result)
        }
        else{
          this.currentRecord.deliveryHours = this.currentRecord.deliveryHours.concat(result)
        }
      }
    }).catch((error) => {
      console.log("error",error);
    });
  }

}
