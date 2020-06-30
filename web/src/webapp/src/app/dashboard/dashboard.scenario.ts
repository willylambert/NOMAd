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

import {Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, Output,EventEmitter } from '@angular/core';

import * as vega  from 'vega';
import * as vegaTooltip  from 'vega-tooltip';
import * as moment from 'moment';
import { DashboardService } from './dashboard-service';
import { ScenarioService } from '../scenario/scenario.service';
import { Scenario } from '../scenario/scenario';

import { faCalendar, faSpinner, faTimes } from '@fortawesome/free-solid-svg-icons';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';

import { Utils } from '../helpers/utils';
import { ScenarioWeekStat, ScenarioRegularityStat, regularityDetails, ScenarioRegularityGroupStat } from './scenario-week-stat';

import  *  as  ScenarioWeekStatDurationSpec  from  './scenario-week-stat-duration-spec.json';
import  *  as  ScenarioWeekStatDistanceSpec  from  './scenario-week-stat-distance-spec.json';
import  *  as  ScenarioWeekStatCostSpec  from  './scenario-week-stat-cost-spec.json';
import  *  as  ScenarioWeekStatCo2Spec  from  './scenario-week-stat-co2-spec.json';
import  *  as  ScenarioRegularityStatSpec  from  './scenario-regularity-stat-spec.json';
import  *  as  ScenarioRegularityKPISpec  from  './scenario-regularity-kpi-spec.json';

import { Subject, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'dashboard-scenario',
  templateUrl: './dashboard.scenario.html',
  styleUrls: ['./dashboard.scss']  
})
export class DashboardScenario implements OnInit {

  @ViewChild('charts',{static:true}) charts: ElementRef;

  @Input('index') index:number;
  @Input('dismissable') dismissable:boolean = true;
  @Input() updateWidthEvent: Subject<boolean>;
  @Output() closeScenarioAtIndex = new EventEmitter();

  graphHeight: number = 250;

  id: number;
  durationChart: vega.View;
  distanceChart: vega.View;
  costChart: vega.View;
  co2Chart: vega.View;
  regularityKPIChart: vega.View;
  regularityAMChart: vega.View;
  regularityPMChart: vega.View;

  scenarios : Scenario[];

  faCalendar = faCalendar;
  faSpinner = faSpinner;
  faTimes = faTimes;

  // Selected filters for dashboard
  selectedScenario: Scenario;
  startDt: NgbDate;
  endDt: NgbDate;

  bLoading : boolean = false;

  scenarioWeekStats : ScenarioWeekStat[];

  regularityKPIdata: ScenarioRegularityStat[];
  regularityAMdata: ScenarioRegularityStat[];
  regularityPMdata: ScenarioRegularityStat[];
  tblPickups: regularityDetails = new regularityDetails();
  tblDeliveries: regularityDetails = new regularityDetails();

  constructor(protected dashboardService: DashboardService,
              protected scenarioService: ScenarioService) { 


  }

  ngOnInit() {
    this.id = 1;

    // Get all scenarios
    this.scenarioService.list({}).subscribe(result => this.scenarios = result as Scenario[] );

    if(this.updateWidthEvent){
      this.updateWidthEvent.subscribe(b=>{
        this.updateWidth();
      });
    }

    if(this.startDt!=null && this.endDt!=null && this.selectedScenario!=null){
      this.updateDashboard(this.selectedScenario,this.startDt,this.endDt);
    }

  }

  close(){
    this.closeScenarioAtIndex.emit({scenarioIndex:this.index});
  }

