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
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';

// The fa-icons
import { faWheelchair, faChild, faPlus, faSave, faClock, faCaretLeft, faCaretRight, faEuroSign, faRedo, faLeaf, faTimes,faSpinner} from '@fortawesome/free-solid-svg-icons';
import { Route } from './route';
import { RouteSet } from './route.set';
import { RouteService } from './route.service';
import { SelectablePOISet } from './route.poi';
import { Site } from '../site/site';
import { Scenario, ScenarioFilter } from '../scenario/scenario';
import { SiteService } from '../site/site.service';
import { POIService } from '../poi/poi.service';
import { RouteModalEdit } from './route-modal.edit';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { ScenarioService } from '../scenario/scenario.service';
import { ThesaurusItem } from '../thesaurus/thesaurus';
import * as moment from 'moment';
import { AlertService } from '../alert/alert.service';
import { OptimModalRestore } from '../optim/optim-modal.restore';
import { Optim } from '../optim/optim';
import { OptimService } from '../optim/optim.service';
import { AclActionService } from '../acl/acl-action.service';
import { CrudResult } from '../helpers/crud-result';
import { CalendarService } from '../calendar/calendar.service';
import { CrudNavbarModalConfirmDelete } from '../crud-navbar/crud-navbar-modal.confirm-delete';


/**
 * Class to for routes CRUD
 */
@Component({
  selector: 'app-route-crud',
  templateUrl: './route.crud.html',
  styleUrls: ['./route.scss']
})
export class RouteCrud implements OnInit {

  // the left menu filter
  filters:{
    timeSlotId:string,
    timeSlotDay:{id:number,label:string,code:string},
    timeSlotAMPM:string,
    calendarDt:number,
    scenarioMain:Scenario,
    routeStartDt:number,
    routeEndDt:number
  };

  days:{id:number,label:string,code:string}[];

  timeSlots:ThesaurusItem[];

  // For display in the legend
  weekNumber:number;

  // All the institutions to be diplayed on the map
  institutions:Site[];

  // The list of all available transporters
  transporters : Site[];

  // The set of routes
  routes:RouteSet;

  // The POIs (can be associated to no route)
  POIs: SelectablePOISet;

  // Enable to make sure that controls will be disabled as long as some data are still waiting for loading from server
  bDataLoaded : boolean;

  // The fa icons
  faPlus=faPlus;
  faSave=faSave;
  faCaretLeft=faCaretLeft;
  faCaretRight=faCaretRight;
  faClock = faClock;
  faWheelchair = faWheelchair;
  faChild = faChild;
  faEuroSign = faEuroSign;
  faRedo = faRedo;
  faLeaf = faLeaf;
  faTimes = faTimes;
  faSpinner = faSpinner;

  // The last restored optimization
  optimResultId:string;
  // list of available optims
  optims:Optim[];

  // Count the number of hrs involved in the route
  HRsCount : number;

  // --- COUNTERS THAT ENABLE TO TRIGGER CHANGES IN CHILD COMPONENTS ---

  // Enable to request map refresh
  updateMapCount : number;
  updateMapWithRecenteringCount : number;
  // Enable to request routes display refresh in map
  routesDisplayCount : number;

  // --------- SCENARIO TIMESTAMP BOUNDS (minight GMT)
  startDt:number;
  endDt:number;

