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

import { Component, OnInit,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {GridOptions} from "ag-grid-community";

import { User } from '../user/user';
import { AclRole } from '../acl/acl-role';
import { AclRoleService } from '../acl/acl-role.service';

@Component({
  templateUrl: './user-role-modal.crud.html',
})
export class UserRoleModalCrud {

  // The input user data
  @Input('user') user: User;

  // The list of all available roles
  aclRoles: AclRole[];

  public gridOptions: GridOptions;

  constructor(public aclRoleService:AclRoleService,public activeModal: NgbActiveModal) {
    this.gridOptions = <GridOptions>{ rowHeight:30, headerHeight:30,};
    this.gridOptions.columnDefs = [
      {headerName: 'Rôle', field: 'code',checkboxSelection: true },
      {headerName: 'Description', field: 'label' },
    ];
    this.aclRoleService.list({}).subscribe(aclRoles => this.aclRoles = aclRoles);
  }

  /**
   * Fill the ag grid checkboxes
   * @param params
   */
  gridReady(params){
    this.gridOptions.api.forEachNode(node=> {
      var selected = false;
      for(let role of this.user.roles){
        if(node.data.code == role.code){
          selected = true;
          break;
        }
      }
      node.setSelected(selected);
    });
    params.api.sizeColumnsToFit();
  }

  /*
  * Send data to calling page.
  */
  saveModal() {
    this.activeModal.close(this.gridOptions.api.getSelectedRows());
  }
}
