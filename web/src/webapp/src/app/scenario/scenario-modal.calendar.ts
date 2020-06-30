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

import { Component,Input, OnInit } from '@angular/core';

import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

import { faCalendar,faChevronDown } from '@fortawesome/free-solid-svg-icons';

import { Scenario, ScenarioSelectedDay, ScenarioSelectableDay,CopyMode } from './scenario';
import { ScenarioService } from './scenario.service';
import { Route } from '../route/route';
import * as moment from 'moment';

export class SelectableRoute extends Route {
  selected:boolean;
}

@Component({
  templateUrl: './scenario-modal.calendar.html',
})
export class ScenarioModalCalendar implements OnInit{

  // The input scenario
  @Input('inputScenario') inputScenario: Scenario;

  // The input routes
  @Input('routes') routes: Route[];

  // The input day
  @Input('selectedDay') selectedDay:NgbDateStruct;

  // The input direction
  @Input('selectedAMPM') selectedAMPM:string;

  // The input Day label
  selectedDayLabel : string;

  // Whether we work per week or per day
  bWorkPerWeek : boolean;

  // In case a lot of routes are defined, enable to fold the routes list
  bFoldRoutes :boolean;

  // If we work per week, whether the list of selected days will be computed by repetition of not
  bWithRepetition : boolean;

  // In case we use repetition, the period in weeks
  iRepeatPeriodWeek : number;

  // In case we use repetition, the period in days
  iRepeatPeriodDay : number;

  // When working per day, we use the existing days in a week (translated into French)
  weekDays : {id:number,label:string,selected:boolean}[];

  // The way the propagation will be done
  copyModes : CopyMode[];

  // The selected copy mode
  selectedCopyMode : CopyMode;

  // The input day cast as a time stamp (will be expressed at midnight GMT for easier dates comparison)
  calendarDt:number

  // The format for the selected or selectable days will depend on the way we display them

  // The selected days
  selectedDays:ScenarioSelectedDay[];
  
  // The possible days over the scenario (for manual) selection
  days:ScenarioSelectableDay[];

  faCalendar=faCalendar;
  faChevronDown=faChevronDown;

  // The considered period (must be included in the scenario time period)
  startDt : NgbDateStruct;
  endDt : NgbDateStruct;

  // The selected routes
  selectableRoutes:SelectableRoute[];
  selectedRouteIDs:{id:string}[];

  /**
   * Default constructor
   * @param activeModal 
   * @param scenarioService 
   */
  constructor(
      public activeModal: NgbActiveModal,
      public scenarioService:ScenarioService) {
    this.bWithRepetition=true;
    this.bWorkPerWeek=true;
    this.iRepeatPeriodWeek=1;
    this.iRepeatPeriodDay=1;
    this.selectedDays=[]
    this.selectedRouteIDs=[];
    this.bFoldRoutes=false;
    this.days=[]
    this.weekDays = [
      {id:1,label:"Lundi",selected:true},
      {id:2,label:"Mardi",selected:true},
      {id:3,label:"Mercredi",selected:true},
      {id:4,label:"Jeudi",selected:true},
      {id:5,label:"Vendredi",selected:true},
      {id:6,label:"Samedi",selected:true},
      {id:7,label:"Dimanche",selected:true}
    ];
    this.copyModes = [
      {code:"APPEND",label:"Ajouter",selected:true},
      {code:"OVERWRITE",label:"Remplacer",selected:false}
    ]
    this.selectedCopyMode=this.copyModes[0];
    this.selectableRoutes = [];
  }

