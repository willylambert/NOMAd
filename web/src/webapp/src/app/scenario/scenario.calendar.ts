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

import { Component, Input, OnInit, OnDestroy, Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import * as moment from 'moment';

import { Scenario, ScenarioFilter, ScenarioCopy } from './scenario';

import { ScenarioService } from './scenario.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { ThesaurusItem } from '../thesaurus/thesaurus';
import { NgbModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { faChevronLeft,faWheelchair,faClock,faShuttleVan, faSpinner,faRoad,faLeaf,faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { Route } from '../route/route';
import { CalendarService } from '../calendar/calendar.service';
import { ScenarioModalCalendar } from './scenario-modal.calendar';
import { ContextService } from '../helpers/context.service';
import { HRDriverSelectModal } from '../hr-driver/hr-driver.select-modal';
import { RouteService } from '../route/route.service';
import { DataCheckerService } from '../datachecker/datachecker.service';
import { DataCheckerDetailService } from '../datachecker/datachecker-detail.service';
import { DataCheckerDetail } from '../datachecker/datachecker-detail';
import { DataCheckerDetailModalList } from '../datachecker/datachecker-detail-modal.list';
import { Calendar } from '../calendar/calendar';
import { concat } from 'rxjs';
import { concatAll } from 'rxjs/operators';

/**
 * A school year, begining on week 36 (beginning of september) of year1 and ending on year 35 of year2
 */
export class ScenarioCalendarYear {
  // The id of the year (not connected to database, so this may be just an index starting on 0 with an increment by 1)
  id: string;
  // The school year label, typically the first year + a delimiter + the second year
  label:string;
  // The first civil year in the school year, on 4 digits (weeks 36 to last)
  year1:number;
  // The second civil year in the school year, on 4 digits (weeks 1 to 35)
  year2:number;
}

export class RoutesStats{
  duration: number = 0;
  distance: number = 0 ;
  co2:number = 0;
  cost:number = 0;
}

/**
 * A week in the year + some context information about this week, that will enable to display some flags (for instance some pictos)
 *   to tell about the week status. The week is identified by an id or alternatively by a year number on 4 digits + an ISO week number.
 */
export class ScenarioCalendarWeek {
  // Week identifier (typically the position of the week in a list of weeks, starting from 0 with an increment by 1)
  id: string;
  // Year to which the week is attached
  year:number;
  // ISO week number in the year (for weeks across two different years, rely on ISO to relove ambiguities)
  number:number;
  // Whether there are some errors or not
  bErrors : boolean;
  
  constructor(id:string,year:number,number:number,bErrors:boolean){
    this.id = id;
    this.year = year;
    this.number = number;
    this.bErrors = bErrors;
  }
}

/**
 * A timeslot in a week (14 possible timeslots)
 * In addition to the ThesaurusItem parent class, we have some context information telling about the timeslot status
 *   which can be used to display some pictograms on the interface
 */
export class ScenarioCalendarTimeslot extends ThesaurusItem {
  // Shortcut to tell whether the timeslot is in the morning (travels forward) or in the afternoon (travels backwards)
  bMorning:boolean;
  // Shortcut to tell whether the timeslot is in the scenario time range or not
  // To tell whether the timeslot is in the scenario time range or not, we need some other information : year + week
  bOutOfScenarioTimeRange:boolean;
  // Whether there are some errors or not
  bErrors : boolean;
}

@Component({
  selector: 'scenario-calendar',
  templateUrl: './scenario.calendar.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioCalendar implements OnInit, OnDestroy   {

  @Input('inputScenario') inputScenario: Scenario;

  @Output() changeInPOIs = new EventEmitter<Calendar[]>();

  // The list of years concerning the scenario (will be computed from the scenario time extent, based on scholar calendar)
  years : ScenarioCalendarYear[];
  selectedYear: ScenarioCalendarYear;

  // The list of weeks within the selected year (will be recomputed after every change in this.selectedYear)
  weeks : ScenarioCalendarWeek[];
  selectedWeek : ScenarioCalendarWeek;

  // The available timeslots over a week, from monday to sunday, travel from and to institutions
  timeSlotsAsThesaurusItems: ThesaurusItem[];

  // The list of timeslots within the selected year + week (will be recomputed after every change in this.selectedWeek)
  timeSlots: ScenarioCalendarTimeslot[];
  selectedTimeSlot: ScenarioCalendarTimeslot;

  // The calendar dt corresponding to the selected day (selectedYear + selectedWeek + selectedTimeSlot) expressed at midnight,
  //   server time, in ms. It will be kept up to date after every change in this.selectedTimeSlot
  calendarDt:number;
  // A label corresponding to the selected day (selectedYear + selectedWeek + selectedTimeSlot) and that will be displayed on the 
  //   interface. It will be kept up to date after every change in this.selectedTimeSlot  
  selectedDayLabel:string;

  // The number of existing transport_calendar items for a given scenario + year + week + timeslot
  calendarsCount:number;

  // The list of existing routes for a given scenario + year + week + timeslot
  // TODO : store some error status + details in the route structure
  routes:{loaded:boolean,list:Route[]};

  routesStats: RoutesStats;

  // The list of existing demands for a given scenario + year + week + timeslot
  calendars:{loaded:boolean,list:Calendar[]};

  // The scenario bounds converted into ms for easier dates comparison
  startDtMs : number;
  endDtMs : number;

  // Indicates whether the update of the transport calendars is on going or not
  bUpdatingTransportCalendars:boolean;
  // Indicates wheter the update of the transport calendars is complete or not
  bUpdateTransportCalendarsSucceeded:boolean;
  // Indicates wheter the update of the transport calendars failed or not
  bUpdateTransportCalendarsFailed:boolean;  

  copyProgressionPercent: number;
  bCopyInProgress : boolean = false;

  // Indicates whether some checks are running or not
  bDatacheckerRunning:boolean;

  faChevronLeft = faChevronLeft;
  faWheelchair = faWheelchair;
  faClock = faClock;
  faShuttleVan = faShuttleVan;
  faSpinner = faSpinner;
  faRoad = faRoad;
  faLeaf = faLeaf;
  faEuroSign = faEuroSign;

  errors:DataCheckerDetail[];
  
  constructor(
    protected router: Router,
    protected scenarioService:ScenarioService,
    protected thService: ThesaurusService,
    protected modalService: NgbModal,
    protected calendarService: CalendarService,
    public contextService:ContextService,
    protected routeService: RouteService,
    protected dataCheckerDetailService: DataCheckerDetailService,
    public datacheckerService:DataCheckerService,) {
      this.resetYears();
      this.bUpdatingTransportCalendars = false;
      this.bUpdateTransportCalendarsSucceeded = false;
      this.bUpdateTransportCalendarsFailed = false;
      this.bDatacheckerRunning = false
      this.errors=[];
      this.routesStats = new RoutesStats();
  }

  /**
   * Called after DOM completion. It will request data from server
   */
  ngOnInit() {
    
    this.computeDatesMs();
    this.computeYears();

    this.thService.list({cat:'TIMESLOT'}).subscribe(thesaursItems=>{
      this.timeSlotsAsThesaurusItems = thesaursItems; 
      
      // Load context if any
      this.loadContext();

      // Default value : first years, first week
      if(this.selectedWeek==null && this.years.length>0){
        this.onYearChange(this.years[0]);
        if(this.weeks.length>0){
          this.onWeekChange(this.weeks[0]);
        }
      }

      // Trigger the update of the calendars for the whole scenario
      if(this.inputScenario.need_calendar_update_yn=='Y'){
        this.runCalendarUpdate(this.inputScenario.id,null,null);
      }
    });    
  }

  fillWeekErrors(){
    for(let week of this.weeks){
      week.bErrors=false;
      for(let error of this.errors){
        // Compute the week start timestamp and week end timestamp
        var year = (week.number<36) ? this.selectedYear.year2 : this.selectedYear.year1;
        var start = moment().year(year).isoWeek(week.number).locale('fr').weekday(0).hours(0).minutes(0).seconds(0).unix()*1000;
        if(error.transport_calendar_dt>=start && error.transport_calendar_dt<start+7*24*3600*1000){
          week.bErrors=true;
        }
      }
    }
  }
  fillTimeSlotErrors(){
    for(let timeSlot of this.timeSlots){
      timeSlot.bErrors=false;
      for(let error of this.errors){
        var start = this.timeSlotCodeToMoment(timeSlot.code).set({'hours':0,'minutes':0,'seconds':0 }).unix()*1000;
        if(error.transport_calendar_dt>=start && error.transport_calendar_dt<start+24*3600*1000 && error.transport_calendar_timeslot_th==timeSlot.id){
          timeSlot.bErrors=true;
        }
      }
    }    
  }  
  fillErrors(){
    this.fillWeekErrors();
    this.fillTimeSlotErrors();
  }

  /**
   * To be called on page init
   */
  resetYears(){
    this.years=[];
    this.resetWeeks();
  }

  /**
   * To be called on selected year change
   */
  resetWeeks(){
    this.weeks=[];
    this.selectedWeek = null; 
    this.resetTimeslots();
  }

  /**
   * To be called on selected week change
   */
  resetTimeslots(){
    this.timeSlots = [];    
    this.selectedTimeSlot = null;
    this.resetSelectedDay();
  }

  /**
   * To be called on selected timeslot change
   */
  resetSelectedDay(){
    this.routes={loaded:false,list:[]};
    this.calendars={loaded:false,list:[]};
    this.selectedDayLabel = null;
    this.calendarDt = null;
    this.calendarsCount = null;
  }

  /**
   * compute the errorsto be displayed on the page
   */
  computeErrors(){
    this.dataCheckerDetailService.list({
      'datachecker_main_id':'',
      'scenario_main_id':this.inputScenario.id,
      'transport_demand_id':'',
      'transport_calendar_id':'',
      'transport_route_id':'',
      'vehicle_category_id':'',
      'site_poi_id':'',
      'hr_main_id':''
    }).subscribe(scenarioErrors => {
      this.errors = scenarioErrors;
      this.fillErrors();
    })    
  }

  /**
   * Load the saved context : selected year, week and timeslot
   * The context can be applied only under the conditions listed below :
   *  - context can not override values that were already set by user
   *  - context can apply only when valid (due to scenario data change, context can become invalid)
   *  - context applies in a cascaded way (year > week > timeslot) which means that timeslot context can be
   *      applied only if week context was applied and week context can be applied only if year context was applied.
   */
  loadContext(){
    var context = this.contextService.getLocalContext(this.constructor.name);
    if(context!=null && context!=undefined){
      if(
        // The context is defined
        context.selectedYear!=undefined && context.selectedYear!=null &&
        // User did not start to fill some data
        this.selectedYear==undefined &&
        // The necessary variables to call onYearChange() are defined
        this.startDtMs && this.endDtMs && this.years.length>0 &&
        // The selectedYear context is still valid with respect to the content of this.years variable
        this.years[context.selectedYear.id]!=undefined && 
        this.years[context.selectedYear.id].label == context.selectedYear.label && 
        this.years[context.selectedYear.id].year1 == context.selectedYear.year1 &&
        this.years[context.selectedYear.id].year2 == context.selectedYear.year2
      ){
        this.selectedYear=context.selectedYear;
        this.onYearChange(this.selectedYear);
        if(
          // The context is defined
          context.selectedWeek!=undefined && context.selectedWeek!=null &&
          // User did not start to fill some data
          this.selectedWeek==null &&
          // The necessary variables to call onWeekChange() are defined
          this.timeSlotsAsThesaurusItems && this.timeSlotsAsThesaurusItems.length>0 &&
          // The selectedWeek context is still valid with respect to the content of this.weeks variable
          this.weeks[context.selectedWeek.id]!=undefined &&
          this.weeks[context.selectedWeek.id].number == context.selectedWeek.number &&
          this.weeks[context.selectedWeek.id].year == context.selectedWeek.year
        ){
          this.onWeekChange(context.selectedWeek);
          if(
            // The context is defined
            context.selectedTimeSlot!=undefined && context.selectedTimeSlot!=null &&
            // User did not start to fill some data
            this.selectedTimeSlot==undefined &&
            // The selectedTimeSlot context is still valid with respect to the scenario time range
            context.selectedTimeSlot.code && this.checkTimeSlotCode(context.selectedTimeSlot.code)
          ){
            this.onTimeslotChange(context.selectedTimeSlot);
          }
        }         
      }
    }    
  }

  /**
   * According to the scenario time range, compute the set of school years over the scenario.
   * A school week start on week number 36 and ends on week number 35 of the next calendar year
   */
  computeYears(){
    var firstYear = moment(this.startDtMs).year();
    var firstWeek = moment(this.startDtMs).isoWeek();
    var lastYear = moment(this.endDtMs).year();
    var lastWeek = moment(this.endDtMs).isoWeek();
    // Case where the first week of the scenario is located in the second half of a school year
    if(firstWeek<36){
      firstYear--;
    }
    // Case where the last week of the scenario is located in the first half of a school year
    if(lastWeek<36){
      lastYear--;
    }
    for(var i=firstYear;i<lastYear+1;i++){
      this.years.push({
        id:(i-firstYear).toString(),
        label:i+'/'+(i+1),
        year1:i,
        year2:i+1
      });
    }    
  }

  /**
   * Keep this.endDtMs and this.startDtMs up to date with the input scenario start and end dates
   */
  computeDatesMs(){
    if(this.inputScenario.endDt && this.inputScenario.endDt.year && this.inputScenario.endDt.month && this.inputScenario.endDt.day){
      this.endDtMs=moment().set({
        'year':this.inputScenario.endDt.year,
        'month':this.inputScenario.endDt.month-1,
        'date':this.inputScenario.endDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
    if(this.inputScenario.startDt && this.inputScenario.startDt.year && this.inputScenario.startDt.month && this.inputScenario.startDt.day){
      this.startDtMs=moment().set({
        'year':this.inputScenario.startDt.year,
        'month':this.inputScenario.startDt.month-1,
        'date':this.inputScenario.startDt.day,
        'hours':0,
        'minutes':0,
        'seconds':0
      }).unix()*1000;
    }
  }
 
  /**
   * Triggered when user clicks on the link to go back to the list.
   */
  backToList() {
    this.router.navigate([this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list")]);
  }

  /**
   * Called when user picks a new year in the list of years.
   * @param year 
   */
  onYearChange(year:ScenarioCalendarYear){
    this.selectedYear = year;
    // Reset underlying variables
    this.resetWeeks();
    if(this.startDtMs<=this.endDtMs && this.years.length>0 && year!=undefined){
      // The first week number is always 36 except for the first year in the list
      var first = (parseInt(year.id)==0) ? moment(this.startDtMs).isoWeek() : 36;
      // The last week number is always 35 except for the last year in the list
      var last = (parseInt(year.id)==this.years.length-1) ? moment(this.endDtMs).isoWeek() : 35;
      if(last<first){
        // The selected school year spans over 2 different civil years
        var numberOfWeeksInYear = moment().year(year.year1).isoWeeksInYear();
        // Populate weeks array with the weeks in the first civil year composing the school year
        for(var j=first;j<numberOfWeeksInYear+1;j++){
          this.weeks.push(new ScenarioCalendarWeek(this.weeks.length.toString(),year.year1,j, false));
        }            
        // Populate weeks array with the weeks in the second civil year composing the school year
        for(var j=1;j<last+1;j++){
          this.weeks.push(new ScenarioCalendarWeek(this.weeks.length.toString(), year.year2,j, false ));
        }             
      }
      else{
        // The selected school year spans over only 1 civil year
        var concernedYear = (first<36)?year.year2:year.year1;
        for(var j=first;j<last+1;j++){
          this.weeks.push(new ScenarioCalendarWeek(this.weeks.length.toString(), concernedYear,j, false));
        } 
      }
    }
    this.fillWeekErrors();
  }

  /**
   * Called when user picks a new week in the list of weeks.
   * @param week 
   */
  onWeekChange(week:ScenarioCalendarWeek){
    this.selectedWeek = week;
    // Reset underlying variables
    this.resetTimeslots();
    for(let timeslot of this.timeSlotsAsThesaurusItems){
      var bMorning = timeslot.code.substr(timeslot.code.length-2,2)=="AM";
      this.timeSlots.push({
        id:timeslot.id,
        code:timeslot.code,
        label:timeslot.label,
        bMorning:bMorning,
        bErrors:false,
        bOutOfScenarioTimeRange:!this.checkTimeSlotCode(timeslot.code)
      } as ScenarioCalendarTimeslot)
    }
    this.fillTimeSlotErrors();    
  }

  /**
   * Check whether a timeslot code is valid with respect to the scenario time range,
   *   assuming that this.selectedWeek and  this.selectedYear are already set.
   * @param sTimeSlotCode string : a timeslot code
   * @return boolean : true if the timeslot code is valid with respect to the scenario tome range
   */
  checkTimeSlotCode(sTimeSlotCode:string){
    var dateMs = this.timeSlotCodeToMoment(sTimeSlotCode).set({'hours':0,'minutes':0,'seconds':0 }).unix()*1000;
    return (dateMs>=this.startDtMs && dateMs<=this.endDtMs);
  }

  /**
   * Convert a time slot code to a momentjs date, assuming that this.selectedWeek and  this.selectedYear are already set.
   * @param sTimeSlotCode string : a timeslot code
   * @return object : a momentjs date
   */
  timeSlotCodeToMoment(sTimeSlotCode:string){
    var year = (this.selectedWeek.number<36) ? this.selectedYear.year2 : this.selectedYear.year1;
    var dayOfWeekAsString = sTimeSlotCode.substr(0,sTimeSlotCode.length-3);
    var days={"MONDAY":0,"TUESDAY":1,"WEDNESDAY":2,"THURSDAY":3,"FRIDAY":4,"SATURDAY":5,"SUNDAY":6};
    return moment().year(year).isoWeek(this.selectedWeek.number).locale('fr').weekday(days[dayOfWeekAsString])
  }

  /**
   * Convert the selected this.selectedTimeSlot + this.selectedWeek + this.selectedYear to a date expressed as a NgbDateStruct
   * @return date as NgbDateStruct
   */
  getSelectedDayAsNgbDateStruct() : NgbDateStruct{
    var selectedDay = this.timeSlotCodeToMoment(this.selectedTimeSlot.code);
    return {year:selectedDay.year(),month :selectedDay.month()+1,day:selectedDay.date()}
  }

  /**
   * Convert the selected this.selectedTimeSlot as a string "AM" (for travel forward) and "PM" (for travels backwards)
   * @return string
   */
  getSelectedTimeSlotAMPM(): string{
    return this.selectedTimeSlot.bMorning?"AM":"PM";
  }
  
  /**
   * Called when user picks a new timeslot in the list of timeslots.
   * @param timeSlot :ScenarioCalendarTimeslot
   */
  onTimeslotChange(timeSlot:ScenarioCalendarTimeslot){
    this.selectedTimeSlot = timeSlot;
    this.resetSelectedDay();
    var year = (this.selectedWeek.number<36) ? this.selectedYear.year2 : this.selectedYear.year1;
    var dayOfWeekAsString = this.selectedTimeSlot.code.substr(0,this.selectedTimeSlot.code.length-3);
    var days={"MONDAY":0,"TUESDAY":1,"WEDNESDAY":2,"THURSDAY":3,"FRIDAY":4,"SATURDAY":5,"SUNDAY":6};
    var selectedDay = moment().year(year).isoWeek(this.selectedWeek.number).locale('fr').weekday(days[dayOfWeekAsString])
    this.selectedDayLabel=selectedDay.locale('fr').format('DD MMMM YYYY')
    this.selectedDayLabel+=this.selectedTimeSlot.bMorning?" Aller":" Retour";  
    this.calendarService.getCalendarDt(this.getSelectedDayAsNgbDateStruct()).subscribe(calendarDt=>{
      this.calendarDt=calendarDt;
      //this.listTransportCalendars();
      this.listRoutes();
    })
  }

  /**
   * Refresh the count of transport calendar items corresponding to the selected day + timeslot + scenario
   * We enable such operation only if the update of transport calendars (triggered at page initialization) is complete
   */
  /*
  listTransportCalendars(){
    this.calendars={loaded:false,list:[]};
    if(this.selectedTimeSlot && this.selectedTimeSlot.id && this.calendarDt && this.inputScenario){
      this.calendarsCount=undefined
      this.calendarService.list({
        scenarioMain:this.inputScenario,
        calendarDt:this.calendarDt,
        timeSlotId:this.selectedTimeSlot.id,
      }).subscribe(calendars => {
        this.calendars={loaded:true,list:calendars};
        this.calendarsCount = calendars.length;
      })
    }    
  }*/

  /**
   * Refresh the list of routes corresponding to the selected day + timeslot + scenario
   */
  listRoutes(){
    if(this.selectedTimeSlot.id && this.calendarDt && this.inputScenario){
      this.routes={loaded:false,list:[]};
      this.scenarioService.listRoutes({
        scenarioMain:this.inputScenario,
        calendarDt:this.calendarDt,
        timeSlotId:this.selectedTimeSlot.id,
      } as ScenarioFilter).subscribe(routes=>{
        this.routes={loaded:true,list:routes};   
        
        this.routesStats = new RoutesStats();
        for(let route of this.routes.list){
          route.simplifiedErrors = this.routeService.synthesizeErrors(['VEHICLE_CAT','HR','TIME'],route);
          this.routesStats.duration += route.duration;
          this.routesStats.distance += route.distance;
          this.routesStats.co2 += route.co2;
          this.routesStats.cost += route.cost; 
        }

        this.calendars={loaded:false,list:[]};
        if(this.selectedTimeSlot && this.selectedTimeSlot.id && this.calendarDt && this.inputScenario){
          this.calendarsCount=undefined
          this.calendarService.list({
            scenarioMain:this.inputScenario,
            calendarDt:this.calendarDt,
            timeSlotId:this.selectedTimeSlot.id,
          }).subscribe(calendars => {
            this.calendars={loaded:true,list:calendars};
            this.calendarsCount = calendars.length;

            this.changeInPOIs.emit(this.calendars.list);

            // for each demands, look in routes how many times they are served            
            for(let calendar of this.calendars.list){
              calendar.serviceCount = 0;
              calendar.routes = [];
              for(let route of this.routes.list){
                for(let poi of route.POIs){
                  if(poi.id==calendar.HRPOI.id){
                    calendar.serviceCount++;
                    calendar.routes.push(route);
                  }
                }
              }
            }
          });
        } 
      })   
    }
  }

  /**
   * Used in tooltip to find out in which routes a demands is served
   */
  getRoutesDescription(routes:Route[]){
    var desc = "";
    for(let route of routes){
      desc += route.label + " \n ";
    }
    return desc;
  }

  /**
   * Go to the routes crud page
   */
  viewRoutes(){
    if(this.calendarDt != undefined){
      var path = this.router.url.replace(
        /logistics\/scenario\/crud(\/[0-9a-zA-Z-]*)?$/i,
        "logistics/route/crud/"+this.inputScenario.id+"/"+this.calendarDt+'/'+this.selectedTimeSlot.id
      );
      this.router.navigate([path]);
    }
  }

  /**
   * Launch the modal window for routes propagation across the whole scenario
   */
  updateCalendar(){
    const modalRef = this.modalService.open(ScenarioModalCalendar,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as ScenarioModalCalendar).inputScenario = this.inputScenario;
    (modalRef.componentInstance as ScenarioModalCalendar).routes = this.routes.list;
    (modalRef.componentInstance as ScenarioModalCalendar).selectedDay = this.getSelectedDayAsNgbDateStruct();
    (modalRef.componentInstance as ScenarioModalCalendar).selectedAMPM = this.getSelectedTimeSlotAMPM();
    
    modalRef.result.then((calendars) => {
      if(calendars!=null){
        // Copy the routes to the selected list of weeks or days, and display the list of 
        //   weeks for which we have some routes available
        this.bCopyInProgress = true;
        this.copyProgressionPercent = 0;

        // Split copy by batch of 10 days
        var splitedSelectedDays = [];

        for(var i=0;i<calendars.selectedDays.length;i+=10){
          var days = [];
          for(var j=0;j<10;j++){
            if(i+j < calendars.selectedDays.length){
              days.push(calendars.selectedDays[i+j]);
            }
          }
          splitedSelectedDays.push(days);
        }

        var obs = [];
        for(let splitedSelectedDay of splitedSelectedDays){
          obs.push(
            this.scenarioService.copy({
              timeSlotId:this.selectedTimeSlot.id,
              calendarDt:this.calendarDt,
              scenarioMain:this.inputScenario,
              copyMode:calendars.copyMode,
              selectedDays:splitedSelectedDay,
              selectedRouteIDs:calendars.selectedRouteIDs
            } as ScenarioCopy)
          );
        }

        var nbDone = 0;
        concat(obs).pipe(concatAll()).subscribe((result)=>{
          nbDone++;
          this.copyProgressionPercent = (nbDone / splitedSelectedDays.length)*100;
          if(nbDone==splitedSelectedDays.length){
            this.bCopyInProgress = false;
          }
        });
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Open the modal for changing the driver
   * @param route 
   */
  changeDriver(route : Route){
    const modalRef = this.modalService.open(HRDriverSelectModal);
    modalRef.result.then((driver) => {
      if(driver!=null){
        route.driver=driver;
        this.routeService.save({
          route:route,
          timeSlotId:this.selectedTimeSlot.id,
          scenarioMain:this.inputScenario,
          calendarDt:this.calendarDt
        }).subscribe(result=>console.log("route saved",result))
      }
    });
  }

  /**
   * Display a modal for the presentation of error details
   * @param errors DataCheckerDetail[]: the list of errors
   * @param dataCheckerScopeId string : the scope id, to filter the errors
   * @param dataCheckerLevelId string : the level id, to filter the errors
   */
  datacheckerDetails(errors,dataCheckerScopeId,dataCheckerLevelId){
    const modalRef = this.modalService.open(DataCheckerDetailModalList,{windowClass: 'modal-xxl'});
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerDetails= errors;
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerScopeId= dataCheckerScopeId;
    (modalRef.componentInstance as DataCheckerDetailModalList).dataCheckerLevelId= dataCheckerLevelId;
  
    modalRef.result.then((result) => {
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Called when user clicks the button for refreshing the checks
   */
  runChecker(){
    this.bDatacheckerRunning=true;
    this.datacheckerService.run({context:{scenario_main_id:this.inputScenario.id}}).subscribe(result => {
      this.bDatacheckerRunning=false;
      // reinitialize the errors of the page
      this.computeErrors();
      this.listRoutes();
    },error=>{
      this.bDatacheckerRunning=false;
    });
  }
  /**
   * Update Scenario Calendar On Demand
   * @param scenarioId : string optional
   * @param calendarDt : number optional
   * @param timeSlotId : number optional
   */
  runCalendarUpdate(scenarioId,calendarDt,timeSlotId){
    this.bUpdatingTransportCalendars = true;
    this.calendarService.update({
      scenarioMainId: scenarioId,
      calendarDt: calendarDt,
      timeSlotId: timeSlotId
    }).subscribe(response => {
      this.bUpdatingTransportCalendars=false;     
      this.bUpdateTransportCalendarsSucceeded=true;
      this.bUpdateTransportCalendarsFailed=false;
      this.computeErrors();
      this.listRoutes();
    },error=>{
      this.bUpdatingTransportCalendars=false;     
      this.bUpdateTransportCalendarsSucceeded=false;
      this.bUpdateTransportCalendarsFailed=true;        
      console.log("Transport calendars update failed")
    });
  }

  /**
   * Allow to enable/disable a transport calendar for routing
   */
  updateTransportCalendarStatus(calendar,$event){
    let newStatus = ($event.target.checked?'TO_BE_SERVED':'DO_NOT_SERVE');
    this.calendarService.setStatus({id:calendar.id,status_code:newStatus}).subscribe(result=>{
      if(result){
        calendar.transport_calendar_status_code = newStatus;
      }
    });
  }

  // Return string with format [7 Fev. au 12 Fev]
  getWeekLabel(week:ScenarioCalendarWeek){
    let start = moment().year(week.year).isoWeek(week.number).startOf("week").add(1,"d");
    let end = moment(start).add(7,"d");

    return "du " + moment(start).locale('fr').format("D MMM") + " au " + moment(end).locale('fr').format("D MMM");
  }  

  /**
   * Called on page leaving, enables to keep the filters into memory
   */
  ngOnDestroy() {
    this.contextService.setLocalContext(this.constructor.name,{
      selectedYear:this.selectedYear,
      selectedWeek:this.selectedWeek,
      selectedTimeSlot:this.selectedTimeSlot
    });
  }

}