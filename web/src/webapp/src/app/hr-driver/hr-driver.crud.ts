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

import { NgbModal,NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "../helpers/ngb-date-fr-parser-formatter"

import { faPlus,faCalendar } from '@fortawesome/free-solid-svg-icons';

import { BaseCrud } from '../basecrud';
import { HR } from '../hr/hr';
import { Site } from '../site/site';

import { POI } from '../poi/poi';
import { POIModal } from '../poi/poi-modal';
import { HRTransportersModal } from './hr-driver.transporters-modal';
import { HRService } from '../hr/hr.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { AlertService } from '../alert/alert.service';

@Component({
  templateUrl: './hr-driver.crud.html',
  styleUrls: ['./hr-driver.css'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class HRDriverCrud extends BaseCrud implements OnInit  {

  // override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : HR;

    // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance POI creation or deletion)
  bChanges:boolean;

  // Icons used in template
  faPlus = faPlus;
  faCalendar = faCalendar;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private hrService:HRService,
    private thService: ThesaurusService,
    private alertService: AlertService,
    private modalService: NgbModal) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(hrService,thService,router);
      this.bChanges=false;
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => {
        // After data loading, no changes have occured
        this.bChanges=false;
      });
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
          if(hrType.code=='DRIVER'){
            this.currentRecord.type_th = hrType.id;
          }
        })
      });
    });
  }

  /**
   * open the modal for adding or removing an establishment to the list of establishement
   */
  protected updateTransporter(){
    const modalRef = this.modalService.open(HRTransportersModal, {size: 'lg'});
    (modalRef.componentInstance as HRTransportersModal).transporters = this.currentRecord.transporters;

    modalRef.result.then((result) => {
      if(result!=null){
        this.currentRecord.transporters=result;
        this.bChanges=true;
      }
    }).catch((error) => {
      console.log(error);
    });
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
  viewTransporter(site:Site){
    if(this.editMode=='view'){
      var path = this.router.url.replace(/hr\/crud(\/[0-9a-zA-Z-]*)?$/i,"transporter/crud/"+site.id);
      this.router.navigate([path]);
    }
  }

}