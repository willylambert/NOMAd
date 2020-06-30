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

import { Component,Input,Output,EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// The fa-icons
import { faEuroSign,faLeaf,faTimes,faPen,faWheelchair,faChild,faHospital,faPlay,faMapMarker,faRoad,faWeightHanging,faShuttleVan,faSave,faPause,faRoute,faClock} from '@fortawesome/free-solid-svg-icons';
import { Route } from './route';
import { RouteSet } from './route.set';
import { RoutePOI } from './route.poi';
import { RouteService } from './route.service';
import { Site } from '../site/site';
import { Scenario } from '../scenario/scenario';
import { TransportPOI } from '../poi/poi';
import { POIService } from '../poi/poi.service';
import { RouteModalServiceDuration } from './route-modal.service-duration';
import { CrudNavbarModalConfirmDelete } from '../crud-navbar/crud-navbar-modal.confirm-delete';
import { RouteModalTargetDt } from './route-modal.target-dt';
import { DataCheckerDetailModalList } from '../datachecker/datachecker-detail-modal.list';
import { DataCheckerDetail } from '../datachecker/datachecker-detail';

/**
 * Class for routes list inside the route crud
 */
@Component({
  selector: 'route-list',
  templateUrl: './route.list.html',
  styleUrls: ['./route.scss']
})
export class RouteList {

  // Whether to display optimized routes or non optimized routes
  @Input('bOptimized') bOptimized:boolean

  // the left menu filter
  @Input('filters') filters:{
    timeSlotId:string,
    calendarDt:number,
    scenarioMain:Scenario
  };

  // All the institutions to be diplayed on the map
  @Input('involvedInstitutions') involvedInstitutions:Site[];

  // The set of routes
  @Input('routes') routes:RouteSet;

  // Tell whether this is sandbox mode or not
  @Input('bSandbox') bSandbox:boolean;

  @Output() routeChange = new EventEmitter();
  @Output() routeDisplayToggle = new EventEmitter();
  @Output() routeDelete = new EventEmitter();
  @Output() routeSave = new EventEmitter();
  @Output() routeEdit = new EventEmitter();
  @Output() routePOIsChange = new EventEmitter();

  // The fa icons
  faTimes=faTimes;
  faPen=faPen;
  faWheelchair = faWheelchair;
  faChild = faChild;
  faHospital= faHospital;
  faPlay= faPlay;
  faPause= faPause;
  faMapMarker = faMapMarker;
  faRoad = faRoad;
  faShuttleVan = faShuttleVan;
  faSave = faSave;
  faRoute = faRoute;
  faClock = faClock;
  faEuroSign = faEuroSign;
  faLeaf = faLeaf;
  faWeightHanging = faWeightHanging;

  constructor(
    private POIService : POIService,
    private modalService: NgbModal,
    private RouteService: RouteService
  ) {
  }

  /**
   * Tell whether the route should be displayed according to bOptimized attribute
   * @param route Route : a route to be displayed (or not)
   * @returns boolean : whether the route should be displayed or not
   */
  shouldBeDisplayed(route : Route){
    if(this.bSandbox){
      if(this.bOptimized){
        return route.optim_main_id!=undefined;
      }
      else{
        return route.optim_main_id==undefined;
      }
    }
    else{
      // Out of sandbox mode, display all routes.
      return true;
    }
  }

  /**
   * Get the color for a POI
   * @param POI : TransportPOI
   * @return string : a CSS color
   */
  getColor(POI : TransportPOI){
    var tempPOI = new TransportPOI();
    tempPOI.copyFromPOI(POI);
    return tempPOI.getColor(this.involvedInstitutions)
  }

  /**
   * Change the active route and update the map
   * @param route Route
   */
  changeRoute(route : Route){
    if(route.routeId!=this.routes.currentRouteId){
      this.routes.currentRouteId = route.routeId;
    }else{
      // Unselect current route
      this.routes.currentRouteId = null;
    }
    this.routeChange.emit();
  }

  /**
   * Prevent from route folding when clicking on a button with a route panel
   * @param event Event : a click event for which we want to ignore default behavior
   */
  preventRouteFolding(event){
    if(event){
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * Toggle Route display on the map
   * @param event : Event : a click event
   * @param route : Route : the concerned route
   * @param newValue : boolean : the new value for the display attribute
   */
  toggleRouteDisplay(event : Event,route:Route,newValue:boolean){
    this.preventRouteFolding(event);
    route.toggleDisplay(newValue);
    this.routeDisplayToggle.emit();
  }

  /**
   * Delete a route
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   * @param route Route : the deleted route
   */
  deleteRoute(event : Event,route: Route){
    this.preventRouteFolding(event);
    const modalRef = this.modalService.open(CrudNavbarModalConfirmDelete);
    var chkDelete = false;
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).aclObject = "route";
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).onCkeck.subscribe((value)=>{
      chkDelete = value;
    });
    modalRef.result.then((result) => {
      if(result=='Y'){
        if(chkDelete){
          this.RouteService.delete(route).subscribe(response => {
            if(response){
              this.routes.deleteRoute(route);
              this.routeDelete.emit()
            }
          })
        }else{
          this.RouteService.markAsRemoved(route).subscribe(response => {
            if(response){
              this.routes.deleteRoute(route);
              this.routeDelete.emit()
            }
          })
        }
      }
    });
  }

  /**
   * Save a route
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   * @param route Route : the saved route
   */
  saveRoute(event : Event,route: Route){
    this.preventRouteFolding(event);
    this.RouteService.save({
        route:route,
        timeSlotId:this.filters.timeSlotId,
        scenarioMain:this.filters.scenarioMain,
        calendarDt:this.filters.calendarDt
      }).subscribe(response => {
        if(response.result){
          if(response.data!=null && response.data!=undefined && response.data.id!=undefined){
            this.routeSave.emit()
            route.id=response.data.id;
          }
          route.bChanged=false;
        }
      })

  }

  /**
   * Edit a route
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   * @param route Route : the deleted route
   */
  editRoute(event : Event,route: Route){
    this.preventRouteFolding(event);
    this.routeEdit.emit({value:route})
  }


  // --------------- INTERACTION WITH POIS ---------------------------------------

  /**
   * Update into database the service duration associated to a POI
   * @param POI RoutePOI : the concerned POI
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   */
  updateServiceDuration(POI :RoutePOI,event:Event){
    this.preventRouteFolding(event);
    const modalRef = this.modalService.open(RouteModalServiceDuration);
    (modalRef.componentInstance as RouteModalServiceDuration).POI = POI;
    // Conversion from milliseconds to minutes
    (modalRef.componentInstance as RouteModalServiceDuration).serviceDuration = Math.round(POI.service_duration/60000);
    (modalRef.componentInstance as RouteModalServiceDuration).waitingDuration = Math.round(POI.waiting_duration/60000);
    (modalRef.componentInstance as RouteModalServiceDuration).pickupDuration = Math.round(POI.pickupDuration/60000);
    (modalRef.componentInstance as RouteModalServiceDuration).deliveryDuration = Math.round(POI.deliveryDuration/60000);
    modalRef.result.then((result) => {
      if(result!=null){
        this.POIService.updateServiceDuration(POI).subscribe(response=>{
          if(response.result==1){
            this.routes.updateServiceDuration(POI);
          }
        })
      }
    });
  }

  /**
   * Function to be called when a element in the route is being dropped
   * @param event : the drop event
   * @param route : the concerned route
   */
  onDropEvent(event: CdkDragDrop<string[]>,route:Route) {
    moveItemInArray(route.POIs, event.previousIndex, event.currentIndex);
    route.clearDirections();
    route.bChanged=true;
    this.routePOIsChange.emit();
  }

  /**
   * Remove an institution POI from a route. We can not use removePOI function since an institution POI
   *   can be present several times in a route.
   * @param route Route : the route the POI belongs to
   * @param index number: the index of the POI in the route
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   */
  public onInstitutionPOIRemove(route : Route,index : number, event : Event){
    this.preventRouteFolding(event);
    route.deletePOIFromIndex(index);
    this.routePOIsChange.emit();
  }

  /**
   * Remove a POI from a route
   * @param route Route : the route the POI belongs to
   * @param POI RoutePOI: the POI to be removed from the route
   * @param event Event : the click event that triggered the function (to prevent accordion fold/unfold)
   */
  private onHomePOIRemove(route : Route ,POI : RoutePOI, event :Event){
    this.preventRouteFolding(event);
    route.deletePOI(POI);
    this.routePOIsChange.emit();
  }

  /**
   * Open the modal for setting the target_hr manually
   */
  setTargetDt(POI : RoutePOI,route:Route){
    this.preventRouteFolding(event);
    const modalRef = this.modalService.open(RouteModalTargetDt);
    (modalRef.componentInstance as RouteModalTargetDt).POI = POI;
    (modalRef.componentInstance as RouteModalTargetDt).route = route;
    modalRef.result.then((result) => {
      if(result!=null && result!=undefined){
        POI.target_hr_manual = result;
        POI.target_hr = POI.target_hr_manual;
        route.bChanged=true;
      }
    },(error) => {
      console.log(error)
    });
  }

  /**
   * Display a modal for the presentation of error details restricted to one POI
   * @param event Event: the received click event
   * @param POIId string : the POIId to limit the errors
   * @param errors DataCheckerDetail[]: the list of errors
   * @param dataCheckerScopeId string : the scope id, to filter the errors
   * @param dataCheckerLevelId string : the level id, to filter the errors
   */
  datacheckerDetailsOnPOI(event : Event,POIId:string,errors : DataCheckerDetail[],dataCheckerScopeId:string,dataCheckerLevelId:string){
    var filteredErrors:DataCheckerDetail[] = [];
    for(let error of errors){
      if(error.site_poi_id == POIId){
        filteredErrors.push(error);
      }
    }
    this.datacheckerDetails(event,filteredErrors,dataCheckerScopeId,dataCheckerLevelId);
  }

  /**
   * Display a modal for the presentation of error details
   * @param event Event: the received click event
   * @param errors DataCheckerDetail[]: the list of errors
   * @param dataCheckerScopeId string : the scope id, to filter the errors
   * @param dataCheckerLevelId string : the level id, to filter the errors
   */
  datacheckerDetails(event : Event,errors : DataCheckerDetail[],dataCheckerScopeId:string,dataCheckerLevelId:string){
    this.preventRouteFolding(event);
    const modalRef = this.modalService.open(DataCheckerDetailModalList,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerDetails= errors;
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerScopeId= dataCheckerScopeId;
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerLevelId= dataCheckerLevelId;
  
    modalRef.result.then((result) => {
    }).catch((error) => {
      console.log(error);
    });
  }

}
