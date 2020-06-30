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
import * as moment from 'moment';

import {Demand} from './demand';
import {DemandService} from './demand.service';


@Component({
  templateUrl: './demand.list.html'
})
export class DemandList implements OnInit {

  demands: Demand[];
  public gridOptions: GridOptions;

  search :string;

  // This attribute will store the path to the Crud menu corresponding to the current list menu
  public pathToNew : string;

  public columnDefs = [
    {
      headerName: 'Etablissement',
      field: 'site_poi_label_institution',
      valueFormatter:this.formatInstitutionLabel,
      valueGetter: function ( params ) {
        var institutionLabel = "";
        if(params.data.institutionPOI.site_main_label!=undefined &&
           params.data.institutionPOI.site_main_label!=null &&
           params.data.institutionPOI.site_main_label!=""){
          institutionLabel+=params.data.institutionPOI.site_main_label;
        }
        if(params.data.institutionPOI.label!=undefined && params.data.institutionPOI.label!=null &&
           params.data.institutionPOI.label!=""){
          if(institutionLabel!=""){
            institutionLabel+=" ";
          }
          institutionLabel+="("+params.data.institutionPOI.label+")";
        }
        return institutionLabel;
      }
    },
    {
      headerName: 'Usager',
      field: 'site_poi_label_hr',
      valueFormatter:this.formatHRLabel,
      valueGetter: function ( params ) {
        var hrLabel = params.data.HRPOI.hr_lastname+" "+params.data.HRPOI.hr_firstname;
        if(params.data.HRPOI.label!=undefined && params.data.HRPOI.label!=null && params.data.HRPOI.label!=""){
          if(hrLabel!=""){
            hrLabel+=" ";
          }
          hrLabel+="("+params.data.HRPOI.label+")";
        }
        return hrLabel;
      }
    },
    {
      headerName: 'Début',
      field: 'start_dt',
      valueFormatter : this.formatDate,
      filter: 'agDateColumnFilter'
    },
    {
      headerName: 'Fin',
      field: 'end_dt',
      valueFormatter : this.formatDate,
      filter: 'agDateColumnFilter'
    }
  ];

  constructor(private demandService:DemandService,private router: Router) {
    this.pathToNew = router.url.replace(/list$/i, "crud");
    this.gridOptions = <GridOptions>{
                rowHeight:30,
                headerHeight:30
      };
    this.search="";
  }

  formatInstitutionLabel(data){
    var institutionLabel = "";
    if(data.data.institutionPOI.site_main_label!=undefined && data.data.institutionPOI.site_main_label!=null && data.data.institutionPOI.site_main_label!=""){
      institutionLabel+=data.data.institutionPOI.site_main_label;
    }
    if(data.data.institutionPOI.label!=undefined && data.data.institutionPOI.label!=null && data.data.institutionPOI.label!=""){
      if(institutionLabel!=""){
        institutionLabel+=" ";
      }
      institutionLabel+="("+data.data.institutionPOI.label+")";
    }
    return institutionLabel;
  }

  formatHRLabel(data){
    var hrLabel = data.data.HRPOI.hr_firstname+" "+data.data.HRPOI.hr_lastname;
    if(data.data.HRPOI.label!=undefined && data.data.HRPOI.label!=null && data.data.HRPOI.label!=""){
      if(hrLabel!=""){
        hrLabel+=" ";
      }
      hrLabel+="("+data.data.HRPOI.label+")";
    }
    return hrLabel;
  }

  formatDate(data){
    return moment(data.value).format("DD/MM/YYYY");
  }

  ngOnInit() {
    this.updateList();
  }

  updateList(){
    this.demandService.list({ hrMainId:"",bOnlyActiveHRs:true, search: this.search}).subscribe(demands => {
      this.demands = demands;
    });
  }

  updateSearch(event){
    this.search=event.value;
    this.updateList();
  }

  gridReady(params){
    params.api.sizeColumnsToFit();
  }

  onRowClicked(event){
    var pathToList = this.router.url.replace(/list?$/i, "crud/"+event.data.id);
    this.router.navigate([pathToList]);
  }

}