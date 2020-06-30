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

import { Component, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';

import {  Site} from '../site/site';
import { SiteService } from '../site/site.service';
import {  ScenarioDemands} from './scenario';
import { ScenarioService } from './scenario.service';


@Component({
  selector: 'scenario-minimap',
  templateUrl: './scenario.minimap.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioMinimap implements OnChanges {

  // The id of the scenario for which we display the minimap
  @Input('scenarioId') scenarioId: string;

  // The label of the scenario for which we display the minimap
  @Input('scenarioLabel') scenarioLabel: string;

  // Register the number of changes in the routes of the scenario
  @Input('changeInRoutes') changeInRoutes:number;

  // When user clicks a link that is proposed in the minimap
  @Output() minimapClickEvent = new EventEmitter();

  // A minimap of the scenario to present the distribution of the scenario routes accross the possible filters values
  // Here is an example of a minimap :
  //{
  //  withDemands:[{id:'0349cf27-1d6a-11e9-8ff9-0242ac120002',label:'institution Bob Leponge',weekDays:[
  //        {"id":0,label:"Lundi",code:"MONDAY",AM:false,PM:true},
  //        {"id":1,label:"Mardi",code:"TUESDAY",AM:false,PM:false},
  //        {"id":2,label:"Mercredi",code:"WEDNESDAY",AM:true,PM:false},
  //        {"id":3,label:"Jeudi",code:"THURSDAY",AM:false,PM:true},
  //        {"id":4,label:"Vendredi",code:"FRIDAY",AM:false,PM:false}
  //      ]},
  //      {id:'0349cf26-1d6a-11e9-8ff9-0242ac120002',label:'institution 2',weekDays:[
  //        {"id":0,label:"Lundi",code:"MONDAY",AM:false,PM:true},
  //        {"id":1,label:"Mardi",code:"TUESDAY",AM:false,PM:true},
  //        {"id":2,label:"Mercredi",code:"WEDNESDAY",AM:true,PM:false},
  //        {"id":3,label:"Jeudi",code:"THURSDAY",AM:false,PM:true},
  //        {"id":4,label:"Vendredi",code:"FRIDAY",AM:false,PM:false}
  //      ]}
  //    ],
  //    withoutDemands:[{label:'institution 2',weekDays:[
  //        {"id":0,label:"Lundi",code:"MONDAY",AM:false,PM:true},
  //        {"id":1,label:"Mardi",code:"TUESDAY",AM:false,PM:false},
  //        {"id":2,label:"Mercredi",code:"WEDNESDAY",AM:false,PM:true},
  //        {"id":3,label:"Jeudi",code:"THURSDAY",AM:false,PM:true},
  //        {"id":4,label:"Vendredi",code:"FRIDAY",AM:false,PM:false}
  //      ]}
  //    ],
  //  }
  minimap : ScenarioDemands;

  // Tell whether the scenario contains some routes or not
  bWithRoutes : boolean;

  // for display purpose
  weekDays : string[];

  constructor(public scenarioService:ScenarioService,public siteService:SiteService) {
    this.weekDays=["Lundi","Mardi","Mercredi","Jeudi","Vendredi"];
    this.bWithRoutes = false;
  }

  /**
   * Triggered on any changes in the scenario id : will reload the minimap
   * @param changes SimpleChanges : object containing the detected changes in the local attributes
   */
  ngOnChanges(changes: SimpleChanges) {
    if(changes.scenarioId){
      this.updateMinimap();
    }
    if(changes.changeInRoutes && !changes.changeInRoutes.firstChange){
      this.updateMinimap();
    }
  }

  /**
   * Update Minimap
   */
  updateMinimap(){
    if(this.scenarioId!=undefined){
      this.scenarioService.minimap(this.scenarioId).subscribe(minimap => {
        this.minimap=minimap;
        // Tell wether it is relevant to display minimap or not
        this.bWithRoutes = false;
        for(let institution of this.minimap.withDemands){
          for(let weekDay of institution.weekDays){
            if(weekDay.AM || weekDay.PM){
              this.bWithRoutes = true;
              break;
            }
          }
          if(this.bWithRoutes){
            break;
          }
        }
        for(let institution of this.minimap.withoutDemands){
          for(let weekDay of institution.weekDays){
            if(weekDay.AM || weekDay.PM){
              this.bWithRoutes = true;
              break;
            }
          }
          if(this.bWithRoutes){
            break;
          }
        }
      });
    }
  }

  /**
   * Triggered on a minimap link click: it will broadcast an event for filter reseting in the route crud menu
   * @param boolean bWithDemands : new position for the with/without demand filter
   * @param {id:string,label:string} institution : element to put in the institutions filter
   * @param {id:string,label:string,code:string} timeSlotDay : element to put in the day filter
   * @param boolean bMorning : element to put in the half/day filter
   */
  onLinkClick(bWithDemands: boolean, institution: {id:string,label:string}, timeSlotDay: {id:string,label:string,code:string}, bMorning: boolean){
    // Get the institution details before request the filters change
    this.siteService.get(institution.id).subscribe(site =>
      this.minimapClickEvent.emit({ value: {
        institutions: [site],
        timeSlotDay:timeSlotDay,
        timeSlotAMPM:bMorning?"AM":"PM",
        demands:bWithDemands,
        bMorning:bMorning
      }})
    )
  }

}