  /**
   * Fold / unfold the list of routes
   */
  toggleRoutesFolding(){
    this.bFoldRoutes = !this.bFoldRoutes;
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
   * On data reception
   */
  ngOnInit(){
    // Prepare a variable for date display
    this.calendarDt = this.toTimeStamp(this.selectedDay)
    this.startDt = this.inputScenario.startDt;
    this.endDt = this.inputScenario.endDt;
    this.selectedDayLabel = moment().year(this.selectedDay.year).month(this.selectedDay.month-1).date(this.selectedDay.day).locale('fr').format('dddd');
    this.updateSelections();
    for(let route of this.routes){
      var selectableRoute = route as SelectableRoute;
      selectableRoute.selected=false;
      this.selectableRoutes.push(selectableRoute);
    }
  }

  /**
   * Called when user clicks the validate button.
   */
  validate(){
    this.activeModal.close({
      selectedDays:this.selectedDays,
      copyMode:this.selectedCopyMode,
      selectedRouteIDs:this.selectedRouteIDs
    });
  }

  /**
   * Recompute the days selection according to the user choices on formular
   * Also recompute the available days according to the user choices on formular
   */
  updateSelections(){
    if(this.bWorkPerWeek){
      if(!this.bWithRepetition){
        this.updateDaysByWeek()
      }    
      this.updateSelectedDaysByWeek()
    }
    else{
      if(!this.bWithRepetition){
        this.updateDays()
      }    
      this.updateSelectedDays()    
    }
  }

  /**
   * When a day is clicked in the clickable days list
   * @param day : clicked day
   */
  toggleDaySelection(day){
    day.selected=!day.selected;
    if(this.bWorkPerWeek){
      this.updateSelectedDaysByWeek();
    }
    else{
      this.updateSelectedDays();
    }
  }
  
  /**
   * Get the information about a day given a timestamp within this day
   * @param timestamp number : a timestamp in ms
   * @return object representing a day
   */
  toDay(timestamp:number){
    return {
      data :{
        year : moment(timestamp).year(),
        month : moment(timestamp).month()+1,
        day : moment(timestamp).date()
      } as NgbDateStruct,
      weekDay:moment(timestamp).locale('fr').format('dddd'),
      month:moment(timestamp).locale('fr').format('MMMM'),
      timestamp : timestamp,
      selected:false
    }
  }

  /**
   * Shortcut for adding a day to the selection of days
   * This will chech that the day we want to add to the collection is not the current day
   * @param number date timestamp (ms)
   * @param ScenarioSelectableDay day object representing a day
   */
  addSelectedDay(date,day){
    if(date!=this.toTimeStamp(this.selectedDay)){
      if(day==undefined){
        day=this.toDay(date);
      }
      this.selectedDays.push(day);
    }    
  }

  /**
   * Shortcut for adding a day to the set of selectable days
   * This will chech that the day we want to add to the collection is not the current day
   * @param number date timestamp (ms)
   */
  addDay(date){
    if(date!=this.toTimeStamp(this.selectedDay)){
      this.days.push(this.toDay(date));
    }    
  }  

  /**
   * When working per week, update the list of days for manual selection but keep into memory the previous selection if possible
   */
  updateDaysByWeek(){
    var startDt = this.toTimeStamp(this.startDt);
    var endDt = this.toTimeStamp(this.endDt);
    var date = startDt;
    var previousDays=this.days;
    this.days=[];
    while(date<=endDt){
      this.addDay(date);
      date += 7*86400*1000;
    }
    // Preset the selection with the previous selection
    for(let day of this.days){
      for(let previousDay of previousDays){
        if(day.data.year==previousDay.data.year && day.data.month==previousDay.data.month &&
          day.data.day==previousDay.data.day && previousDay.selected){
          day.selected=true;
        }
      }
    }
  }  

  /**
   * Update the list of days for manual selection but keep into memory the previous selection if possible
   */
  updateDays(){
    var startDt = this.toTimeStamp(this.startDt);
    var endDt = this.toTimeStamp(this.endDt);
    var date = startDt;
    var previousDays=this.days;
    this.days=[];
    while(date<=endDt){
      // Before inserting, check that date belongs to the list of selected days
      for(let weekDay of this.weekDays){
        if(weekDay.id == moment(date).isoWeekday() && weekDay.selected){
          this.addDay(date);
          break;
        }
      }
      date += 86400*1000;
    }
    // Preset the selection with the previous selection
    for(let day of this.days){
      for(let previousDay of previousDays){
        if(day.data.year==previousDay.data.year && day.data.month==previousDay.data.month &&
           day.data.day==previousDay.data.day && previousDay.selected){
          day.selected=true;
        }
      }
    }
  }  

  /**
   * When working per week, according to the selected mode (with repetition of without), keep the days selection up-to-date
   */
  updateSelectedDaysByWeek(){
    if(this.calendarDt!=undefined){
      if(this.bWithRepetition){
        // Do not update selection if the formular is not valid
        if(this.iRepeatPeriodWeek>=1){
          this.selectedDays=[];
          var endDt = this.toTimeStamp(this.endDt)
          var startDt = this.toTimeStamp(this.startDt)
          var date = this.calendarDt;
          // Get all the days in the future
          while(date<=endDt){
            if(date>=startDt){
              this.addSelectedDay(date,undefined);
            }
            date += 7*86400*1000*this.iRepeatPeriodWeek;
          }
          // Get all the days in the past but do not insert the initial date twice
          date = this.calendarDt - 7*86400*1000*this.iRepeatPeriodWeek;
          while(date>=startDt){
            if(date<=endDt){
              this.addSelectedDay(date,undefined);
            }
            date -= 7*86400*1000*this.iRepeatPeriodWeek;
          }
        }
      }
      else{
        this.selectedDays=[];          
        for(let day of this.days){
          if(day.selected){
            this.addSelectedDay(date,day);
          }
        }
      }
    }
  }

  /**
   * According to the selected mode (with repetition of without), keep the day selection up-to-date
   */
  updateSelectedDays(){
    if(this.calendarDt!=undefined){
      if(this.bWithRepetition){
        // Do not update selection if the formular is not valid
        if(this.iRepeatPeriodDay>=1){
          this.selectedDays=[];
          var endDt = this.toTimeStamp(this.endDt)
          var startDt = this.toTimeStamp(this.startDt)
          var date = this.calendarDt;
          // Get all the days in the future
          while(date<=endDt){
            if(date>=startDt){
              // Before inserting, check that date belongs to the list of selected days
              for(let weekDay of this.weekDays){
                if(weekDay.id == moment(date).isoWeekday() && weekDay.selected){
                  this.addSelectedDay(date,undefined);
                  break;
                }
              }
            }
            date += 86400*1000*this.iRepeatPeriodDay;
          }
          // Get all the days in the past but do not insert the initial date twice
          date = this.calendarDt - 86400*1000*this.iRepeatPeriodDay;
          while(date>=startDt){
            if(date<=endDt){
              // Before inserting, check that date belongs to the list of selected days
              for(let weekDay of this.weekDays){
                if(weekDay.id == moment(date).isoWeekday() && weekDay.selected){
                  this.addSelectedDay(date,undefined);
                  break;
                }
              }
            }
            date -= 86400*1000*this.iRepeatPeriodDay;
          }
        }
      }
      else{
        this.selectedDays=[];          
        for(let day of this.days){
          if(day.selected){
            this.addSelectedDay(date,day);
          }
        }
      }
    }
  }

  /**
   * Triggerd when user clicks a route in the list
   * @param route SelectableRoute
   */
  selectRoute(route : SelectableRoute){
    route.selected=!route.selected;
    this.selectedRouteIDs=[];
    for(let selectableRoute of this.selectableRoutes){
      if(selectableRoute.selected){
        this.selectedRouteIDs.push({id:selectableRoute.id})
      }
    } 
  }

}