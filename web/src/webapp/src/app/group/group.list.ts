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
import { Router } from '@angular/router';

import { GridOptions } from "ag-grid-community";

import {Group} from './group';
import {GroupService} from './group.service';


@Component({
  templateUrl: './group.list.html'
})
export class GroupList implements OnInit {

  groups: Group[];
  public gridOptions: GridOptions;

  protected search: string = "";

  // This attribute will store the path to the Crud menu corresponding to the current list menu
  public pathToNew : string;

  public columnDefs = [
    {headerName: 'Description', field: 'label'},
    {headerName: 'Nombre de demandes', field: 'demands_count'}
  ];

  constructor(private groupService:GroupService,private router: Router) {
    this.pathToNew = router.url.replace(/list$/i, "crud");
    this.gridOptions = <GridOptions>{
                rowHeight:30,
                headerHeight:30
    };
    this.search="";
  }

  ngOnInit() {
    this.updateList();
  }

  gridReady(params){
    params.api.sizeColumnsToFit();
  }

  updateSearch(event){
    this.search=event.value;
    this.updateList()
  }

  updateList(){
    this.groupService.list({search:this.search}).subscribe(groups => {
      this.groups = groups;
    });
  }

  onRowClicked(event){
    var pathToList = this.router.url.replace(/list?$/i, "crud/"+event.data.id);
    this.router.navigate([pathToList]);
  }



}