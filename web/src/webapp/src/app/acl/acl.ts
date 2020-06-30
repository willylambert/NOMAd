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

import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { GridOptions } from "ag-grid-community";
import {ICellRendererAngularComp} from "ag-grid-angular";

import { ACLUserModalCrud } from './acl-user-modal.crud';
import { ACLRoleModalCrud } from './acl-role-modal.crud';

import { User } from '../user/user';
import { UserService } from '../user/user.service';

import { AclAction } from './acl-action';
import { AclRole } from './acl-role';
import { AclRoleService } from './acl-role.service';
import { AclActionService } from './acl-action.service';

@Component({
  templateUrl: './acl.html',
  styleUrls: ['./acl.scss']
})
export class ACL implements OnInit {

  private closeResult: string;

  public users: User[];
  public aclActions: AclAction[];
  public aclRoles: AclRole[];

  public gridOptionsUsers: GridOptions;
  public gridOptionsRoles: GridOptions;
  public gridOptionsActions: GridOptions;

  public userColumnDefs = [
    {headerName: 'Identifiant', field: 'login', cellRendererFramework: ClickableComponent },
    {headerName: 'Nom', field: 'lastname' },
  ];

  public roleColumnDefs = [
    {headerName: 'Rôle', field: 'code', cellRendererFramework: ClickableComponent },
    {headerName: 'Description', field: 'label' },
  ];

  public actionColumnDefs = [
    {headerName: 'Action', field: 'code',checkboxSelection: false },
    {headerName: 'Description', field: 'label' },
  ];

  constructor(private userService: UserService,
              private aclActionService: AclActionService,
              private aclRoleService: AclRoleService,
              private modalService: NgbModal
              ) {

    this.gridOptionsUsers = <GridOptions>{
                rowHeight:30,
                headerHeight:30,
                context: {
                  code:"user",
                  componentParent: this
                }};


    this.gridOptionsRoles = <GridOptions>{
                rowHeight:30,
                headerHeight:30,
                context: {
                  code:"role",
                  componentParent: this
                }};

    this.gridOptionsActions = <GridOptions>{
                rowHeight:30,
                headerHeight:30
                };
  }

  // Open Modal add / edit Role
  openUser(id) {
    const modalRef = this.modalService.open(ACLUserModalCrud);
    (modalRef.componentInstance as ACLUserModalCrud).userId = id;

    modalRef.result.then((result) => {
    }).catch((error) => {
      console.log(error);
    });
  }

  // Update roles list - mark selected roles
  userSelected(event) {
    var selectedUsers = event.api.getSelectedRows();
    if(selectedUsers.length==1){
      this.gridOptionsRoles.api.forEachNode(node=> {
        var selected = false;
        for(let role of selectedUsers[0].roles){
          if(node.data.code == role.code){
            selected = true;
            break;
          }
        }
        node.setSelected(selected);
      });
    }
  }

  // Open Modal add / edit Role
  openRole(id) {
    const modalRef = this.modalService.open(ACLRoleModalCrud, {size: 'lg'});
    (modalRef.componentInstance as ACLRoleModalCrud).aclRoleId = id;
    (modalRef.componentInstance as ACLRoleModalCrud).aclActions = this.aclActions;

    modalRef.result.then((result) => {
      // Update UI
      this.loadData();

    }).catch((error) => {
      console.log(error);
    });
  }

  // Update actions list - mark selected actions
  roleSelected(event) {
    var selectedRoles = event.api.getSelectedRows();
    if(selectedRoles.length==1){
      this.gridOptionsActions.api.forEachNode(node=> {
        var selected = false;
        for(let action of selectedRoles[0].actions){
          if(node.data.code == action.code){
            selected = true;
            break;
          }
        }
        node.setSelected(selected);
      });
    }
  }

  ngOnInit() {
    this.loadData();
  }

  loadData(){
    this.userService.list({typeCodes:'INSTITUTION,ADMIN',search:""}).subscribe(users => {this.users = users});
    this.aclActionService.list({}).subscribe(aclActions => this.aclActions = aclActions);
    this.aclRoleService.list({}).subscribe(aclRoles => this.aclRoles = aclRoles);
  }

  onGridResized(params) {
    params.api.sizeColumnsToFit();

    // Ugly hack !!
    setTimeout(function(){
      params.api.sizeColumnsToFit();
    },1000);
  }

}

@Component({
    selector: 'ag-clickable',
    template: "<button (click)='click()' class='btn btn-link'>{{params.value}}</button>",
})
export class ClickableComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  click(): void {
    if(this.params.context.code=="role"){
      this.params.context.componentParent.openRole(this.params.node.data.id);
    }else{
      this.params.context.componentParent.openUser(this.params.node.data.id);
    }
  }

  refresh(): boolean {
    return false;
  }
}