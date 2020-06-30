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

import { BaseRecord } from '../baserecord';
import { TransportPOI } from '../poi/poi';
import { Site } from '../site/site';
import { VehicleCategory } from '../vehicle-category/vehicle-category';
import { POIService } from '../poi/poi.service';
import { RoutePOI } from './route.poi';
import { HR } from '../hr/hr';
import { DataCheckerDetail } from '../datachecker/datachecker-detail';

import { Point } from 'geojson';

/**
 * Class that represent a route
 */
export class Route extends BaseRecord{
  // Client side identifier for routes under creation (id is reserved for routes that were already saved into database)
  routeId : string
  // Route label, must be entered by user
  label:string;
  // The color for drawing the route
  color:string;
  // The list of POIs associated to the route
  POIs:RoutePOI[];
  // A cache for the result of the router
  directions:any;
  // whether this is morning or afternoon
  bMorning:boolean;
  // The vehicle category associated to the route
  vehicleCategory:VehicleCategory;
  // To know whether route can be saved or not
  bChanged:boolean;
  // Date of route
  date_dt:number;
  // Target start and end time for the route in ms (defined by user)
  start_hr:number;
  end_hr:number;
  // Distance and direction as found on server
  distance:number;
  duration:number;
  // Cost of the route
  cost:number;
  // Quantity of CO2 emitted by the route (grams)
  co2:number;
  // the scenario id the route is associated to
  scenario_main_id:string;
  // Whether to display the route on the map or not
  bDisplay:boolean;
  // The optimization instance id in case the route results from an optimization
  optim_main_id:string;

  // total time spent in non-driven time
  waitingDuration:number;

  // The driver associated to the route
  driver:HR;
  // Time stamp (ms) indicating at what time the driver started the route (null for unstarted routes)
  start_driver_dt:number
  // Duration between the start_driver_dt and now (in ms)
  start_driver_duration:number
  // Time stamp (ms) indicating at what time the driver finished the route (null for unfinished routes)
  end_driver_dt:number

  // The list of passengers embarqued in the vehicle at each POI
  load:{ descending:RoutePOI[], before:RoutePOI[], after:RoutePOI[], mounting:RoutePOI[] }[];
  // Whether the vehicle is overloaded for every available configurations
  // Note : It is possible to display exacly on which POIs there are some overloads but in case
  //        the vehicle has several possible configurations, we have to display it for every configurations
  //        which can make information difficult to understand
  bOverload:boolean;

  // Used in route-run list to hide terminated route
  bHide: boolean;

  // The current location of the vehicle serving the route if available
  vehicle_current_location:Point;

  // used for table display
  institutionsLabel:string;
  homesCount:number;

  // Some errors detected by the errors checker (optional)
  errors:DataCheckerDetail[];
  // Simplified array of errors, for a lighter display
  simplifiedErrors:DataCheckerDetail[];

  /**
   * Default constructor
   * @param routeId string : the route temporary id
   * @param color string : the marker color
   * @param bMorning boolean : whether this is morning or afternoon
   */
  constructor(public POIService : POIService,routeId : string,color: string,bMorning : boolean){
    super()
    this.routeId=routeId;
    this.label="";
    this.color=color;
    this.POIs=[];
    this.directions={};
    this.bMorning=bMorning;
    this.bChanged=false;
    this.bDisplay=true;
    this.load=[];
    this.bOverload=false;
    this.errors=[];
  }

  /**
   * toggle the route display
   * @param newValue : the new value for display property
   */
  public toggleDisplay(newValue:boolean){
    this.bDisplay=newValue;
  }

