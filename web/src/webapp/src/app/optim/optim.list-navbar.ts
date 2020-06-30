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

import {Component, Output, EventEmitter, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ListNavbar } from '../list-navbar/list-navbar';
import { Scenario } from '../scenario/scenario';
import { ScenarioService } from '../scenario/scenario.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user';

@Component({
  selector: 'optim-list-navbar',
  templateUrl: './optim.list-navbar.html',
  styleUrls: ['./optim.scss']
})
export class OptimListNavbar extends ListNavbar{

  // Emitted in case of a change in the period filter
  @Output() periodEvent = new EventEmitter()

  // Emitted in case of a change in the scenario filter
  @Output() scenarioEvent = new EventEmitter()

  /**
   * Some predefined periods
   */
  public periods = [
    {label:"Dernières 24h",value:1},
    {label:"Dernières 48h",value:2},
    {label:"Derniers 7 jours",value:3},
    {label:"Derniers 30 jours",value:30},
    {label:"Tout",value:null},
  ]

  // The number of days to keep
  @Input('periodValue') periodValue: number;

  // List of scenarios for filtering the list of optimizations
  scenarios : Scenario[];

  // The selected scenario id
  // For admin users, we have the possibility to user "", which means 'all scenarios'
  // As long as this value is undefined, the scenarios filter should be masked in the template.
  scenarioId:string;

  constructor(
    protected router: Router,protected scenarioService : ScenarioService,protected userService:UserService) {
    super(router);
    this.title='Optimisations';
    this.aclObject='optim';
    this.scenarioService.list({}).subscribe(scenarios=>{
      this.scenarios=scenarios as Scenario[];
      // Try to know whether the current user is admin or not, and change the presentation accordingly
      let currentUser = JSON.parse(localStorage.getItem('currentUser'));
      this.userService.get(currentUser['user_main_id']).subscribe(user =>{
        if((user as User).type_code=='ADMIN'){
          // For admin users only, we propose an option "all scenarios" that makes it possible to view more optimizations runs.
          // Although the computation of a list of optimization runs is time-consuming on server side, we can propose it in
          //   a non filtered version to admin users, because admin users do not require data access checks on server side
          var emptyScenario = new Scenario();
          emptyScenario.label="Tous les scénarios";
          emptyScenario.id="";
          this.scenarios.push(emptyScenario);
          this.scenarioId="";
        }
        else{
          // Only for non-admin users :
          // In order to provide a list of optimization runs to a non-admin user, server requires the presence
          //   of a scenario_main_id filter (otherwise an empty list of optimization runs will be returned).
          // Therefore the choice of a scenario_main_id is mandatory, and the default value for the scenario_main_id
          //   will be the id of the first scenario in the list.
          // In case the list of scenarios is empty, this scenario_main_id can not be set and therefore an empty list of 
          //   optimizations will be displayed whatever the used filters
          if(this.scenarios.length>0 && this.scenarios[0].id !=null && this.scenarios[0].id !=undefined && this.scenarios[0].id !=''){
            this.scenarioId=this.scenarios[0].id;
            this.onScenarioChange(undefined)
          }
        }        
      })
    })
  }

  onPeriodChange($event){
    for(let period of this.periods){
      if(period.value==$event){
        this.periodEvent.emit({value:period.value});
        break;
      }
    }    
  }

  onScenarioChange($event){
    this.scenarioEvent.emit({value:this.scenarioId});  
  }  


}