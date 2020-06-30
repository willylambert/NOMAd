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

import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// The fa-icons
import { faTimes,faPlus,faCheck,faShuttleVan,faHospital } from '@fortawesome/free-solid-svg-icons';
import { Route } from './route';
import { RouteSet } from './route.set';
import { SelectablePOISet } from './route.poi';
import { Site } from '../site/site';
import { Scenario } from '../scenario/scenario';
import { RouteService } from './route.service';
import { SiteService } from '../site/site.service';
import { POIService } from '../poi/poi.service';
import { ThesaurusItem } from '../thesaurus/thesaurus';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { RouteModalEdit } from './route-modal.edit';
import { RouteModalSave } from './route-modal.save';

/**
 * Class to for routes CRUD
 */
@Component({
  selector: 'app-route-crud-sandbox',
  templateUrl: './route.crud-sandbox.html',
  styleUrls: ['./route.scss']
})
export class RouteCrudSandbox {

  // the left menu filter
  filters:{
    institutions:Site[],
    timeSlotId:string,
    timeSlotDay:{id:number,label:string,code:string},
    timeSlotAMPM:string,
    demands:boolean,
    scenarioMain:Scenario
  };

  // The timeslots
  timeSlots : ThesaurusItem[];
  timeSlotAMPM : String;

  // The list of all available institutions
  institutions : Site[];

  // All the institutions to be diplayed on the map
  involvedInstitutions:Site[];

  // The list of all available transporters
  transporters : Site[];

  // The set of routes
  routes:RouteSet;

  // The POIs (can be associated to no route)
  POIs: SelectablePOISet;

  // Previous filters value (to enable cancel action)
  previousFilters : {
    institutions:Site[],
    timeSlotId:string,
    timeSlotDay:{id:number,label:string,code:string},
    timeSlotAMPM:string,
    demands:boolean,
    scenarioMain:Scenario
  };

  // Indicates whether the scenario overview has to be displayed or not
  bScenarioOverview : boolean

  // The fa icons
  faTimes=faTimes;
  faPlus=faPlus;
  faHospital= faHospital;
  faShuttleVan = faShuttleVan;
  faCheck = faCheck;

  // --- COUNTERS THAT ENABLE TO TRIGGER CHANGES IN CHILD COMPONENTS ---

  // In use to warn the scenario minimap after every change in the routes
  changeInRoutes : number
  // Enable to request the player reset
  optimResultId : string;
  // Enable to request map refresh
  updateMapCount : number;
  updateMapWithRecenteringCount : number;
  // Enable to request routes display refresh in map
  routesDisplayCount : number;

  constructor(
    private RouteService : RouteService,
    private POIService : POIService,
    private SiteService : SiteService,
    private thesaurusService : ThesaurusService,
    private modalService: NgbModal
  ) {
    this.filters = {institutions:[],timeSlotId:"",timeSlotAMPM:"AM",timeSlotDay:{id:null,label:"",code:""},demands:true,scenarioMain:new Scenario()};
    this.routes = new RouteSet(this.POIService);
    this.thesaurusService.list({cat:'TIMESLOT'}).subscribe(thesaurusItems=>{
      this.timeSlots = thesaurusItems;
    });
    this.SiteService.list({typeCode:"INSTITUTION",statusCode:"ENABLED",search:null,startIndex:null,length:null}).subscribe((sites) => {
      this.institutions = sites;
    });
    this.SiteService.list({typeCode:"TRANSPORTER",statusCode:"ENABLED",search:null,startIndex:null,length:null}).subscribe((sites) => {
      this.transporters = sites;
    });
    this.POIs=new SelectablePOISet();
    this.changeInRoutes = 0;
    this.optimResultId = "";
    this.updateMapCount = 0;
    this.updateMapWithRecenteringCount = 0;
    this.routesDisplayCount = 0;
    this.bScenarioOverview = false;
    this.involvedInstitutions = [];
  }

  // --------------- FILTERS HANDLING ---------------------------------------