  /**
   * Compute the acceptable transport duration for a home POI in a route
   * @param i number: index of the POI in the route list of POIs
   */
  public computeAcceptableDuration(i:number){
    // In case the POI results from a transport_demand, the acceptable duration already is stored in the POI attributes
    if(this.POIs[i].transport_demand_id){
      if(this.bMorning){
        this.POIs[i].acceptableDuration=this.POIs[i].home_to_institution_acceptable_duration;
      }
      else{
        this.POIs[i].acceptableDuration=this.POIs[i].institution_to_home_acceptable_duration;
      }
    }
    else{
      // We have to find the next institution that matches the POI
      if(this.bMorning){
        for(var j=i+1;j<this.POIs.length;j++){
          for(let institution of this.POIs[i].institutions){
            if(institution.id==this.POIs[j].site_main_id){
              // We have found an institution that matches the current HR POI
              this.POIs[i].acceptableDuration=institution.home_to_institution_acceptable_duration;
            }
          }
        }
      }
      else{
        for(var j=i-1;j>=0;j--){
          for(let institution of this.POIs[i].institutions){
            if(institution.id==this.POIs[j].site_main_id){
              // We have found an institution that matches the current HR POI
              this.POIs[i].acceptableDuration=institution.institution_to_home_acceptable_duration;
            }
          }
        }
      }
    }
  }

  /**
   * Update acceptable duration for every home POI.
   * In case the acceptable duration can not be computed, call server so as to obtain missing acceptable duration information
   */
  public computeAcceptableDurations(){
    // Update acceptableDuration attribute for every POI
    for(var i=0;i<this.POIs.length;i++){
      if(this.POIs[i].site_type_code=='HOME'){
        this.computeAcceptableDuration(i);
      }
    }
    // Check whether acceptableDuration attribute is set and greater than 0 for every Home POI in this.POIs
    var aPOIsWithoutAcceptableDuration : string[] = [];
    for(let POI of this.POIs){
      if((POI.acceptableDuration == undefined || POI.acceptableDuration == 0) && POI.site_type_code=='HOME'){
        aPOIsWithoutAcceptableDuration.push(POI.id);
      }
    }
    this.POIService.updateAcceptableDurations(aPOIsWithoutAcceptableDuration).subscribe(response=>{
      // Associate computed acceptable durations with POIs. Only POIs that did not already have an acceptable duration
      //  should be concerned, others should be ignored;
      for(let POI of response){
        for(var i=0;i<this.POIs.length;i++){
          if(this.POIs[i].id==POI.id){
            // Update this.POIs[i].institutions
            for(var j=0;j<this.POIs[i].institutions.length;j++){
              for(var acceptableDuration of POI.acceptableDurations){
                if(this.POIs[i].institutions[j].poi_id!=undefined && this.POIs[i].institutions[j].poi_id!=null &&
                   this.POIs[i].institutions[j].poi_id==acceptableDuration.institutionPOIId){
                  this.POIs[i].institutions[j].home_to_institution_acceptable_duration=acceptableDuration.toInstitution;
                  this.POIs[i].institutions[j].institution_to_home_acceptable_duration=acceptableDuration.fromInstitution;
                  break;
                }
              }
            }
            // If needed : update the transport demand data in this.POIs[i]
            if(this.POIs[i].transport_demand_id){
              for(var acceptableDuration of POI.acceptableDurations){
                if(this.POIs[i].transport_demand_institution_poi_id==acceptableDuration.institutionPOIId){
                  this.POIs[i].home_to_institution_acceptable_duration=acceptableDuration.toInstitution;
                  this.POIs[i].institution_to_home_acceptable_duration=acceptableDuration.fromInstitution;
                }
              }
            }
            this.computeAcceptableDuration(i);
            break;
          }
        }
      }
      this.computeTimes();
    });
  }

