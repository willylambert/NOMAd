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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { BaseCrud } from '../basecrud';
import { Scenario, ScenarioTransportGroup, ScenarioVehicleCategory } from './scenario';

import { POI, TransportPOI } from '../poi/poi';
import { ScenarioService } from './scenario.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ScenarioModalGroup } from './scenario-modal.group';
import { ScenarioModalFleet } from './scenario-modal.fleet';
import * as moment from 'moment';

import { faWheelchair,faChild,faCalendar,faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { ThesaurusItem } from '../thesaurus/thesaurus';
import { Demand } from '../demand/demand';
import { POIService } from '../poi/poi.service';
import { DemandService } from '../demand/demand.service';
import { HR } from '../hr/hr';
import { HRService } from '../hr/hr.service';
import { Calendar } from '../calendar/calendar';
import { Site } from '../site/site';
import { VehicleCategorySiteQuantity } from '../vehicle-category/vehicle-category-site-quantity';

@Component({
  selector: 'app-scenario-crud',
  templateUrl: './scenario.crud.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioCrud extends BaseCrud implements OnInit  {

  // override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : Scenario;

  // List of POIs to be displayed on the map
  POIs : POI[];

  // List of available Depot for vehicle
  depots: POI[];

  // Incremented after any changes in the list of POIs received from host component
  changeInPOIs: number;

  // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance a change in the list of groups or in the fleet)
  bChanges:boolean;

  faWheelchair = faWheelchair;
  faChild = faChild;
  faCalendar = faCalendar;
  faChevronLeft = faChevronLeft;

  // The demand bounds converted into ms for easier dates comparison
  startDtMs : number;
  endDtMs : number;

  selectedAMPM:string;
  selectedTransportModeCode:string;
  selectedPickupDelivery:string;

  // tells what the active tab should be
  activeTab : string;

  // Whether some on going modifications are present on acceptable durationgs
  durationsModified : boolean;
  serviceDurationsModified : boolean;

  // The available statuses for the scenarios
  statuses:ThesaurusItem[];

  // The parameters for modification of the acceptable durations (as string since the values are typed by user)
  minimalValue : string;
  factor: string;

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected scenarioService:ScenarioService,
    protected thService: ThesaurusService,
    protected POIService: POIService,
    protected demandService: DemandService,
    protected modalService: NgbModal,
    protected HRService:HRService) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(scenarioService,thService,router);
      this.changeInPOIs = 0;
      this.bChanges=false;
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => {
        // for an existing scenario, open the routes tab by default
        this.activeTab="routes";
        // Compute the content of this.POIs so as to display the scenario on map
        this.POIs=[];
        this.depots=[];
        for(let group of currentRecord.groups){
          this.addGroupPOIs(group);
        }
        // After data loading, no changes have occured
        this.bChanges=false;
        // Force the display of POIs on the map
        this.changeInPOIs++;
        // Convert NgbDateStruct structures into unix time stamp for comparison
        this.onDateSelect();
        this.durationsModified = false;
        this.serviceDurationsModified = false;

        // Each vehicle Category could have a limited quantity on each depot
        this.initQuantityByDepot();
      });
      this.minimalValue="30";
      this.factor="2";
  }

  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    // Load Scenario
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
    });
    this.thService.list({cat:'SCENARIO_MAIN_STATUS'}).subscribe(thesaurusItems=>{
      this.statuses = thesaurusItems;
    });
    this.selectedAMPM="AM";
    this.selectedTransportModeCode="MARCHANT";
    this.selectedPickupDelivery="PICKUP";
  }

  /**
   * Called by scenario calendar tab to update POIs displayed on map
   */
  updatePOIs(calendars:Calendar[])
  {
    this.POIs = [];
    var uniqueIndex = {};
    for(let calendar of calendars){
      if(calendar.HRPOI.id!=null && uniqueIndex[calendar.HRPOI.id]==undefined){
        this.POIs.push(calendar.HRPOI);
        uniqueIndex[calendar.HRPOI.id] = true;
      }
      if(calendar.institutionPOI.id!=null && uniqueIndex[calendar.institutionPOI.id]==undefined){
        this.POIs.push(calendar.institutionPOI);
        uniqueIndex[calendar.institutionPOI.id] = true;
      }
    }
    this.changeInPOIs++;
  }

  /**
   * Add new POIs to the list of POIs if needed
   * The added POIs all correspond to the transport demands linked to the group provided as an input
   * This function makes sure no POI is inserted twice and it also set the selected attribute of each POI
   *   to true if required
   * @param group ScenarioVehicleCategory : the input group for which we need to display the POIs on the map
   */
  addGroupPOIs(group:ScenarioTransportGroup){
    for(let demand of group.data.demands){
      var bHRPOIAlreadyExisting=false;
      for(let existingPOI of this.POIs){
        if(existingPOI.id == demand.HRPOI.id){
          existingPOI.selected=true;
          bHRPOIAlreadyExisting=true;
          break;
        }
      }
      if(!bHRPOIAlreadyExisting){
        demand.HRPOI.selected=true;
        this.POIs.push(demand.HRPOI)
      }
      var bInstitutionPOIAlreadyExisting=false;
      for(let existingPOI of this.POIs){
        if(existingPOI.id == demand.institutionPOI.id){
          existingPOI.selected=true;
          bInstitutionPOIAlreadyExisting=true;
          break;
        }
      }
      if(!bInstitutionPOIAlreadyExisting){
        demand.institutionPOI.selected=true;
        this.depots.push(demand.institutionPOI);
        // The institution POI is not a transport POI but it contains the necessary fields for map display
        this.POIs.push(demand.institutionPOI as TransportPOI)
      }
    }
  }

  /**
   * To be called at any date change in the time picker : it will keep this.currentRecord up to date
   * @param date
   */
  onDateSelect(){
    if(this.currentRecord.endDt && this.currentRecord.endDt.year && this.currentRecord.endDt.month && this.currentRecord.endDt.day){
      this.endDtMs=moment().set({
        'year':this.currentRecord.endDt.year,
        'month':this.currentRecord.endDt.month-1,
        'date':this.currentRecord.endDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
    if(this.currentRecord.startDt && this.currentRecord.startDt.year && this.currentRecord.startDt.month && this.currentRecord.startDt.day){
      this.startDtMs=moment().set({
        'year':this.currentRecord.startDt.year,
        'month':this.currentRecord.startDt.month-1,
        'date':this.currentRecord.startDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
  }

  /**
   * Launch the modal for updating groups over an existing scenario
   */
  updateGroups() {
    const modalRef = this.modalService.open(ScenarioModalGroup,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as ScenarioModalGroup).currentRecord = this.currentRecord;
    modalRef.result.then((result) => {
      if(result!=null){
        this.bChanges=true;
        // Compute the content of this.POIs so as to display the scenario on map
        this.POIs=[];
        for(let group of this.currentRecord.groups){
          this.addGroupPOIs(group);
        }
        // Force the display of POIs on the map
        this.changeInPOIs++;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Open a new tab to view the data about one group of demands
   * @param group
   */
  viewGroup(group:ScenarioTransportGroup) {
    var path = this.router.url.replace(/logistics\/scenario\/crud(\/[0-9a-zA-Z-]*)?$/i, "logistics/group/crud/"+group.data.id);
    window.open(path);
  }

  /**
   * Launch the modal for updating a fleet over an existing scenario
   */
  updateFleet() {
    const modalRef = this.modalService.open(ScenarioModalFleet,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as ScenarioModalFleet).currentRecord = this.currentRecord;
    (modalRef.componentInstance as ScenarioModalFleet).depots = this.depots;
    modalRef.result.then((result) => {
      if(result!=null){
        this.bChanges=true;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Create if needed a quantity entry for each depot on each selected vehicle category
   */
  initQuantityByDepot(){
    for(let depot of this.depots){
      for(let vehicleCat of this.currentRecord.fleet){
        var bDepotFound = false;
        if(vehicleCat.data.vehicle_category_site_quantity!=null){
          for(let vehicleCatDepot of vehicleCat.data.vehicle_category_site_quantity){
            if(vehicleCatDepot.site_main_id ==  depot.site_main_id){
              bDepotFound = true;
              // Needed as server does not provide site label
              vehicleCatDepot.site_main_label = depot.label;
              break;
            }
          }
        }else{
          vehicleCat.data.vehicle_category_site_quantity = [];
        }
        if(!bDepotFound){
          vehicleCat.data.vehicle_category_site_quantity.push( new VehicleCategorySiteQuantity(depot.site_main_id,true,null, depot.label));
        }
      }
    }
  }

  /**
   * Open a new tab to view the data about a vehicle category
   * @param group
   */
  viewVehicleCategory(vehicleCategory:ScenarioVehicleCategory) {
    var path = this.router.url.replace(/logistics\/scenario\/crud(\/[0-9a-zA-Z-]*)?$/i, "data/vehicle-category/crud/"+vehicleCategory.data.id);
    window.open(path);
  }

  /**
   * Triggered when user clicks on the link to go back to the list.
   */
  backToList() {
    this.router.navigate([this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list")]);
  }

  /**
   * Compute the acceptable duration by applying an factor + minimal value function to the direct durations
   */
  computeAcceptableDurations(){
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        if(this.selectedAMPM=="AM"){
          // Apply the modification only to the durations that are available
          if(demand.HRPOI.home_to_institution_duration!=undefined
              && demand.HRPOI.home_to_institution_duration!=null){
            var newDuration = demand.HRPOI.home_to_institution_duration*parseFloat(this.factor);
            // Make sure we have a number of milliseconds with 3 ending zeros
            this.durationsModified=true;
            demand.HRPOI.home_to_institution_acceptable_duration=Math.round(newDuration/1000)*1000;
            if(demand.HRPOI.home_to_institution_acceptable_duration < 60000*parseFloat(this.minimalValue)){
              demand.HRPOI.home_to_institution_acceptable_duration = 60000*parseFloat(this.minimalValue);
            }
          }
        }
        else{
          // Apply the modification only to the durations that are available
          if(demand.HRPOI.institution_to_home_duration!=undefined
            && demand.HRPOI.institution_to_home_duration!=null){
            var newDuration = demand.HRPOI.institution_to_home_duration*parseFloat(this.factor);
            // Make sure we have a number of milliseconds with 3 ending zeros
            this.durationsModified=true;
            demand.HRPOI.institution_to_home_acceptable_duration=Math.round(newDuration/1000)*1000;
            if(demand.HRPOI.institution_to_home_acceptable_duration < 60000*parseFloat(this.minimalValue)){
              demand.HRPOI.institution_to_home_acceptable_duration = 60000*parseFloat(this.minimalValue);
            }
          }
        }
      }
    }
  }

  /**
   * Set all the acceptable duration using the default function (same as the one used on server side)
   */
  resetDurations(){
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        if(this.selectedAMPM=="AM"){
          // Apply the reset only to the durations that can be viewed
          if(demand.HRPOI.home_to_institution_duration!=undefined
             && demand.HRPOI.home_to_institution_duration!=null){
            var newDuration = 0;
            if(demand.HRPOI.home_to_institution_duration < 10*60000){
              newDuration = demand.HRPOI.home_to_institution_duration+15*60000;
            }
            else{
              if(demand.HRPOI.home_to_institution_duration < 30*60000){
                newDuration = demand.HRPOI.home_to_institution_duration+20*60000;
              }
              else{
                if(demand.HRPOI.home_to_institution_duration < 45*60000){
                  newDuration = demand.HRPOI.home_to_institution_duration+30*60000;
                }
                else{
                  if(demand.HRPOI.home_to_institution_duration < 90*60000){
                    newDuration = 1.5*demand.HRPOI.home_to_institution_duration;
                  }
                  else{
                    newDuration = 1.3*demand.HRPOI.home_to_institution_duration;
                  }
                }
              }
            }
            // Make sure we have a number of milliseconds with 3 ending zeros
            this.durationsModified=true;
            demand.HRPOI.home_to_institution_acceptable_duration=Math.round(newDuration/1000)*1000;
          }
        }
        else{
          // Apply the reset only to the durations that can be viewed
          if(demand.HRPOI.institution_to_home_duration!=undefined
            && demand.HRPOI.institution_to_home_duration!=null){
            var newDuration = 0;
            if(demand.HRPOI.institution_to_home_duration < 10*60000){
              newDuration = demand.HRPOI.institution_to_home_duration+15*60000;
            }
            else{
              if(demand.HRPOI.institution_to_home_duration < 30*60000){
                newDuration = demand.HRPOI.institution_to_home_duration+20*60000;
              }
              else{
                if(demand.HRPOI.institution_to_home_duration < 45*60000){
                  newDuration = demand.HRPOI.institution_to_home_duration+30*60000;
                }
                else{
                  if(demand.HRPOI.institution_to_home_duration < 90*60000){
                    newDuration = 1.5*demand.HRPOI.institution_to_home_duration;
                  }
                  else{
                    newDuration = 1.3*demand.HRPOI.institution_to_home_duration;
                  }
                }
              }
            }
            // Make sure we have a number of milliseconds with 3 ending zeros
            this.durationsModified=true;
            demand.HRPOI.institution_to_home_acceptable_duration=Math.round(newDuration/1000)*1000;
          }
        }
      }
    }
  }

  /**
   * Reset the acceptable durations to the state that is currently saved to database
   */
  cancelDurations(){
    this.scenarioService.get(this.currentRecord.id).subscribe(record => {
      this.currentRecord = record as Scenario;
      this.durationsModified=false;
    });
  }

  /**
   * Save the acceptable durations to database
   */
  saveDurations(){
    // Collect the data to be sent to server
    var durations=[];
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        durations.push({
          id:demand.HRPOI.home_to_institution_id,
          acceptable_duration:demand.HRPOI.home_to_institution_acceptable_duration
        })
        durations.push({
          id:demand.HRPOI.institution_to_home_id,
          acceptable_duration:demand.HRPOI.institution_to_home_acceptable_duration
        })
      }
    }
    this.POIService.setAcceptableDurations(durations).subscribe(response => {
      this.durationsModified=false;
    });
  }

  /**
   * In case one direct travel duration is not available for a transport demand, get it
   * @param demand Demand : the demand for which there is no direct duration
   */
  getDuration(demand : Demand){
    this.demandService.get(demand.id).subscribe(response => {
      if(response!=undefined){
        demand.HRPOI.home_to_institution_duration = (response as Demand).HRPOI.home_to_institution_duration;
        demand.HRPOI.institution_to_home_duration = (response as Demand).HRPOI.institution_to_home_duration;
      }
    });
  }

  /**
   * In case one default acceptable travel duration is not available for a transport demand, get it
   * @param demand Demand : the demand for which there is no default acceptable travel duration
   */
  getAcceptableDuration(demand:Demand){
    this.POIService.updateAcceptableDurations([demand.HRPOI.id]).subscribe(result => {
      // Since a list of one POI was sent to server, we should get a list of exactly one POI as a result
      // Browse all the institutions in case tthe HR linked to the POI is linked to several institutions
      for(let acceptableDuration of result[0].acceptableDurations){
        if(acceptableDuration.institutionPOIId == demand.institutionPOI.id){
          demand.HRPOI.home_to_institution_acceptable_duration = acceptableDuration.toInstitution;
          demand.HRPOI.institution_to_home_acceptable_duration = acceptableDuration.fromInstitution;
          break;
        }
      }
    })
  }

  /**
   * Multiply the service durations by a floating number
   * @param multiple string : floating number as typed by user
   */
  multiplyServiceDurationsBy(multiple:string){
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        if(demand.HRPOI.transport_mode_code==this.selectedTransportModeCode){
          // Apply the multiplication only to the service durations that can be viewed
          if(this.selectedPickupDelivery=="PICKUP"){
            if(demand.HRPOI.hr_pickup_duration!=undefined && demand.HRPOI.hr_pickup_duration!=null){
              this.serviceDurationsModified=true;
              var newDuration = demand.HRPOI.hr_pickup_duration*parseFloat(multiple);
              // Make sure we have a number of milliseconds with 3 ending zeros
              demand.HRPOI.hr_pickup_duration=Math.round(newDuration/1000)*1000;
            }
          }
          else{
            if(demand.HRPOI.hr_delivery_duration!=undefined && demand.HRPOI.hr_delivery_duration!=null){
              this.serviceDurationsModified=true;
              var newDuration = demand.HRPOI.hr_delivery_duration*parseFloat(multiple);
              // Make sure we have a number of milliseconds with 3 ending zeros
              demand.HRPOI.hr_delivery_duration=Math.round(newDuration/1000)*1000;
            }
          }
        }
      }
    }
  }

  /**
   * Increase or decrease the service duration with a integer number of seconds entered by user
   * @param addition string : integer number of seconds as typed by user
   */
  addToServiceDurations(addition:string){
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        if(demand.HRPOI.transport_mode_code==this.selectedTransportModeCode){
          // Apply the addition only to the service durations that can be viewed
          if(this.selectedPickupDelivery=="PICKUP"){
            if(demand.HRPOI.hr_pickup_duration!=undefined && demand.HRPOI.hr_pickup_duration!=null){
              this.serviceDurationsModified=true;
              demand.HRPOI.hr_pickup_duration += 1000*parseFloat(addition);
            }
          }
          else{
            if(demand.HRPOI.hr_delivery_duration!=undefined && demand.HRPOI.hr_delivery_duration!=null){
              this.serviceDurationsModified=true;
              demand.HRPOI.hr_delivery_duration += 1000*parseFloat(addition);
            }
          }
        }
      }
    }
  }

  /**
   * Set all the service duration to a integer number of seconds entered by user
   * @param resetValue string : integer number of seconds as typed by user
   */
  resetServiceDurationsTo(resetValue:string){
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        if(demand.HRPOI.transport_mode_code==this.selectedTransportModeCode){
          this.serviceDurationsModified=true;
          if(this.selectedPickupDelivery=="PICKUP"){
            demand.HRPOI.hr_pickup_duration = 1000*parseFloat(resetValue);
          }
          else{
            demand.HRPOI.hr_delivery_duration = 1000*parseFloat(resetValue);
          }
        }
      }
    }
  }

  /**
   * Reset the service durations to the state that is currently saved to database
   */
  cancelServiceDurations(){
    this.scenarioService.get(this.currentRecord.id).subscribe(record => {
      this.currentRecord = record as Scenario;
      this.serviceDurationsModified=false;
    });
  }

  /**
   * Save the service durations to database
   */
  saveServiceDurations(){
    // Collect the data to be sent to server
    var durations:HR[]=[];
    for(let group of this.currentRecord.groups){
      for(let demand of group.data.demands){
        durations.push({
          id:demand.HRPOI.hr_id,
          pickup_duration:demand.HRPOI.hr_pickup_duration,
          delivery_duration:demand.HRPOI.hr_delivery_duration
        } as HR)
      }
    }
    this.HRService.updateDurations(durations).subscribe(response => {
      this.serviceDurationsModified=false;
    });
  }

}
