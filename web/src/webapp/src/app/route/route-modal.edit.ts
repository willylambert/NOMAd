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

import { NgbActiveModal,NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { faWheelchair,faChild } from '@fortawesome/free-solid-svg-icons';

import { Route } from './route';
import { RoutePOI } from './route.poi';
import { Site, OpeningHours } from '../site/site';
import { SiteService } from '../site/site.service';
import { VehicleCategory } from '../vehicle-category/vehicle-category';
import { VehicleCategoryService } from '../vehicle-category/vehicle-category.service';
import { ScenarioService } from '../scenario/scenario.service';
import { Scenario } from '../scenario/scenario';
import { ThesaurusService } from '../thesaurus/thesaurus.service';

@Component({
  templateUrl: './route-modal.edit.html',
  styleUrls: ['./route.scss']
})
export class RouteModalEdit {

  // In case the input route is linked to a scenario
  @Input('scenario') scenario: Scenario;

  // The input route
  @Input('route') route: Route;

  // The input timeslot
  @Input('timeslotId') timeslotId: string;

  // The title for the popup
  @Input('title') title: string;

  // The list of institutions
  @Input('institutions') institutions: Site[];

  // The list of transporters
  @Input('transporters') transporters: Site[];

  vehicleCategories : VehicleCategory[];

  // List of possible depots
  depots : Site[];

  // List of possible scenarios
  scenarios : Scenario[];
  // The new scenario in case we want to copy the current scenario in a new scenario
  newScenario : Scenario;
  alerts:{type: string,message: string}[];

  // Depot + the previous verions to handle depot changes
  depot : Site;
  previousDepot : Site;

  // Tell whether some changes occurred in the list of POIs
  bPOIsChanged:boolean;

  // Local elements to be modified before insertion into this.routes
  label:string;
  vehicleCategory:VehicleCategory;
  POIs:RoutePOI[];
  startTime : NgbTimeStruct;
  endTime : NgbTimeStruct;
  withStartTime : boolean;
  withEndTime : boolean;
  scenarioLabel : string;

  faWheelchair = faWheelchair;
  faChild = faChild;

  // The considered institution opening hours
  openingHours : OpeningHours;
  bMissingOpeningHours : boolean;

  // Count of the number of passengers for vehicle type control
  countByTransportMode:any
  // Tell whether some of the passengers can not be transported with one vehicle of the current chosen vehicle type
  bValidVehicleType:boolean

  constructor(
    public activeModal: NgbActiveModal,
    public vehicleCategoryService: VehicleCategoryService,
    public scenarioService : ScenarioService,
    public siteService : SiteService,
    public thesaurusService : ThesaurusService
    ) {
    this.scenarios=[];
    this.alerts=[];
    this.openingHours=new OpeningHours();
    this.bMissingOpeningHours = false;
    this.countByTransportMode = {};
    this.bValidVehicleType=true;
  }

  /**
   * Called when modal is ready
   */
  ngOnInit() {
    this.depots=this.institutions.concat(this.transporters);
    // Copy the input route into the local modal fields
    this.label=this.route.label;
    this.vehicleCategory=this.route.vehicleCategory;
    this.POIs=this.route.POIs;
    this.bPOIsChanged=false;
    this.withStartTime = this.route.start_hr!=undefined;
    this.withEndTime = this.route.end_hr!=undefined;
    if(this.withStartTime && this.withEndTime){
      // We choose end time by default if both are present (normally they should not be both present)
      this.withStartTime = false;
    }
    this.startTime=this.timeStampToTimeStruct(this.route.start_hr);
    this.endTime=this.timeStampToTimeStruct(this.route.end_hr);
    // In case startTime or endTime are undefined, set default values
    if(this.route.bMorning){
      if(this.startTime==undefined){
        this.startTime={hour:8,minute:0,second:0};
      }
      if(this.endTime==undefined){
        this.endTime={hour:12,minute:0,second:0};
      }
      this.setMorningOpeningHours();
    }
    else{
      if(this.startTime==undefined){
        this.startTime={hour:14,minute:0,second:0};
      }
      if(this.endTime==undefined){
        this.endTime={hour:18,minute:0,second:0};
      }
      this.setAfternoonOpeningHours()
    }

    // Initialization of the vehicle categories
    this.loadVehicleCategories();
    // Initialization of the scenarios
    this.scenarioService.list({}).subscribe(scenarios => {
      // Find the current scenario label and put all the other scenarios in the scenarios variable.
      // Current scenario is excluded from the scenarios list because we don't want a route to be copy from
      //   a scenario into the same scenario (this would cause display issues in the route menu)
      for(let scenario of scenarios as Scenario[]){
        if(scenario.id == this.route.scenario_main_id){
          this.scenarioLabel=scenario.label;
        }
        else{
          this.scenarios.push(scenario);
        }
      }
    });
    // Initialization of the depot. In case the depot can not be set automatically, we left it undefined
    if(this.POIs.length>0){
      if( this.POIs[0].site_type_code=='INSTITUTION' &&
          this.POIs[this.POIs.length-1].site_type_code=='INSTITUTION' &&
          this.POIs[0].id == this.POIs[this.POIs.length-1].id){
        // The first and last points are the same and represent an institution, we assume this is the depot
        for(let institution of this.institutions){
          if(institution.id == this.POIs[0].site_main_id){
            this.depot = institution;
          }
        }
        if(this.depot==undefined){
          // In that case retry with transporter depots
          for(let transporter of this.transporters){
            if(transporter.id == this.POIs[0].site_main_id){
              this.depot = transporter;
            }
          }
        }
      }
    }
    else{
      // Empty list of POIs: we will use the first available institution as a depot and add it as a start/end POI.
      this.depot=this.institutions[0];
      this.addDepot();
    }
    this.previousDepot=this.depot
    // Count the number of passengers for each transport mode, for vehicle type control
    this.thesaurusService.list({cat:'HR_MAIN_TRANSPORTMODE'}).subscribe(transportModes=>{
      for(let transportMode of transportModes){
        this.countByTransportMode[transportMode.code]=0;
        for(let POI of this.POIs){
          if(POI.hr_id!=undefined && POI.transport_mode_code == transportMode.code){
            this.countByTransportMode[transportMode.code]++;
          }
        }
      }
      this.checkVehicleCapacities();
    })


  }

  /**
   * Load the vehicle categories.
   * In a scenario context, we load only the vehicles that are linked to the scenario.
   */
  loadVehicleCategories(){
    if(this.scenario !=undefined){
      this.vehicleCategories = [];
      for(let fleetItem of this.scenario.fleet){
        this.vehicleCategories.push(fleetItem.data)
      }
    }
    else{
      // Initialization of the vehicle categories
      this.vehicleCategoryService.list({search: "", startIndex: null, length: null})
      .subscribe(vehicleCategories => {
          this.vehicleCategories = vehicleCategories as VehicleCategory[];
        }
      );
    }
  }

  /**
   * Compute the opening hours for the last institution in the route.
   * We keep the latest opening hours found, and more precisely those with the latest start_hr
   */
  setMorningOpeningHours(){
    // Look for the last institution in the route
    for(var i=this.POIs.length;i>0;i--){
      if(this.POIs[i-1].site_type_code=='INSTITUTION'){
        this.siteService.get(this.POIs[i-1].site_main_id).subscribe(site =>{
          // Last institution found : now look for the opening hours for delivery.
          // In the set of opening hours for delivery, filter on those coresponding
          //   to the route time slot and keep the opening hours this the latest start hour
          var lastOpeningStartHour;
          if((site as Site).deliveryHours != null && (site as Site).deliveryHours != undefined){
            for(let openingHours of (site as Site).deliveryHours){
              if(openingHours.timeslot_th == this.timeslotId){
                if(lastOpeningStartHour==undefined || lastOpeningStartHour<openingHours.start_hr){
                  lastOpeningStartHour=openingHours.start_hr;
                  this.openingHours=openingHours;
                }
              }
            }
          }
          // If an opening hours period was found, use it to set the startTime and endTime
          if(lastOpeningStartHour!=undefined){
            if(this.route.start_hr ==undefined || this.route.start_hr == null){
              // In this case this.startTime needs to be computed : the proposed
              //   start time for the route will be an opening hour (for delivery) in the last
              //   institution of the route - some time (1 hour) for the travel
              this.startTime = this.timeStampToTimeStruct(lastOpeningStartHour-3600*1000);
            }
            if(this.route.end_hr ==undefined || this.route.end_hr == null){
              // In this case this.sendTime needs to be computed : the proposed
              //   end time for the route will be an opening hour (for delivery) in the last
              //   institution of the route
              this.endTime = this.timeStampToTimeStruct(lastOpeningStartHour);
            }
          }
          else{
            this.bMissingOpeningHours = true;
          }
        })
        break;
      }
    }
  }

  /**
   * Compute the opening hours for the first institution in the route.
   * We keep the earliest opening hours found, and more precisely those with the earliest end_hr
   */
  setAfternoonOpeningHours(){
    // Look for the first institution in the route
    for(var i=0;i<this.POIs.length;i++){
      if(this.POIs[i].site_type_code=='INSTITUTION'){
        this.siteService.get(this.POIs[i].site_main_id).subscribe(site =>{
          // First institution found : now look for the opening hours for pickup.
          // In the set of opening hours for pickup, filter on those coresponding
          //   to the route time slot and keep the opening hours this the earliest end hour
          var firstOpeningEndHour;
          if((site as Site).pickupHours != null && (site as Site).pickupHours != undefined){
            for(let openingHours of (site as Site).pickupHours){
              if(openingHours.timeslot_th == this.timeslotId){
                if(firstOpeningEndHour==undefined || firstOpeningEndHour>openingHours.end_hr){
                  firstOpeningEndHour=openingHours.end_hr;
                  this.openingHours=openingHours;
                }
              }
            }
          }
          // If an opening hours period was found, use it to set the startTime and endTime
          if(firstOpeningEndHour!=undefined){
            if(this.route.start_hr ==undefined || this.route.start_hr == null){
              // In this case this.startTime needs to be computed : the proposed
              //   start time for the route will be a closing hour (for pickup) in the first
              //   institution of the route
              this.startTime = this.timeStampToTimeStruct(firstOpeningEndHour);
            }
            if(this.route.end_hr ==undefined || this.route.end_hr == null){
              // In this case this.endTime needs to be computed : : the proposed
              //   end time for the route will be a closing hour (for pickup) in the first
              //   institution of the route + some time (1 hour) for the travel
              this.endTime = this.timeStampToTimeStruct(firstOpeningEndHour+3600*1000);
            }
          }
          else{
            this.bMissingOpeningHours = true;
          }
        })
        break;
      }
    }
  }

  /**
   * Activate end time
   */
  toggleEndTime(){
    this.withStartTime=false;
    this.withEndTime=true;
    // Clear directions since the routing will have to be done with an arrival time
    this.route.clearDirections();
  }

  /**
   * Activate start time
   */
  toggleStartTime(){
    this.withStartTime=true;
    this.withEndTime=false;
    // Clear directions since the routing will have to be done with a departure time
    this.route.clearDirections();
  }

  /**
   * Deactivate start time and end time
   */
  toggleTime(){
    this.withStartTime=false;
    this.withEndTime=false;
    // Clear directions since the routing will have to be done without time constraints
    this.route.clearDirections();
  }

  /**
   * Called when user clicks the validate button.
   * This will copy the local modal fields into the route and leave the modal
   */
  validate(){
    if(this.bPOIsChanged){
      this.route.clearDirections();
      this.route.bChanged=true;
    }
    if(this.label!=this.route.label){
      this.route.bChanged=true;
    }
    if(this.route.vehicleCategory && (!this.vehicleCategory || this.vehicleCategory.id!=this.route.vehicleCategory.id)){
      this.route.bChanged=true;
    }
    if(!this.route.vehicleCategory && this.vehicleCategory){
      this.route.bChanged=true;
    }
    this.route.label=this.label;
    this.route.vehicleCategory=this.vehicleCategory;
    this.route.POIs=this.POIs;
    if(!this.withStartTime){
      if(this.route.start_hr!=undefined){
        this.route.start_hr=undefined;
        this.route.bChanged=true;
      }
    }
    else{
      // In case startTime is undefined or invalid, we do not modify start_hr
      if(this.startTime && this.startTime.hour!=undefined && this.startTime.minute!=undefined){
        var start_hr=this.startTime.hour*3600000+this.startTime.minute*60000;
        if(start_hr!=this.route.start_hr){
          this.route.start_hr=start_hr;
          this.route.bChanged=true;
        }
      }
    }
    if(!this.withEndTime){
      if(this.route.end_hr!=undefined){
        this.route.end_hr=undefined;
        this.route.bChanged=true;
      }
    }
    else{
      // In case endTime is undefined or invalid, we do not modify end_hr
      if(this.endTime!=undefined && this.endTime.hour!=undefined && this.endTime.minute!=undefined){
        var end_hr=this.endTime.hour*3600000+this.endTime.minute*60000;
        if(end_hr!=this.route.end_hr){
          this.route.end_hr=end_hr;
          this.route.bChanged=true;
        }
      }
    }
    this.activeModal.close('Y');
  }

  /**
   * Add a depot by inserting a POI at the first and last position of the route
   * Try to do this in a smart way so as to avoid having twice the same POI in the route if possible
   */
  addDepot(){
    var newStartPOI =new RoutePOI();
    var newEndPOI =new RoutePOI();
    newStartPOI.fromInstitution(this.depot);
    newEndPOI.fromInstitution(this.depot);
    if(this.POIs.length==0){
      // Insert 2 POI so that when inserting a new HR, we don't have to insert again a depot POI
      this.POIs.push(newStartPOI);
      this.POIs.push(newEndPOI);
      this.bPOIsChanged=true;
    }
    else{
      // Insert the depot at the last position except if the previous last position was already the depot
      if(this.POIs[this.POIs.length-1].id!=newEndPOI.id){
        this.POIs.push(newEndPOI)
        this.bPOIsChanged=true;
      }
      // Insert the depot at the first position except if the previous first position was already the depot
      if(this.POIs[0].id!=newStartPOI.id){
        this.POIs.unshift(newStartPOI);
        this.bPOIsChanged=true;
      }
    }
  }

  /**
   * Try to remove the current depot before inserting a new one.
   * We want to do it in a smart way, so as to make sure any HR POI present in the list of POIs
   *   is always associated to its institution POI
   */
  removeDepot(){
    // If there are some HR POIs attached to the previous depot, we have make sure the previous depot
    //  is still present in the list of POIs
    var bPreviousDepotNeededAsInstitution = false;
    for(let POI of this.POIs){
      if(POI.site_type_code=='HOME'){
        for(let institution of POI.institutions){
          if(institution.id == this.previousDepot.id){
            bPreviousDepotNeededAsInstitution = true;
            break;
          }
        }
      }
      if(bPreviousDepotNeededAsInstitution){
        break;
      }
    }
    // Check whether the previous depot is used as a POI inside the route
    for(var i=1;i<this.POIs.length-1;i++){
      if(this.POIs[i].site_main_id==this.previousDepot.id){
        bPreviousDepotNeededAsInstitution = false;
        break;
      }
    }
    if(bPreviousDepotNeededAsInstitution){
      // We need keep one occurrence of the depot
      if(this.route.bMorning){
        // Morning : delete only the first occurrence
        this.POIs.shift();
        this.bPOIsChanged=true;
      }
      else{
        // Afternoon : delete only the last occurrence
        this.POIs.pop();
        this.bPOIsChanged=true;
      }
    }
    else{
      // Delete both occurrences
      this.POIs.shift();
      this.POIs.pop();
      this.bPOIsChanged=true;
    }
  }

  /**
   * Function to be called on depot change from the select box
   */
  onDepotChange(){
    if(this.previousDepot){
      this.removeDepot();
    }
    if(this.depot){
      this.addDepot();
    }
    this.previousDepot = this.depot;
  }

  /**
   * Conversion between unix timstamps and NgbTimeStruct without taking time zones into account
   * @param timestamp number : unix timestamp to convert
   * @return NgbTimeStruct : a time as NgbTimeStruct
   */
  private timeStampToTimeStruct(timestamp : number) : NgbTimeStruct{
    // Do not use moment for conversion since we do not want timezone to be taken into account
    var result;
    if(timestamp!=undefined && timestamp!=null){
      var iNumberOfHours = Math.floor(timestamp/3600000);
      var iNumberOfMinutes = Math.floor((timestamp-iNumberOfHours*3600000)/60000);
      result = {hour:iNumberOfHours,minute:iNumberOfMinutes,second:0};
    }
    return result;
  }

  /**
   * Copy a route from the current scenario into another scenario
   */
  copy(){
    if(this.newScenario!= undefined && this.newScenario.id != undefined && this.newScenario.id != '' &&
       this.newScenario.id != this.route.scenario_main_id){
      this.scenarioService.duplicateRoute({routeId:this.route.id,newScenarioMainId:this.newScenario.id}).subscribe(response => {
        if(response.result){
          this.alerts.push({
            type: 'success',
            message: 'Copie vers le scénario '+this.newScenario.label+' effectuée.',
          })
        }
        else{
          this.alerts.push({
            type: 'danger',
            message: 'Echec de la copie vers le scénario '+this.newScenario.label+'.',
          })
        }
      })
    }
  }

  /**
   * Close an alert. We do not use the alertService because we want the alert to be bound to the modal only.
   * @param alert
   */
  closeAlert(alert){
    this.alerts.splice(this.alerts.indexOf(alert), 1);
  }

  /**
   * Check the vehicle capacities
   */
  checkVehicleCapacities(){
    if(this.vehicleCategory != undefined && this.vehicleCategory.configurations !=undefined){
      var bResult=false;
      // Check all configuration of for the current vehicle type
      for(let configuration of this.vehicleCategory.configurations){
        var configurationOK=true;
        // check all the transport modes involved by the current route
        for(var code in this.countByTransportMode){
          var capacityOK = false;
          for(let capacity of configuration.capacities){
            if(capacity.transported_code == code && this.countByTransportMode[code]<=capacity.quantity){
              // The current transport mode can be transported by one vehicle of the chosen vehicle type with
              //   the current configuration
              capacityOK=true;
              break;
            }
          }
          if(!capacityOK){
            // Some transport modes for the current configuration can not be transported by one vehicle of the
            //   chosen vehicle type
            configurationOK = false;
            break;
          }
        }
        // At least one configuration for the chosen vehicle type enable the transport of all passengers
        //   with one vehicle
        if(configurationOK){
          bResult=true;
          break;
        }
      }
      this.bValidVehicleType= bResult;
    }
  }

}