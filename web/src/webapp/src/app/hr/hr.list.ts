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

import { GridOptions } from "ag-grid-community";
import {ICellRendererAngularComp} from "ag-grid-angular";

import {HR} from './hr';
import {HRService} from './hr.service';

import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faChild } from '@fortawesome/free-solid-svg-icons';
import { ContextService } from '../helpers/context.service';

@Component({
  templateUrl: './hr.list.html'
})
export class HRList implements OnInit,OnDestroy {

  hrs: HR[];
  public gridOptions: GridOptions;

  public searchText: string = "";

  public columnDefs = [
    {
      headerName: 'Usager',
      field: 'firstname',
      cellRendererFramework: HrListClickableComponent,
      valueGetter: function ( params ) {
        return params.data.lastname+ ' '+ params.data.firstname;
      }
    },
    {
      headerName: 'Ville',
      field: 'sites',
      cellRendererFramework: HomesComponent,
      valueGetter: function ( params ) {
        var sAggregatedHomeCities="";
        for(let home of params.node.data.homes){
          sAggregatedHomeCities+= home.city+" ";
        }
        return sAggregatedHomeCities.trim();
      }
    },
    {
      headerName: 'Etablissement',
      field: 'sites',
      cellRendererFramework: InstitutionsComponent,
      valueGetter: function ( params ) {
        var sAggregatedInstitutionLabels="";
        for(let institution of params.node.data.institutions){
          sAggregatedInstitutionLabels+= institution.label+" ";
        }
        return sAggregatedInstitutionLabels.trim();
      }
    },
    {
      headerName: 'Statut',
      field: 'status_label'
    },
    {
      headerName: 'Demandes de transport',
      field: 'demands_count'
    },
  ];

  constructor(private hrService:HRService,public contextService:ContextService) {
    // Load context if any
    var context = this.contextService.getLocalContext(this.constructor.name);
    if(context!=null && context!=undefined && context.searchText!=undefined && context.searchText!=null && context.searchText!=""){
      this.searchText=context.searchText;
    }
    else{
      this.searchText="";
    }
    this.gridOptions = <GridOptions>{
                rowHeight:30,
                headerHeight:30,
                isExternalFilterPresent: this.isExternalFilterPresent,
                doesExternalFilterPass: this.doesExternalFilterPass
      };

    this.gridOptions.isExternalFilterPresent  = this.isExternalFilterPresent.bind(this);
    this.gridOptions.doesExternalFilterPass = this.doesExternalFilterPass.bind(this);
  }

  ngOnInit() {

    this.hrService.list({typeCode: null, statusCode: null ,
                           search: null, startIndex: null, length: null})
        .subscribe(hrs => {
          this.hrs = hrs;
        });
  }

  gridReady(params){
    params.api.sizeColumnsToFit();
  }

  isExternalFilterPresent() {
    return this.searchText!="";
  }

  doesExternalFilterPass(node) {
    var fullName = node.data.firstname + node.data.lastname;
    return fullName.toLowerCase().indexOf(this.searchText)>=0;
  }

  /**
   * Called when the search text is modified
   * @param event : the event after text yping in the search input widget
   */
  search(event){
    this.searchText = event.value.toLowerCase();
    this.gridOptions.api.onFilterChanged();
  }

  /**
   * Called on page leaving, enables to keep the filters into memory
   */
  ngOnDestroy() {
    this.contextService.setLocalContext(this.constructor.name,{searchText:this.searchText});
  }

}

@Component({
    selector: 'ag-clickable',
    template: "<span *ngIf=\"params.node.data.transportmode_code=='MARCHANT'\"><fa-icon [icon]='faChild'></fa-icon></span><span *ngIf=\"params.node.data.transportmode_code=='FAUTEUIL'\"><fa-icon [icon]='faWheelchair'></fa-icon></span><button [routerLink]=\"['/data/hr/crud',params.node.data.id]\" class='btn btn-link'>{{params.node.data.firstname}} {{params.node.data.lastname}}</button>",
})
export class HrListClickableComponent implements ICellRendererAngularComp {
  public params: any;

  faWheelchair = faWheelchair;
  faChild = faChild;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}

@Component({
    selector: 'ag-clickable',
    template: "<span *ngFor='let site of params.node.data.homes'>{{site.city}} </span>",
})
export class HomesComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}

@Component({
    template: "<span *ngFor='let site of params.node.data.institutions'>{{site.label}} </span>",
})
export class InstitutionsComponent implements ICellRendererAngularComp {
  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}