  /**
   * Triggered on reception of a minimap click event: will set the filters to a specific values and reload routes and POIs
   * In case of unsaved routes, ask user confirmation before changing the filters
   * @param event
   */
  onMinimapClickEvent(event){
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.setFilters(event);
        }
      });
    }
    else{
      this.setFilters(event)
    }
  }

  /**
   * Select timeSlotId from day and PM / AM informations
   * @return string timeSlotId
   */
  getTimeslotId(){
    var timeSlotId="";
    var slotCode = this.filters.timeSlotDay.code + "_" + this.filters.timeSlotAMPM;
    for(let slot of this.timeSlots){
      if(slot.code==slotCode){
        timeSlotId = slot.id;
        break;
      }
    }
    return timeSlotId
  }

  /**
   * Set the filters to a specific values and reload the POIs and the routes
   * @param event
   */
  setFilters(event){
    this.previousFilters = this.copyFilter(this.filters);
    this.filters.institutions=event.value.institutions;
    this.filters.timeSlotDay=event.value.timeSlotDay;
    this.filters.timeSlotAMPM=event.value.timeSlotAMPM;
    this.filters.demands=event.value.demands;
    this.filters.timeSlotId=this.getTimeslotId();
    this.routes.bMorning=event.value.bMorning;
    this.RouteService.listPOIs(this.filters.institutions,this.filters.timeSlotId,this.filters.demands).subscribe((POIs) => {
      this.POIs.list=POIs;
      this.loadRoutes();
    });
  }

  /**
  * Triggered at any change in the scenarios through the user interface.
  */
  changeScenario(event){
    this.bScenarioOverview=false;
    this.filters.scenarioMain=event.value.scenario;
    this.previousFilters = this.copyFilter(this.filters);
    if(event.value.reloadRoutes){
      this.loadRoutes()
    };
  }

  /**
   * Compute the scenario overview
   */
  computeScenarioOverview(){
    this.bScenarioOverview=true;
    this.filters.scenarioMain=new Scenario();
    this.previousFilters = this.copyFilter(this.filters);
    // Reset all POIs, since map is hidden
    this.routes=new RouteSet(this.POIService);
  }

   /**
   * Triggered at any change in this.filters.demands through the user interface.
   */
  onDemandsToggle(){
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.toggleDemands();
        }
        else{
          // Cancel the institution change
          this.filters = this.copyFilter(this.previousFilters);
          this.updateMapWithRecenteringCount++;
        }
      });
    }
    else{
      this.toggleDemands();
    }
  }

  /**
  * Change the demands filter and load data (POIs and routes) accordingly
  */
  toggleDemands(){
    this.filters.demands=!this.filters.demands;
    this.previousFilters = this.copyFilter(this.filters);
    this.RouteService.listPOIs(this.filters.institutions,this.filters.timeSlotId,this.filters.demands).subscribe((POIs) => {
      this.POIs.list=POIs;
      this.loadRoutes();
    });
  }

  /**
   * Triggered at any change in this.filters.institutions through the user interface.
   */
  onInstitutionChange(){
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.changeInstitutions();
        }
        else{
          // Cancel the institution change
          this.filters = this.copyFilter(this.previousFilters);
          this.updateMapWithRecenteringCount++;
        }
      });
    }
    else{
      this.changeInstitutions();
    }
  }

  /**
   * Deep copy of a filter
   * @param inputFilter
   */
  copyFilter(inputFilter){
    return {
      institutions:inputFilter.institutions,
      timeSlotId:inputFilter.timeSlotId,
      timeSlotAMPM:inputFilter.timeSlotAMPM,
      timeSlotDay:(inputFilter.timeSlotDay!=undefined)?{
        id:inputFilter.timeSlotDay.id,
        label:inputFilter.timeSlotDay.label,
        code:inputFilter.timeSlotDay.code
      }:undefined,
      demands:inputFilter.demands,
      scenarioMain:inputFilter.scenarioMain
    }
  }

  /**
   * Change the institution filter and load data (POIs and routes) accordingly
   */
  private changeInstitutions(){
    // Save the current state of the filter so that we can cancel future changes of the institutions filter
    this.previousFilters = this.copyFilter(this.filters);
    if(this.filters.institutions.length>0){
      this.RouteService.listPOIs(this.filters.institutions,this.filters.timeSlotId,this.filters.demands).subscribe((POIs) => {
        this.POIs.list=POIs;
        this.loadRoutes();
      });
    }
    else{
      this.POIs.list=[];
      this.loadRoutes();
    }
  }

  /**
   * Triggered at any change in this.filters.timeSlotId through the user interface.
   */
  onTimeSlotChange(){
    var timeSlotId;
    if(this.filters.timeSlotDay!=undefined){
      var bMorning = this.filters.timeSlotAMPM=="AM";
      timeSlotId=this.getTimeslotId();
    }

    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.changeTimeSlot(timeSlotId,bMorning)
        }
        else{
          // Cancel the timeslot change
          this.filters = this.copyFilter(this.previousFilters);
          this.updateMapWithRecenteringCount++;
        }
      });
    }
    else{
      this.changeTimeSlot(timeSlotId,bMorning)
    }
  }

  /**
   * Change the timeslot and load the route data accordingly
   * @param timeSlotId string : the new timeSlotId
   * @param bMorning boolean : whether the new time slot is in the morning or in the afternoon
   */
  changeTimeSlot(timeSlotId : string, bMorning :boolean){
    this.previousFilters = this.copyFilter(this.filters);
    this.filters.timeSlotId=timeSlotId;
    this.routes.bMorning=bMorning;
    if(this.filters.demands){
      // In case we are working with demands, a timeslot change may change the list of demands
      this.RouteService.listPOIs(this.filters.institutions,this.filters.timeSlotId,this.filters.demands).subscribe((POIs) => {
        this.POIs.list=POIs;
        this.loadRoutes();
      });
    }
    else{
      this.loadRoutes();
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
    this.changeInRoutes++;
    this.updateMapCount++;
  }

  /**
   * To be called after a route saving
   */
  onRouteSave(){
    this.changeInRoutes++;
  }

  /**
   * Edit a route
   * @param route Route : the edited route
   * @param bRouteCreation boolean : whether this is for a route creation of not
   */
  editRouteModal(route : Route, bRouteCreation:boolean){
    const modalRef = this.modalService.open(RouteModalEdit);
    (modalRef.componentInstance as RouteModalEdit).route = route;
    (modalRef.componentInstance as RouteModalEdit).timeslotId = this.filters.timeSlotId;
    (modalRef.componentInstance as RouteModalEdit).title = bRouteCreation ? "Nouvelle Tournée":"";
    (modalRef.componentInstance as RouteModalEdit).institutions = this.filters.institutions;
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
   * Set this.involvedInstitutions with the list of institutions that have to be diplayed on map, even if they belong
   *   to no route or if they are not selected in the institutions filter
   */
  setInvolvedInstitutions(){
    this.involvedInstitutions = [];
    for(let involvedInstitution of this.routes.getInvolvedInstitutions()){
      for(let institution of this.institutions){
        if(involvedInstitution.id==institution.id){
          this.involvedInstitutions.push(institution);
        }
      }
    }
    for(let filteredInstitution of this.filters.institutions){
      var bFound=false;
      for(let involvedInstitutions of this.involvedInstitutions){
        if(filteredInstitution.id==involvedInstitutions.id){
          bFound=true;
          break;
        }
      }
      if(!bFound){
        this.involvedInstitutions.push(filteredInstitution);
      }
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
    this.routes.institutions=this.filters.institutions;
    // Request to reset the last optim result (if any) in the optim player
    this.optimResultId="";
    // We load routes only when filters are set
    if(this.filters.institutions.length>0 && this.filters.timeSlotId && this.filters.scenarioMain.id){
      this.routes.bLoading=true;
      this.RouteService.list(this.filters).subscribe(routes=> this.onRoutesAvailable(routes,false));
    }
    else{
      // Computes the list of involved institutions before mapping
      this.setInvolvedInstitutions();
    }
    this.updateMapWithRecenteringCount++;
  }

  /**
   * When routes are available, load them into this.routes
   * @param routes
   * @param bOptimized : boolean : whether to flag the routes as optimized or not
   */
  onRoutesAvailable(routes,bOptimized){
    for(let route of routes){
      this.routes.loadRoute(route,bOptimized);
    }
    this.routes.bLoading=false;
    // Computes the list of involved institutions before mapping
    this.setInvolvedInstitutions();
    // In case some route POIs do not match any institutions from this.filters.institutions,
    //   they are added into the list of POIs anyway
    this.POIs.fromRoutes(this.routes);
    this.updateMapWithRecenteringCount++;
  }

  /**
   * Trigger map update without recentering
   */
  updateMap(){
    this.updateMapCount++;
  }

}
