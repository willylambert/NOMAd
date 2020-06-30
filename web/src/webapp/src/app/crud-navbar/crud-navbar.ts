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

import {Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

import { CrudNavbarModalConfirm } from './crud-navbar-modal.confirm';
import { CrudNavbarModalConfirmDelete } from './crud-navbar-modal.confirm-delete';

@Component({
  selector: 'crud-navbar',
  templateUrl: './crud-navbar.html',
  styleUrls: ['./crud-navbar.css']
})
export class CrudNavbar{

  // Current edit mode
  @Input('editMode') editMode: string;

  // Tell about the main formular validity in the crud menu that includes this crud navbar
  @Input('valid') valid: boolean;

  // Tell about the main formular state (pristine or not) in the crud menu that includes this crud navbar
  @Input('pristine') pristine: boolean;

  // The title to display for the crud menu
  @Input('title') title: string;

  // Used to check ACL right to update, delete or mark as removed
  @Input('aclObject') aclObject: string;

  // Record id. Could be undefined if we are creating a new record
  @Input('recordId') recordId: string;

  // Icons used in template
  faChevronLeft = faChevronLeft;

  @Output() editModeChange = new EventEmitter();
  @Output() saveEvent = new EventEmitter();
  @Output() markAsRemovedEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  // This attribute will store the path to the list menu corresponding to the current crud menu
  public pathToList : string;

  constructor(
    private modalService: NgbModal,
    private router: Router) {
      // Compute the path to list menu assuming a url ending with "crud/.*"
      // The /.* part is optionnal since it is missing when we are creating a new object
      this.pathToList = router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
  }

  edit() {
    this.setEditMode('edit');
  }

  /**
   * Triggered when user clicks on the link to go back to the list.
   * If some changes have been brought by user, a confirmation modal is displayed
   */
  backToList() {
    if(this.editMode!='view' && !this.pristine){
      // User has started some modifications
      const modalRef = this.modalService.open(CrudNavbarModalConfirm);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.router.navigate([this.pathToList]);
        }
      });
    }
    else{
      this.router.navigate([this.pathToList]);
    }
  }

  cancel(bWithoutConfirmation) {
    // If the formular is pristine (unmodified), request no confirmation
    if(bWithoutConfirmation==undefined){
      bWithoutConfirmation=this.pristine;
    }
    if(bWithoutConfirmation){
      if(this.recordId==undefined){
        // In add mode : get back to list
        this.router.navigate([this.pathToList]);
      }else{
        // In edit mode : get back to view mode
        this.setEditMode('view');
      }
    }else{
      if(!this.pristine){
        const modalRef = this.modalService.open(CrudNavbarModalConfirm);
        modalRef.result.then((result) => {
          if(result=='Y'){
            this.cancel(true);
          }
        });
      }
      else{
        this.cancel(true);
      }
    }
  }

  save() {
    this.saveEvent.emit();
  }

  markAsRemoved() {
    const modalRef = this.modalService.open(CrudNavbarModalConfirmDelete);
    var chkDelete = false;

    // Used by acl-show
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).aclObject = this.aclObject;

    // Get Real Delete checkbox
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).onCkeck.subscribe((value)=>{
      chkDelete = value;
    });
    modalRef.result.then((result) => {
      if(result=='Y'){
        if(chkDelete){
          this.deleteEvent.emit();
        }else{
          this.markAsRemovedEvent.emit();
        }
      }
    });/*
    var bResponse = confirm("Etes-vous certain de vouloir supprimer DEFINITIVEMENT cet élément ?");
    if(bResponse){
      this.deleteEvent.emit();
    }*/
  }

  private setEditMode(editMode: string){
    this.editModeChange.emit({
      value: editMode
    });
  }

}