  bRestoreInProgress:boolean;


  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private POIService : POIService,
    private SiteService : SiteService,
    private modalService: NgbModal,
    private thesaurusService: ThesaurusService,
    private scenarioService: ScenarioService,
    private alertservice: AlertService,
    private routeService: RouteService,
    private optimService: OptimService,
    private aclService: AclActionService,
    private calendarService:CalendarService
  ) {
    this.filters = {timeSlotId:"",timeSlotDay:{id:0,code:"",label:""},timeSlotAMPM:"",scenarioMain:new Scenario(),calendarDt:Date.now()*1000,routeStartDt:null,routeEndDt:null};
    this.routes = new RouteSet(this.POIService);
    this.SiteService.list({typeCode:"TRANSPORTER",statusCode:"ENABLED",search:null,startIndex:null,length:null}).subscribe((sites) => {
      this.transporters = sites;
    });
    this.POIs=new SelectablePOISet();
    this.updateMapCount = 0;
    this.updateMapWithRecenteringCount = 0;
    this.routesDisplayCount = 0;
    this.institutions = [];
    this.optims=[];
    this.HRsCount=0;

    // Should be provided by a call to the thesaurusService
    this.days=[
      {id:0,label:'Lundi',code:'MONDAY'},
      {id:1,label:'Mardi',code:'TUESDAY'},
      {id:2,label:'Mercredi',code:'WEDNESDAY'},
      {id:3,label:'Jeudi',code:'THURSDAY'},
      {id:4,label:'Vendredi',code:'FRIDAY'},
      {id:5,label:'Samedi',code:'SATURDAY'},
      {id:6,label:'Dimanche',code:'SUNDAY'}
    ];
    this.bDataLoaded = false;
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
   
  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    // Fill the filter with the parameters received through the url
    this.route.params.subscribe(routeParams => {
      this.bDataLoaded = false;
      this.filters.scenarioMain.id = routeParams.scenarioMainId;
      this.filters.calendarDt = parseFloat(routeParams.calendarDt);
      this.filters.timeSlotId = routeParams.timeSlotId;
      this.weekNumber = moment(this.filters.calendarDt).isoWeek();
      this.thesaurusService.list({cat:'TIMESLOT'}).subscribe(thesaurusItems=>{
        this.timeSlots = thesaurusItems;
        this.updateTimeSlotDay();
        this.updateTimeSlotAMPM();
      });
      // Find whether the provided time slot id corresponds to morning or afternoon
      this.thesaurusService.isMorning(this.filters.timeSlotId).subscribe(bMorning=>{
        this.routes.bMorning = bMorning;

        // Load the scenario details
        this.scenarioService.get(this.filters.scenarioMain.id).subscribe((scenario) => {
          this.filters.scenarioMain=scenario as Scenario;
          // Convert the scenario temporal bounds from date struct to timestamps for better comparison
          this.startDt=this.toTimeStamp(this.filters.scenarioMain.startDt);
          this.endDt=this.toTimeStamp(this.filters.scenarioMain.endDt);
          this.scenarioService.listPOIs(this.filters).subscribe((POIs) => {
            this.POIs.list=POIs;
            // Update the acceptable travel durations
            // Normally this is done automatically at route display time, but we have to force it since there
            //   may be no displayed route before the first optim run.
            var aPOIsWithoutAcceptableDuration : string[] = [];
            for(let POI of this.POIs.list){
              // Only the POIs of type HOME are associated to an acceptable duration
              if(POI.site_type_code=='HOME'){
                // The acceptable duration is computed in a different way according to the direction (morning/afternoon)
                if(bMorning){
                  POI.acceptableDuration=POI.home_to_institution_acceptable_duration;
                }
                else{
                  POI.acceptableDuration=POI.institution_to_home_acceptable_duration;
                }
                // Update only the POIs that do not have an acceptable duration or that have an invalid one.
                if(POI.acceptableDuration == undefined || POI.acceptableDuration == 0){
                  aPOIsWithoutAcceptableDuration.push(POI.id);
                }
              }
            }
            this.POIService.updateAcceptableDurations(aPOIsWithoutAcceptableDuration).subscribe(response=>{
            });
            this.setInstitutions();
            this.loadRoutes();
            this.checkData()
            this.bDataLoaded = true;
          });
        });
      });
      // Tell whether there are some optimizations available
      // Notice that we do that only if user is enabled to list optims
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.aclService.userHasAccess(currentUser.user_main_id,'/optim/list').subscribe((response: CrudResult) => {
        if(response.data){
          this.optimService.list({
            search:"",
            descendingOrder:true,
            status_code:"FINISHED",
            scenarioMainId:this.filters.scenarioMain.id,
            timeSlotId:this.filters.timeSlotId,
            calendarDt:this.filters.calendarDt,
            nbDays:null
          }).subscribe((optims)=>{
            this.optims = optims;
          })
        }
      });
     
    });
  }

  /**
   * Knowing the timeslot id, retrieve the item from this.days that matches the timeslot id
   * @return {id:number,label:string,code:string} : an item from this.days;
   */
  retrieveDayFromTimeslotID():{id:number,label:string,code:string}{
    var result;
    for(let timeslot of this.timeSlots){
      if(timeslot.id == this.filters.timeSlotId){
        var dayCode = timeslot.code.substring(0,timeslot.code.length-3);
        for(let day of this.days){
          if(day.code==dayCode){
            result = day
            break;
          }
        }
        break;
      }
    }
    return result;
  }

  /**
   * Update this.filters.timeSlotDay from this.filters.timeSlotId
   */
  updateTimeSlotDay(){
    this.filters.timeSlotDay=this.retrieveDayFromTimeslotID();
  }



  /**
   * Update this.filters.timeSlotAMPM from this.filters.timeSlotId
   */
  updateTimeSlotAMPM(){
    for(let timeslot of this.timeSlots){
      if(timeslot.id == this.filters.timeSlotId){
        this.filters.timeSlotAMPM=timeslot.code.substring(timeslot.code.length-2,timeslot.code.length);
        break;
      }
    }
  }

  /**
   * Update this.filters.timeSlotId and this.filters.calendarDt from this.filters.timeSlotDay and
   *   this.filters.timeSlotAMPM.
   */
  updateTimeSlotId(){
    // Retrieve the day (as an item from this.days) corresponding to this.filters.timeSlotId at the
    //   time this function is being called. This will enable to compute the difference (expressed
    //   as a number of days) to apply to this.filters.calendarDt
    var dayBeforeChange = this.retrieveDayFromTimeslotID();
    for(let timeslot of this.timeSlots){
      if(timeslot.code == this.filters.timeSlotDay.code+'_'+this.filters.timeSlotAMPM){
        // Update this.filters.calendarDt;
        var diff = this.filters.timeSlotDay.id-dayBeforeChange.id;
        this.filters.calendarDt+=diff*86400*1000;
        this.filters.timeSlotId=timeslot.id;
        this.updateView();
        break;
      }
    }
  }


  // --------------- ROUTE AND POI DISPLAY ON MAP ---------------------------------------

  /**
   * Call the router for a route and display the results.
   */
  displayRoutes(){
    this.routesDisplayCount++;
  }

  // --------------- INTERACTION WITH ROUTES ---------------------------------------

  /**
   * Create new route and update the map accordingly (for instance we need update the map labels)
   */
  newRoute(){
    var newRoute = this.routes.newRoute();
    newRoute.scenario_main_id=this.filters.scenarioMain.id;
    this.editRouteModal(newRoute,true);
  }


  
  /**
   * To be called after a route deletion
   */
  onRouteDelete(){
    this.updateMapCount++;
  }

  /**
   * Called from menu
   */
  deleteAllRoutes(){
    const modalRef = this.modalService.open(CrudNavbarModalConfirmDelete);
    var chkDelete = false;
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).aclObject = "route";
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).onCkeck.subscribe((value)=>{
      chkDelete = value;
    });
    modalRef.result.then((result) => {
      if(result=='Y'){
        if(chkDelete){
          for(let route of this.routes.list){
            this.routeService.delete(route).subscribe(response => {
              if(response){
                this.routes.deleteRoute(route);
              }
            })
          }
        }else{
          for(let route of this.routes.list){
            this.routeService.markAsRemoved(route).subscribe(response => {
              if(response){
                this.routes.deleteRoute(route);
              }
            })
          }
        }
      }
    });
  }
  

  /**
   * Edit a route
   * @param route Route : the edited route
   * @param bRouteCreation boolean : whether this is for a route creation of not
   */
  editRouteModal(route : Route, bRouteCreation:boolean){
    const modalRef = this.modalService.open(RouteModalEdit);
    (modalRef.componentInstance as RouteModalEdit).route = route;
    (modalRef.componentInstance as RouteModalEdit).scenario = this.filters.scenarioMain;
    (modalRef.componentInstance as RouteModalEdit).timeslotId = this.filters.timeSlotId;
    (modalRef.componentInstance as RouteModalEdit).title = bRouteCreation ? "Nouvelle Tournée":"";
    (modalRef.componentInstance as RouteModalEdit).institutions = this.institutions;
    (modalRef.componentInstance as RouteModalEdit).transporters = this.transporters;
    modalRef.result.then((result) => {
      if(result=='Y'){
        if(bRouteCreation){
          this.routes.addRoute(route);
        }
        this.updateMapCount++;
        route.computeAcceptableDurations();
        route.checkLoad();
      }
    })
    .catch( error => {
      console.error(error);
    })
  }

  /**
   * Set this.institutions with the list of institutions that have to be diplayed on map, even if they belong
   *   to no route
   */
  setInstitutions(){
    var institutionsIDs=[];
    for(let POI of this.POIs.list){
      for(let institution of POI.institutions){
        if(institution.id != undefined && institution.id != null){
          // We are going to try the inserting of this institution in the list
          var bFound = false;
          for(let institutionsID of institutionsIDs){
            if(institutionsID == institution.id){
              bFound = true;
              break;
            }
          }
          if(!bFound){
            institutionsIDs.push(institution.id)
          }
        }
      }
    }
    // Fill this.institutions attribute by loading full site details
    for(let institutionsID of institutionsIDs){
      this.SiteService.get(institutionsID).subscribe(site => {
        this.institutions.push(site as Site);
        this.updateMapWithRecenteringCount++;
      });
    }
  }

  /**
   * Enable to load routes that were saved into database
   */
  loadRoutes(){
    // Reset all route information before loading new routes
    var bMorning=this.routes.bMorning;
    this.routes=new RouteSet(this.POIService);
    this.routes.bMorning=bMorning;
    this.routes.institutions=this.institutions;
    this.routes.bLoading=true;
    this.scenarioService.listRoutes(this.filters as ScenarioFilter).subscribe(routes=> this.onRoutesAvailable(routes,false));
    this.updateMapWithRecenteringCount++;
  }

  /**
   * When routes are available after an optimization, clean former opimized routes and load
   *   the new ones into this.routes
   * @param routes
   * @param boolean bOverwrite : whether to overwrite routes with the same optim_main_id
   */  
  onOptimizedRoutesAvailable(routes,bOverwrite){
    if(bOverwrite){
      // First extract the optimization run id from the routes, assuming all routes wear the same 
      //   optimization run id
      var sOptimMainId : string;
      for(let route of routes){
        sOptimMainId = route.optim_main_id;
        break;
      }
      // Delete all routes marked with optim_main_id == sOptimMainId
      this.routes.deleteOptimizedRoutes(sOptimMainId);
    }
    // Load the new routes in the usual way
    this.onRoutesAvailable(routes,true);
  }

  /**
   * When routes are available, load them into this.routes
   * @param routes
   * @param boolean bChanged : whether the set of routes has to be saved to database by user or not
   */
  onRoutesAvailable(routes,bChanged : boolean){
    for(let route of routes){
      // In case some errors were received, simplify them for display
      route.simplifiedErrors = this.routeService.synthesizeErrors(['VEHICLE_CAT','HR','TIME'],route);
      this.routes.loadRoute(route,bChanged);
    }
    this.routes.bLoading=false;
    this.POIs.fromRoutes(this.routes);
    this.updateHRsCount();
    this.updateMapWithRecenteringCount++;
  }

  /**
   * Trigger map update without recentering
   */
  updateMap(){
    this.updateHRsCount();
    this.updateMapCount++;
  }

  /**
   * Update the HRS count
   */
  updateHRsCount(){
    this.HRsCount = this.routes.countHRPOIs();
  }

  /**
   * Navigate to the previous week
   */
  previousWeek(){
    this.filters.calendarDt = this.filters.calendarDt-7*86400*1000;
    this.updateView();
  }

  /**
   * Function called when this.filters.calendarDt or this.filters.timeSlotId is modified : it will reload the page
   *   with new input parameters
   */
  updateView(){
    this.calendarService.update({
      scenarioMainId : this.filters.scenarioMain.id,
      calendarDt : this.filters.calendarDt,
      timeSlotId : this.filters.timeSlotId
    }).subscribe(response => {
      // Whatever the response, navigate to the requested week
      var path = this.router.url.replace(
        /logistics\/route\/crud\/[0-9a-zA-Z-]*\/[0-9a-zA-Z-]*\/[0-9a-zA-Z-]*$/i,
        "logistics/route/crud/"+this.filters.scenarioMain.id+"/"+this.filters.calendarDt+'/'+this.filters.timeSlotId
      );
      this.router.navigate([path]);
    });
  }

  /**
   * Navigate to the next week
   */
  nextWeek(){
    this.filters.calendarDt = this.filters.calendarDt+7*86400*1000;
    this.updateView();
  }

  /**
   * Navigate back to scenario crud menu
   */
  viewScenario(){
    var path = this.router.url.replace(
      /logistics\/route\/crud\/[0-9a-zA-Z-]*\/[0-9a-zA-Z-]*\/[0-9a-zA-Z-]*$/i,
      "logistics/scenario/crud/"+this.filters.scenarioMain.id
    );
    this.router.navigate([path]);
  }

  /**
   * Check that all the data that is necessary for optimization is present
   */
  checkData(){
    if(this.filters.scenarioMain.fleet.length==0){
      this.alertservice.error("Aucun véhicule n'est rattaché au scénario");
    }
    else{
      // Count the number of passengers for each transport mode, for vehicle type control
      this.thesaurusService.list({cat:'HR_MAIN_TRANSPORTMODE'}).subscribe(transportModes=>{
        var bTransportModeAlert = false;
        for(let transportMode of transportModes){
          var bHRsFound = false;
          for(let POI of this.POIs.list){
            if(POI.hr_id!=undefined && POI.transport_mode_code == transportMode.code){
              bHRsFound = true;
              break;
            }
          }
          if(bHRsFound){
            // Check whether there is at least one vehicle configuration that enables to
            //   transport the current transport mode
            var bVehicleCategoryFound = false;
            for(let fleetItem of this.filters.scenarioMain.fleet){
              var bConfigurationFound = false;
              for(let configuration of fleetItem.data.configurations){
                var bCapacityFound = false;
                for(let capacity of configuration.capacities){
                  if(capacity.transported_code == transportMode.code && capacity.quantity>0){
                    bCapacityFound = true;
                    break;
                  }
                }
                if(bCapacityFound){
                  bConfigurationFound = true;
                  break;
                }
              }
              if(bConfigurationFound){
                bVehicleCategoryFound = true;
                break;
              }
            }
            if(!bVehicleCategoryFound){
              bTransportModeAlert = true;
              this.alertservice.error("Aucun véhicule avec des places de type "+transportMode.label);
              break;
            }
          }
        }
        if(!bTransportModeAlert){
          // Now we are going to check that the pickup/delivery time is set for every HR
          for(let POI of this.POIs.list){
            if(POI.site_type_code == "HOME"){
              if(POI.hr_pickup_duration == undefined || POI.hr_pickup_duration == 0){
                this.alertservice.error("Temps de montée non défini pour l'usager "+POI.hr_firstname + " "+POI.hr_lastname);
                break;
              }
              if(POI.hr_delivery_duration == undefined || POI.hr_delivery_duration == 0){
                this.alertservice.error("Temps de descente non défini pour l'usager "+POI.hr_firstname + " "+POI.hr_lastname);
                break;
              }
            }
          }
        }
      })
    }
  }

  // Save all routes
  saveRoutes(){
    for(let route of this.routes.list){
      this.routeService.save({
        route:route,
        timeSlotId:this.filters.timeSlotId,
        scenarioMain:this.filters.scenarioMain,
        calendarDt:this.filters.calendarDt
      }).subscribe(response => {
        if(response.result){
          if(response.data!=null && response.data!=undefined && response.data.id!=undefined){
            this.updateMap();
            // Store the route id so that at the next call to saveRoutes, this route will be update
            //   instead of being insered into database
            route.id=response.data.id;
          }
          route.bChanged=false;
        }
      })
    }
  }

  /**
   * Remove all routes linked to the day and direction and scenario and reload new ones
   */
  resetRoutes(){
    const modalRef = this.modalService.open(OptimModalRestore);
    (modalRef.componentInstance as OptimModalRestore).filters = this.filters;
    modalRef.result.then((optim) => {
      if(optim!=undefined && optim!=null && optim.id!=undefined && optim.id!=null){
        this.optimResultId = optim.id;
        this.bRestoreInProgress = true;
        this.routeService.restore(optim.id).subscribe(routes => {          
          this.bRestoreInProgress = false;
          if(routes!=null){
            var bMorning=this.routes.bMorning;
            this.routes = new RouteSet(this.POIService);
            this.routes.bMorning = bMorning;
            this.onRoutesAvailable(routes,true);
          }
        });      
      }
    },error =>{console.log(error)});    
  }

}
