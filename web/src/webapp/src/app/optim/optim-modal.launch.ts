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

import { Component,Input } from '@angular/core';

import { NgbActiveModal, NgbDate, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { faCalendar } from '@fortawesome/free-solid-svg-icons';

import { Scenario, ScenarioFilter } from '../scenario/scenario';
import { OptimOptions, Optim } from './optim';
import { RouteSet } from '../route/route.set';
import { OptimService } from './optim.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { ScenarioService } from '../scenario/scenario.service';
import * as moment from 'moment';
import { Route } from '../route/route';
import { ThesaurusItem } from '../thesaurus/thesaurus';

@Component({
  templateUrl: './optim-modal.launch.html'
})
export class OptimModalLaunch {

  // The considered timeslot id and scenario main id
  @Input('filters') filters : {timeSlotId:string, scenarioMain:Scenario,calendarDt:number,timeSlotAMPM:string};

  // The input routes (will be set only in sandbox mode)
  @Input('routes') routes : RouteSet;

  //The optimization options to be passed to the optimizer
  options : OptimOptions;

  // Local associative array to count HRs, institutions and vehicle Types
  aHRs : [];
  aInstitutions : [];
  aVehicleTypes : [];

  // HRs, institutions and vehicle Types counts
  iHRsCount : number;
  iInstitutionsCount : number;
  iVehicleTypesCount : number;

  // A smart label to display the considered time slot
  timeslot:string;

  // The known routers
  routers:string[];

  // List of pickable initial solutions
  optims:Optim[];

  initialSolutionDt: NgbDate;
  initialSolutionRoutes: Route[];

  faCalendar=faCalendar;

  timeSlots: ThesaurusItem[]; 

  constructor(
    public activeModal: NgbActiveModal,
    public optimService:OptimService,
    private thService: ThesaurusService,
    private scenarioService: ScenarioService) {
    this.aHRs=[];
    this.aInstitutions=[];
    this.aVehicleTypes=[];
    this.iHRsCount=0;
    this.iInstitutionsCount=0;
    this.iVehicleTypesCount=0;
    this.options=new OptimOptions();
    this.timeslot="";
    this.routers=["OSRM","TomTom"];
 
  }

  /**
   * Count the number of HRs, institutions and vehicle types involved by the route
   */
  computeStatsFromRoutes(){
    for(let route of this.routes.list){
      for(let POI of route.POIs){
        if(POI.hr_id!=undefined && POI.hr_id!=null){
          if(this.aHRs[POI.hr_id]==undefined){
            this.aHRs[POI.hr_id]=POI;
            this.iHRsCount++;
          }
        }
        else{
          if(this.aInstitutions[POI.site_main_id]==undefined){
            this.aInstitutions[POI.site_main_id]=POI;
            this.iInstitutionsCount++;
          }
        }
      }
      if(route.vehicleCategory!=undefined && route.vehicleCategory!=null && route.vehicleCategory.id!=undefined && route.vehicleCategory.id!=null){
        if(this.aVehicleTypes[route.vehicleCategory.id]==undefined || this.aVehicleTypes[route.vehicleCategory.id]==null){
          this.aVehicleTypes[route.vehicleCategory.id] = route.vehicleCategory;
          this.iVehicleTypesCount++;
        }
      }
    }
  }

  /**
   * Count the number of HRs, institutions and vehicle types involved by the scenario
   */
  computeStatsFromScenario(){
    this.scenarioService.get(this.filters.scenarioMain.id).subscribe(scenario =>{
      for(let fleetItem of (scenario as Scenario).fleet){
        if(this.aVehicleTypes[fleetItem.data.id]==undefined || this.aVehicleTypes[fleetItem.data.id]==null){
          this.aVehicleTypes[fleetItem.data.id] = fleetItem.data;
          this.iVehicleTypesCount++;
        }
      }
      this.scenarioService.listPOIs(this.filters).subscribe((POIs) => {
        for(let POI of POIs){
          if(POI.hr_id!=undefined){
            // Count the HRs
            if(this.aHRs[POI.hr_id]==undefined ||this.aHRs[POI.hr_id]==null){
              this.aHRs[POI.hr_id]=POI;
              this.iHRsCount++;
            }
            if(POI.institutions!=undefined){
              for(let institution of POI.institutions){
                if(this.aInstitutions[institution.id]==undefined || this.aInstitutions[institution.id]==null){
                  this.aInstitutions[institution.id]=institution;
                  this.iInstitutionsCount++;
                }
              }   
            }         
          }
        }
      })
    })
  }

  /**
   * Called when the input data is completely received
   */
  ngOnInit() {
    if(this.routes){
      this.computeStatsFromRoutes();
    }
    else{
      this.computeStatsFromScenario();
    }

    this.thService.list({cat:'TIMESLOT'}).subscribe(thesaurusItems=>{
      this.timeSlots = thesaurusItems;
    });

    // A smart label to be displayed
    this.thService.get(this.filters.timeSlotId).subscribe(thesaurusItem => {
      this.timeslot=thesaurusItem.label
    });
    // Get the default parameters from server
    this.optimService.defaultParams().subscribe(result => {
      this.options=result;
      this.options.router="TomTom";
      this.options.optimMode='cost';
      this.options.regularityRange=10;
    });
    
  }

  /**
   * To be called at any date change in the time picker : it will keep this.currentRecord up to date
   * @param date
   */
  onDateSelect(){
    if(this.initialSolutionDt && this.initialSolutionDt.year && this.initialSolutionDt.month && this.initialSolutionDt.day){
      this.options.initialSolutionDt = this.toTimeStamp(this.initialSolutionDt);
    }

    let timeslotCode = moment(this.options.initialSolutionDt).format("dddd").toUpperCase() + "_" + this.filters.timeSlotAMPM;
 
    var timeSlotId;
    // Compute timeSlot based on day and AM / PM
    for(let timeslot of this.timeSlots){
      if(timeslot.code == timeslotCode){
        timeSlotId = timeslot.id;
        break;
      }
    }    

    this.loadRoutes(this.filters.scenarioMain,this.options.initialSolutionDt,timeSlotId);

  }

  loadRoutes(scenarioMain, calendarDt, timeslotId){
    this.scenarioService.listRoutes({
      scenarioMain:scenarioMain,
      calendarDt:calendarDt,
      timeSlotId:timeslotId,
    } as ScenarioFilter).subscribe(routes=>{
      this.options.initialSolutionRoutes = routes;
    });
  }


  toggleRouter(sRouter){
    this.options.router=sRouter
  }

  validate(){
    this.activeModal.close(this.options);
  }

  /**
   * Conversion into GMT timestamp at midnight for dates comparison
   * @param date NgbDateStruct
   * @return number : a timestamp in ms
   */
  toTimeStamp(date:NgbDateStruct) : number{
    return moment().year(date.year).month(date.month-1).date(date.day)
                   .utcOffset(0).hours(0).minutes(0).seconds(0).milliseconds(0).valueOf();
  }  

}