  /**
   * Update pickup and delivery durations for every POI of the route.
   * For instance on some POIs, several HRs may be picked : the pickup durations are summed for all HRs
   *   that are picked up on that POI.
   * This function will fill the pickupDuration and deliveryDuration or each POI in the route
   */
  public updatePickupDeliveryTimes(){
    var deliveryLists=[];
    var pickupLists=[];
    for(var i=0;i<this.POIs.length;i++){
      deliveryLists.push([])
      pickupLists.push([])
    }
    if(this.bMorning){
      for(var i=0;i<this.POIs.length;i++){
        if(this.POIs[i].site_type_code=='HOME'){
          pickupLists[i].push(i);
          // Find the delivery point
          if(i<this.POIs.length-1){
            for(var j=i+1;j<this.POIs.length;j++){
              if(this.POIs[i].transport_demand_institution_id){
                if(this.POIs[j].site_main_id==this.POIs[i].transport_demand_institution_id){
                  deliveryLists[j].push(i);
                  break;
                }
              }
              else{
                if(this.POIs[j].site_type_code=='INSTITUTION'){
                  var tempPOI2 = new RoutePOI();
                  tempPOI2.institutions=this.POIs[i].institutions;
                  if(tempPOI2.matchesInstitutions(this.POIs[j].site_main_id)){
                    deliveryLists[j].push(i);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    else{
      for(var i=this.POIs.length-1;i>=0;i--){
        if(this.POIs[i].site_type_code=='HOME'){
          deliveryLists[i].push(i);
          // Find the pickup point
          if(i>0){
            for(var j=i-1;j>=0;j--){
              if(this.POIs[i].transport_demand_institution_id){
                if(this.POIs[j].site_main_id==this.POIs[i].transport_demand_institution_id){
                  pickupLists[j].push(i);
                  break;
                }
              }
              else{
                if(this.POIs[j].site_type_code=='INSTITUTION'){
                  var tempPOI2 = new RoutePOI();
                  tempPOI2.institutions=this.POIs[i].institutions;
                  if(tempPOI2.matchesInstitutions(this.POIs[j].site_main_id)){
                    pickupLists[j].push(i);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    for(var i=0;i<this.POIs.length;i++){
      var iPickupDuration = 0;
      var iDeliveryDuration = 0;
      for(let j of pickupLists[i]){
        if(this.POIs[j].hr_pickup_duration){
          iPickupDuration += this.POIs[j].hr_pickup_duration;
        }
      }
      for(let j of deliveryLists[i]){
        if(this.POIs[j].hr_delivery_duration){
          iDeliveryDuration += this.POIs[j].hr_delivery_duration;
        }
      }
      this.POIs[i].pickupDuration=iPickupDuration;
      this.POIs[i].deliveryDuration=iDeliveryDuration;
    }
  }

  /**
   * Set the target_hr and target_hr_auto fields
   * @param i : number : index of the poi
   */
  public setTargetHr(i:number){
    this.POIs[i].target_hr_auto=this.POIs[i].routeInfo.startTime*1000;
    // If a manual value was defined, use it instead the auto value
    if(this.POIs[i].target_hr_manual == null || this.POIs[i].target_hr_manual == undefined || this.POIs[i].target_hr_manual == 0){
      this.POIs[i].target_hr=this.POIs[i].target_hr_auto;
    }
    else{
      this.POIs[i].target_hr=this.POIs[i].target_hr_manual;
    }
    this.bChanged=true;
  }

  /**
   * Update the routing information of every POI. In particular, the start and end time is computed for every POI.
   */
   public computeTimes(){
    if(this.directions.routes && this.directions.routes[0] && this.directions.routes[0].legs.length==this.POIs.length-1){
      // Initialization with durations and distances obtained from router response
      for(var i=0;i<this.POIs.length;i++){
        this.POIs[i].routeInfo={
          durationAfter: this.directions.routes[0].legs[i]==undefined?0:this.directions.routes[0].legs[i].duration,
          distanceAfter: this.directions.routes[0].legs[i]==undefined?0:this.directions.routes[0].legs[i].distance,
          startTime: 0,
          endTime: 0,
          hrTransportDuration: 0,
          hrTransportDurationRatio:0
        }
        this.setTargetHr(i);
      }
      // Set start and end time and waiting time for each point
      if(this.end_hr!=undefined){
        var endTime = this.end_hr/1000;
        for(var i=this.POIs.length-1;i>=0;i--){
          // service_duration can be undefined for some POIs, for instance institution POIs
          
          // If previous POI is really close, we assume that serviceDuration was already handled by previous POI
          var serviceDuration = this.POIs[i].service_duration/1000;
          if(this.POIs[i-1]!=undefined && this.POIs[i-1].routeInfo.durationAfter==0){
            serviceDuration = 0;
            this.POIs[i].doNotApplyServiceDuration = true;
          }else{
            this.POIs[i].doNotApplyServiceDuration = false;
          }
          
          this.POIs[i].routeInfo.startTime=endTime-serviceDuration-this.POIs[i].waiting_duration/1000-this.POIs[i].pickupDuration/1000-this.POIs[i].deliveryDuration/1000;
          this.setTargetHr(i);
          this.POIs[i].routeInfo.endTime=endTime;
          endTime = this.POIs[i].routeInfo.startTime - ((i==0) ? 0 : this.POIs[i-1].routeInfo.durationAfter);
        }
      }
      else{
        var startTime = this.start_hr!=undefined ? this.start_hr/1000 : 0;
        for(var i=0;i<this.POIs.length;i++){
          this.POIs[i].routeInfo.startTime=startTime;
          this.setTargetHr(i);

          // If previous POI is really close, we assume that serviceDuration was already handled by previous POI
          var serviceDuration = this.POIs[i].service_duration/1000;
          if(this.POIs[i-1]!=undefined && this.POIs[i-1].routeInfo.durationAfter==0){
            serviceDuration = 0;
            this.POIs[i].doNotApplyServiceDuration = true;
          }else{
            this.POIs[i].doNotApplyServiceDuration = false;
          }

          // service_duration can be undefined for some POIs, for instance institution POIs
          this.POIs[i].routeInfo.endTime=startTime+serviceDuration+this.POIs[i].waiting_duration/1000+this.POIs[i].pickupDuration/1000+this.POIs[i].deliveryDuration/1000,
          startTime = this.POIs[i].routeInfo.endTime + this.POIs[i].routeInfo.durationAfter;
        }
      }
      // computation of the waiting time is a bit more difficult since there may be several institutions in the
      //   list of POIs and we have to find the right one
      if(this.bMorning){
        for(var i=0;i<this.POIs.length;i++){
          if(this.POIs[i].site_type_code=='HOME'){
            for(var j=i+1;j<this.POIs.length;j++){
              if(this.POIs[j].site_type_code=='INSTITUTION'){
                var tempPOI = new TransportPOI();
                tempPOI.institutions=this.POIs[i].institutions;
                if(tempPOI.matchesInstitutions(this.POIs[j].site_main_id)){
                  this.POIs[i].routeInfo.hrTransportDuration=this.POIs[j].routeInfo.startTime-this.POIs[i].routeInfo.endTime;
                  break;
                }
              }
            }
          }
        }
      }
      else{
        for(var i=this.POIs.length-1;i>=0;i--){
          if(this.POIs[i].site_type_code=='HOME'){
            for(var j=i-1;j>=0;j--){
              if(this.POIs[j].site_type_code=='INSTITUTION'){
                var tempPOI = new TransportPOI();
                tempPOI.institutions=this.POIs[i].institutions;
                if(tempPOI.matchesInstitutions(this.POIs[j].site_main_id)){
                  this.POIs[i].routeInfo.hrTransportDuration = this.POIs[i].routeInfo.startTime-this.POIs[j].routeInfo.endTime;
                  break;
                }
              }
            }
          }
        }
      }
      // computation if the waiting percentage if acceptableDuration is defined
      this.waitingDuration=0;
      for(var i=0;i<this.POIs.length;i++){
        if(this.POIs[i].acceptableDuration != undefined && this.POIs[i].acceptableDuration != 0){
          this.POIs[i].routeInfo.hrTransportDurationRatio =
            100*this.POIs[i].routeInfo.hrTransportDuration / (this.POIs[i].acceptableDuration/1000);
        }
        // Compute the waiting duration for the route
        this.waitingDuration+=this.POIs[i].deliveryDuration+this.POIs[i].pickupDuration+this.POIs[i].waiting_duration+this.POIs[i].service_duration;
      }
      this.cost = 0;
      this.co2 = 0;
      if(this.vehicleCategory && this.vehicleCategory.hourly_cost!=undefined){
        this.cost = (this.duration+this.waitingDuration/1000)*this.vehicleCategory.hourly_cost/3600;
      }
      if(this.vehicleCategory && this.vehicleCategory.kilometric_cost!=undefined){
        this.cost += this.distance*this.vehicleCategory.kilometric_cost/1000;
      }
      if(this.vehicleCategory && this.vehicleCategory.daily_cost!=undefined){
        // Daily cost is divided by 2 because the routes count for half a working day
        this.cost += this.vehicleCategory.daily_cost/2;
      }
      if(this.vehicleCategory){
        // The distance must be converted into kilometers since the co2 quantity is expressed in gram per kilometer
        this.co2 = this.distance*this.vehicleCategory.co2_quantity/1000;
      }
    }
    else{
      for(let POI of this.POIs){
        POI.routeInfo=undefined;
      }
    }
    // Update the pickup and delivery durations for each POIs
    this.updatePickupDeliveryTimes();
  }

  /**
   * Clear cache to force computation of the route polyline at the next route display on map
   */
  clearDirections(){
    this.directions={};
    this.duration=undefined;
    this.cost=undefined;
    this.distance=undefined;
    this.computeAcceptableDurations();
    this.checkLoad();
  }

  /**
   * Get the right index for POI insertion in the
   * @param POI TransportPOI : the POI that needs be inserted
   */
  private getInsertIndex(POI : TransportPOI){
    var insertIndex;
    if(POI.site_type_code=='HOME'){
      // Instanciate the POI, otherwise we can not access its methods
      var tempPOI = new TransportPOI();
      tempPOI.institutions=POI.institutions;
      if(this.bMorning){
        // Try to find the insertion index so that the new POI is inserted as late as possible
        for(var i=this.POIs.length-1;i>=0;i--){
          if(POI.transport_demand_institution_id){
            // Case of a transport demand : we have to insert just before the destination institution
            if(this.POIs[i].site_main_id==POI.transport_demand_institution_id){
              insertIndex=i;
              break;
            }
          }
          else{
            // Case of a POI that is not a demand
            if(this.POIs[i].site_type_code=='INSTITUTION'){
              // Check that the institution belongs to the POI institutions list
              if(tempPOI.matchesInstitutions(this.POIs[i].site_main_id)){
                insertIndex=i;
                break;
              }
            }
          }
        }
      }
      else{
        // Insert as late as possible: the easiest solution is to insert just before the last position
        //   (last position is reserved for the arrival depot)
        if(this.POIs.length == 0){
          insertIndex = 0;
        }
        else{
          insertIndex = this.POIs.length-1;
        }
      }
    }
    else{
      // Handle institution POIs insertion
      if(this.bMorning){
        // insert at the end
        insertIndex = this.POIs.length;
      }
      else{
        // insert at the begining
        insertIndex = 0;
      }
    }
    // In case a depot is defined, make sure we do not insert before the start POI nor after the end POI
    if(this.POIs.length>1 &&
       (this.POIs[0].site_type_code=='INSTITUTION'|| this.POIs[0].site_type_code=='TRANSPORTER') &&
       (this.POIs[this.POIs.length-1].site_type_code=='INSTITUTION' || this.POIs[this.POIs.length-1].site_type_code=='TRANSPORTER')&&
       this.POIs[0].id == this.POIs[this.POIs.length-1].id){
      // A depot is defined.
      if(insertIndex==0){
        insertIndex++;
      }
      if(insertIndex==this.POIs.length){
        insertIndex--;
      }
    }
    return insertIndex;
  }

  /**
   * Tell whether a POI corresponding to an institution belongs to the route or not
   * @param institutionId string : an institution id
   * @return boolean: whether the input institution id corresponds to an institution that already has a POI in the route
   */
  checkInstitutionPOI(institutionId : string) : boolean{
    var result = false;
    for(let existingPOI of this.POIs){
      if(existingPOI.site_main_id==institutionId){
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * Add a POI to a route
   * @param POI TransportPOI : poi to be added
   */
  addPOI(POI: TransportPOI){
    // Check that POI does not already belong to the route
    for(let existingPOI of this.POIs){
      if(existingPOI.id==POI.id){
        console.log('POI already in the route');
        return;
      }
    }
    var POIAsRoutePOI:RoutePOI = POI as RoutePOI;
    POIAsRoutePOI.waiting_duration=0;
    // Insertion of the new RoutePOI
    this.POIs.splice(this.getInsertIndex(POI),0,POIAsRoutePOI);
    this.bChanged=true;
    this.clearDirections();
  }

  /**
   * Add a POI corresponding to an institution to a route
   * @param institution Site : institution for which a poi has to be added
   */
  addInstitutionPOI(institution : Site){
    var newRoutePOI =new RoutePOI();
    newRoutePOI.fromInstitution(institution);
    this.POIs.splice(this.getInsertIndex(newRoutePOI),0,newRoutePOI);
    this.bChanged=true;
    this.clearDirections();
  }

  /**
   * Delete a POI from a route, knowing the index of the POI in the route
   * @param indexToDelete number : index of the POI to delete in the route (starting from 0)
   */
  deletePOIFromIndex(indexToDelete:number){
    if(indexToDelete!=undefined){
      this.POIs.splice(indexToDelete,1);
      this.clearDirections();
    }
    this.bChanged=true;
  }

  /**
   * Delete a POI from a route
   * @param POIToDelete RoutePOI : POI to be deleted from the route
   */
  deletePOI(POIToDelete : RoutePOI){
    var indexToDelete;
    for(var i = 0;i<this.POIs.length;i++){
      if(POIToDelete.id==this.POIs[i].id){
        indexToDelete=i;
        break;
      }
    }
    this.deletePOIFromIndex(indexToDelete);
  }

  /**
   * To be called when some directions are received from the router
   * @param directions: directions reveived from routing server
   */
  setDirections(directions: any){
    this.directions = directions;
    if(this.directions.routes && this.directions.routes.length>0){
      this.duration=this.directions.routes[0].duration;
      this.distance=this.directions.routes[0].distance;
    }
    this.computeAcceptableDurations();
    this.checkLoad();
  }

  /**
   * Tell whether a POI can be removed from the route
   * We can not delete a POI that represent an institution if the route contains some
   *    POIs that represent a HR and that are attached only to this institution
   * @param POI RoutePOI: the POI to be removed from the route
   */
  isPOIRemovable(index : number){
    var bResult=true;
    if(this.POIs[index].site_type_code=='INSTITUTION'){
      if(this.bMorning){
        for(var i=0;i<index;i++){
          if(this.POIs[i].site_type_code=='HOME'){
            // Check whether this home POIs has some attached institution POI different than the the input POI
            // and located later in the route
            var bHomeWithoutInstitution = true;
            var homePOI=new TransportPOI();
            homePOI.institutions=this.POIs[i].institutions;
            for(var j=i+1;j<this.POIs.length;j++){
              if(homePOI.transport_demand_institution_id){
                // Case of a home POI that results from a transport demand
                if(this.POIs[j].site_main_id == homePOI.transport_demand_institution_id && j!=index){
                  bHomeWithoutInstitution=false;
                  break;
                }
              }
              else{
                // Case of a home POI that does not result from a transport demand
                if(this.POIs[j].site_type_code=='INSTITUTION' && j!=index){
                  if(homePOI.matchesInstitutions(this.POIs[j].site_main_id)){
                    bHomeWithoutInstitution=false;
                    break;
                  }
                }
              }
            }
            if(bHomeWithoutInstitution){
              bResult=false;
            }
          }
        }
      }
      else{
        for(var i=index+1;i<this.POIs.length;i++){
          if(this.POIs[i].site_type_code=='HOME'){
            // Check whether this home POIs has some attached institution POI different than the the input POI
            // and located earlier in the route
            var bHomeWithoutInstitution = true;
            var homePOI=new TransportPOI();
            homePOI.institutions=this.POIs[i].institutions;
            for(var j=0;j<i;j++){
              if(homePOI.transport_demand_institution_id){
                // Case of a home POI that results from a transport demand
                if(this.POIs[j].site_main_id == homePOI.transport_demand_institution_id && j!=index){
                  bHomeWithoutInstitution=false;
                  break;
                }
              }
              else{
                // Case of a home POI that does not result from a transport demand
                if(this.POIs[j].site_type_code=='INSTITUTION' && j!=index){
                  if(homePOI.matchesInstitutions(this.POIs[j].site_main_id)){
                    bHomeWithoutInstitution=false;
                    break;
                  }
                }
              }
            }
            if(bHomeWithoutInstitution){
              bResult=false;
            }
          }
        }
      }
    }
    return bResult;
  }

  /**
   * Return the list of HR POIs involved in the route
   */
  getHRPOIs(){
    var HRPOIs = [];
    for(let POI of this.POIs){
      if(POI.hr_id != undefined && POI.hr_id != null && POI.hr_id != "" && HRPOIs[POI.hr_id] == undefined){
        HRPOIs[POI.hr_id] = POI;
      }
    }
    return HRPOIs;
  }

  /**
   * Compute the vehicle load in the route
   */  
  computeLoad(){
    this.load=[];
    if(this.bMorning){
      for(var i=0;i<this.POIs.length;i++){
        // For each POI, we compute the vehicle load before and after serving the POI, as well as 
        //   the number of descending passengers and of mounting passengers
        var currentLoad = { descending:[], before:[], after:[], mounting:[] };  
        if(i>0){
          // It seems that deep copy is necessary here
          for(let passenger of this.load[i-1].after){
            currentLoad.before.push(passenger);
          }
        }
        if(this.POIs[i].site_type_code == 'HOME'){
          // This is the case of a passenger that is mounting in the vehicle
          // It seems that deep copy is necessary
          for(let passenger of currentLoad.before){
            currentLoad.after.push(passenger);
          }
          currentLoad.after.push(this.POIs[i])
          currentLoad.mounting.push(this.POIs[i])
        }
        else{
          // Case of a vehicle that arrives at an institution
          // Looking for the passengers that are descending at this institution
          for(let passenger of currentLoad.before){
            var bPassengerIsDescending = false;
            if(passenger.transport_demand_institution_poi_id != undefined &&
               passenger.transport_demand_institution_poi_id != null && 
               passenger.transport_demand_institution_poi_id != ""){
              // Case of a passenger that has a transport demand
              if(passenger.transport_demand_institution_poi_id == this.POIs[i].id){
                // Passenger is descending here
                currentLoad.descending.push(passenger);
                bPassengerIsDescending = true;
              }
            }
            else{
              // Case of a passenger that has no transport demand (only in sandbox mode)
              for(let destinationInstitution of passenger.institutions){
                if(destinationInstitution.poi_id == this.POIs[i].id){
                  // Passenger is descending here
                  currentLoad.descending.push(passenger);
                  bPassengerIsDescending = true;
                  break;
                }
              }
            }
            if(!bPassengerIsDescending){
              currentLoad.after.push(passenger);
            }
          }
        }
        this.load[i]=currentLoad;
      }
    }
    else{
      // The case of a travel back to home is similar to a travel from home except that we browse
      //   POIs from the last one to the first one (and then the role of after and before arrays are switched)
      for(var j=this.POIs.length-1;j>=0;j--){
        // For each POI, we compute the vehicle load before and after serving the POI, as well as 
        //   the number of descending passengers and of mounting passengers
        var currentLoad = { descending:[], before:[], after:[], mounting:[] };  
        if(j<this.POIs.length-1){
          // It seems that deep copy is necessary here
          for(let passenger of this.load[j+1].before){
            currentLoad.after.push(passenger);
          }
        }        
        if(this.POIs[j].site_type_code == 'HOME'){
          // This is the case of a passenger that is descending from the vehicle
          // It seems that deep copy is necessary
          for(let passenger of currentLoad.after){
            currentLoad.before.push(passenger);
          }
          currentLoad.before.push(this.POIs[j]) 
          currentLoad.descending.push(this.POIs[j])    
        }
        else{
          // Case of a vehicle that leaves an institution
          // Looking for the passengers that are mounting at this institution
          for(let passenger of currentLoad.after){
            var bPassengerIsMounting = false;
            if(passenger.transport_demand_institution_poi_id != undefined &&
              passenger.transport_demand_institution_poi_id != null && 
              passenger.transport_demand_institution_poi_id != ""){
             // Case of a passenger that has a transport demand
             if(passenger.transport_demand_institution_poi_id == this.POIs[j].id){
               // Passenger is descending here
               currentLoad.mounting.push(passenger);
               bPassengerIsMounting = true;
             }
            }
            else{                      
              for(let originInstitution of passenger.institutions){
                if(originInstitution.poi_id == this.POIs[j].id){
                  // Passenger is descending here
                  currentLoad.mounting.push(passenger);
                  bPassengerIsMounting = true;
                  break;
                }
              }
            }
            if(!bPassengerIsMounting){
              currentLoad.before.push(passenger);
            }            
          }
        }
        this.load[j]=currentLoad;
      }                
    }    
  }

  /**
   * This function will first make sure the load computation for the route is up-to date
   * Then it will check that at any point of the route the vehicle capacity is respected
   */
  checkLoad(){
    this.computeLoad();
    if(this.vehicleCategory!=undefined && this.vehicleCategory!=null &&
       this.vehicleCategory.configurations !=undefined && this.vehicleCategory.configurations !=null){
      // The vehicle category is defined, we has to check that the route load is compatible
      //   with at least one vehicle configuration
      var bCompatibleConfigurationFound = false;
      for(let configuration of this.vehicleCategory.configurations){
        var bRouteCapacityOverflow = false;
        for(let poiLoad of this.load){
          // for the current POI, compute the load per transport mode
          var bPOICapacityOverflow = false;
          // We also keep track of the total number of seats for the configuration
          var iTotalCount = 0;
          for(let capacity of configuration.capacities){
            var count =0;
            // Considering load after operation on the POI (easier to understand for display on screen)
            for(let HRPOI of poiLoad.after){
              if(HRPOI.transport_mode_code == capacity.transported_code){
                count++;
              }
            }
            iTotalCount+=count;
            if(count>capacity.quantity){
              // Overflow detected on the POI !
              bPOICapacityOverflow = true;
              break;
            }
          }
          // In case some capacities of the current configuration are missing, iTotalCount may differ from
          //   poiLoad.after.length, which also indicates an overlload
          if(bPOICapacityOverflow || poiLoad.after.length>iTotalCount){
            // Overflow detected on the route !
            bRouteCapacityOverflow=true;
            break;
          }
        }
        if(!bRouteCapacityOverflow){
          // Found at least one configuration without overflow
          // We can stop check here
          bCompatibleConfigurationFound = true;
          break;
        }
      }
      this.bOverload=!bCompatibleConfigurationFound;
    }
    else{
      // No vehicle configuration defined
      this.bOverload=false;
    }
  }
}