  updateWidth(){
    // Skrink graph width to allow bootstrap flex to compute good colums width
    interval(10).pipe(take(1)).subscribe(t=>{
      this.durationChart.width(0).run();
      this.distanceChart.width(0).run();
      this.costChart.width(0).run();
      this.co2Chart.width(0).run();
      this.regularityAMChart.width(0).run();
      this.regularityPMChart.width(0).run();
      this.regularityKPIChart.width(0).run();
    });
    
    interval(100).pipe(take(2)).subscribe(t=>{
      this.durationChart.width(this.charts.nativeElement.clientWidth-50).run();
      this.distanceChart.width(this.charts.nativeElement.clientWidth-50).run();
      this.costChart.width(this.charts.nativeElement.clientWidth-50).run();
      this.co2Chart.width(this.charts.nativeElement.clientWidth-50).run();
      this.regularityAMChart.width(this.charts.nativeElement.clientWidth-50).run();
      this.regularityPMChart.width(this.charts.nativeElement.clientWidth-50).run();

    });
   
  }

  updateDashboard(scenario: Scenario, startDt: NgbDate, endDt : NgbDate){

    // Get dahboard data for selected filters
    this.bLoading = true;
    
    this.dashboardService.getScenarioDateRange(scenario.id,Utils.ngbDateToMoment(startDt).valueOf(),Utils.ngbDateToMoment(endDt).valueOf()).subscribe( result => {
      this.bLoading = false;

      var handler = new vegaTooltip.Handler();

      // Duration Chart
      let durationSpec = (ScenarioWeekStatDurationSpec as any).default;
      durationSpec.data[0].values = result.data["weekStats"] as ScenarioWeekStat[];

      this.durationChart = new vega.View(vega.parse(durationSpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#durationChart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .tooltip(handler.call)
      .height(this.graphHeight)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();

      // Distance Chart
      let distanceSpec = (ScenarioWeekStatDistanceSpec as any).default;
      distanceSpec.data[0].values = result.data["weekStats"] as ScenarioWeekStat[];

      this.distanceChart = new vega.View(vega.parse(distanceSpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#distanceChart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .tooltip(handler.call)
      .height(this.graphHeight)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();

      // Cost Chart
      let costSpec = (ScenarioWeekStatCostSpec as any).default;
      costSpec.data[0].values = result.data["weekStats"] as ScenarioWeekStat[];

      this.costChart = new vega.View(vega.parse(costSpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#costChart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .tooltip(handler.call)
      .height(this.graphHeight)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();

      // CO2 Chart
      let co2Spec = (ScenarioWeekStatCo2Spec as any).default;
      co2Spec.data[0].values = result.data["weekStats"] as ScenarioWeekStat[];

      this.co2Chart = new vega.View(vega.parse(co2Spec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#co2Chart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .tooltip(handler.call)
      .height(this.graphHeight)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();            

      // Regularity KPI Chart      
      let regularityKPISpec = (ScenarioRegularityKPISpec as any).default;

      var regularityValuesAM = this.getRegularityKPI(result.data["regularityAMStats"],"am");
      var regularityValuesPM = this.getRegularityKPI(result.data["regularityPMStats"],"pm");

      regularityKPISpec.data[0].values = regularityValuesAM.concat(regularityValuesPM);

      this.regularityKPIChart = new vega.View(vega.parse(regularityKPISpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#regularityKPIChart' + this.index)     // initialize view within parent DOM container
      //.width(800)               // set chart width 
      .height(this.graphHeight*1.5)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();  

      // Regularity Chart - AM
      let regularitySpec = (ScenarioRegularityStatSpec as any).default;
      this.regularityAMdata = result.data["regularityAMStats"] as ScenarioRegularityStat[];
      regularitySpec.data[0].values = this.regularityAMdata;

      // Get number of hr to compute best graph height
      var nbHR = 0;
      var hrIndex = {};
      for(let deliveryItem of this.regularityAMdata){
        if(hrIndex[deliveryItem.name]==undefined){
          hrIndex[deliveryItem.name] = true;
          nbHR++;
        }
      }

      let height = nbHR*50;

      this.regularityAMChart = new vega.View(vega.parse(regularitySpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#regularityAMChart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .tooltip(handler.call)
      .height(height)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();  

      this.regularityAMChart.addSignalListener('tooltip', (name,value) => {
        if(value.value!=undefined){
          var hrName:string;
          if(value.name!=undefined){
            hrName = value.name; // Hover graph rect
          }else{
            hrName = value.value; // Hover axes Y
          }
          this.tblPickups.name = hrName;
          this.tblPickups.details = [];
          for(let pickupItem of this.regularityAMdata){
            if(pickupItem.name==hrName){
              this.tblPickups.details.push(pickupItem);
            }
          }
        }
      });

      // Regularity Chart - PM
      this.regularityPMdata = result.data["regularityPMStats"] as ScenarioRegularityStat[];
      regularitySpec.data[0].values = this.regularityPMdata;

      // Get number of hr to compute best graph height
      var nbHR = 0;
      var hrIndex = {};
      for(let deliveryItem of this.regularityAMdata){
        if(hrIndex[deliveryItem.name]==undefined){
          hrIndex[deliveryItem.name] = true;
          nbHR++;
        }
      }

      height = nbHR*50;

      this.regularityPMChart = new vega.View(vega.parse(regularitySpec))
      .renderer('svg')          // set renderer (canvas or svg)
      .initialize('#regularityPMChart' + this.index)     // initialize view within parent DOM container
      .width(10)               // set chart width 
      .height(height)              // set chart height
      .hover()                  // enable hover encode set processing
      .run();  

      this.regularityPMChart.addSignalListener('tooltip', (name,value) => {
        if(value.value!=undefined){
          var hrName:string;
          if(value.name!=undefined){
            hrName = value.name; // Hover graph rect
          }else{
            hrName = value.value; // Hover axes Y
          }
          this.tblDeliveries.name = hrName;
          this.tblDeliveries.details = [];
          for(let deliveryItem of this.regularityPMdata){
            if(deliveryItem.name==hrName){
              this.tblDeliveries.details.push(deliveryItem);
            }
          }
        }
      });

      this.updateWidth();

    });
    
  }  

  /**
   * Search in scenario list
   */
  customSearchFn(term: string, item: any){
    term = term.toLocaleLowerCase();
    return item.code.toLocaleLowerCase().indexOf(term) > -1 || 
    item.label.toLocaleLowerCase().indexOf(term) > -1 || 
    (item.code + " - " + item.label).toLocaleLowerCase().indexOf(term) > -1;
  }

  /**
   * A scenario is selected - use start dt / end dt as filter
   */
  scenarioSelected(selectedScenario){
    if(selectedScenario!=null){
      this.startDt = Utils.momentToNgbDate(moment(selectedScenario.start_dt));
      this.endDt = Utils.momentToNgbDate(moment(selectedScenario.end_dt));
    }
  }

  /**
   * tranform
   */
  getRegularityKPI(namedItems:ScenarioRegularityStat[],ampm:string) : ScenarioRegularityGroupStat[]{
    var tblHRminHr = {};
    var tblRet:ScenarioRegularityGroupStat[] = [];
    var tblClassCount = {};

    // First, for each user, remove hr offset (min hour is offset to 0)
    
    // get min hr for each user
    for(let item of namedItems){
      if(item.value>0){ // Avoid target_hr to 0
        if(tblHRminHr[item.name]==undefined){
          tblHRminHr[item.name] = item.value;
        }
        if(item.value < tblHRminHr[item.name]){
          tblHRminHr[item.name] = item.value;
        }
      }
    }

    // apply offset    
    for(var i=0;i<namedItems.length;i++){
      if(namedItems[i].value>0){ // Avoid target_hr to 0
        // get class (from 2 minutes)
        let difference = Math.floor( ((namedItems[i].value-tblHRminHr[namedItems[i].name])/60000) / 10) * 10;
        console.log(((namedItems[i].value-tblHRminHr[namedItems[i].name])/60000),difference);
        if(tblClassCount[difference]==undefined){
          tblClassCount[difference]=0;
        }
        tblClassCount[difference]++;
      }
    }

    for(let diffClass in tblClassCount){
      tblRet.push({count:tblClassCount[diffClass],difference:parseInt(diffClass),ampm:ampm});
    }
    
    return tblRet;
  }

}