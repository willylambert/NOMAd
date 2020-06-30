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
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BaseCrud } from '../basecrud';

import {UserRoleModalCrud} from './user-role-modal.crud'
import {UserSiteModalCrud} from './user-site-modal.crud'
import {UserHRModalCrud} from './user-hr-modal.crud'
import {User} from './user';
import {UserService} from './user.service';

import { ThesaurusService } from '../thesaurus/thesaurus.service';

@Component({
  templateUrl: './user.crud.html'
})
export class UserCrud extends BaseCrud implements OnInit {

  users : User[];

  // The current user
  currentRecord : User;

  // The logged-in user
  me : User

  // Whether the mode for modifying password is activated or not
  bUpdatePassword : boolean;

  constructor(private userService: UserService,
        private thService: ThesaurusService,
        protected router: Router,
        private route: ActivatedRoute,
        private modalService: NgbModal) {
    super(userService,thService,router);
    this.bUpdatePassword = false;
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.user_main_id) {
      this.userService.get(currentUser.user_main_id).subscribe((user: User) => {
        this.me = user;
      });
    }
  }

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
      if(routeParams.id == undefined){
        // We enter the mode for new user creation : initialize the client type code
        //   so that it is correctly set for a logged-in user of type INSTITUTION
        this.thService.list({cat:'USER_MAIN_TYPE'}).subscribe(types => {
          for(let type of types){
            if(type.code=='CLIENT'){
              this.currentRecord.type_th=type.id
              this.currentRecord.type_code=type.code;
            }
          }
        });
      }
    });
  }

  /**
   * Save the user password
   */
  updatePassword(){
    this.userService.updatePassword(this.currentRecord).subscribe(response => {
      // Once sent to the server, reset the password on client side.
      this.currentRecord.passwd=undefined;
      this.bUpdatePassword = false;
    })
  }

  /**
   * Cancel the user password edition
   */
  cancelPassword(){
    this.currentRecord.passwd=undefined;
    this.bUpdatePassword = false;
  }

  onTypeChange(){
    this.thService.get(this.currentRecord.type_th).subscribe(result =>{
      this.currentRecord.type_code=result.code;
      // In case we switch to DRIVER mode, make sure only one hr can be linked to the driver
      if(this.currentRecord.type_code == 'DRIVER' && this.currentRecord.hrs && this.currentRecord.hrs.length>1){
        this.currentRecord.hrs=[];
      }
    })
  }

  /**
   * Open modal for adding/removing roles to the user
   */
  updateRoles() {
    const modalRef = this.modalService.open(UserRoleModalCrud);
    (modalRef.componentInstance as UserRoleModalCrud).user = this.currentRecord;

    modalRef.result.then((result) => {
      if(result!=null){
        this.currentRecord.roles=result;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Open modal for adding/removing sites to the user
   */
  updateSites() {
    const modalRef = this.modalService.open(UserSiteModalCrud, {size: 'lg'});
    (modalRef.componentInstance as UserSiteModalCrud).user = this.currentRecord;

    modalRef.result.then((result) => {
      if(result!=null){
        this.currentRecord.sites=result;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Open modal for adding/removing hrs to the user
   * @param boolean bMultiple : whether we allow multiple user picking
   */
  updateHRs(bMultiple) {
    const modalRef = this.modalService.open(UserHRModalCrud, {size: 'lg'});
    (modalRef.componentInstance as UserHRModalCrud).user = this.currentRecord;
    (modalRef.componentInstance as UserHRModalCrud).bMultiple = bMultiple;
    (modalRef.componentInstance as UserHRModalCrud).userTypeCode = "USER";

    modalRef.result.then((result) => {
      if(result!=null){        
        this.currentRecord.hrs=result;
      }
    }).catch((error) => {
      console.log(error);
    });
  }
}
