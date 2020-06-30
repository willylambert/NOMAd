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

import {Component, Input } from '@angular/core';
import { Subject, interval } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'dashboard-scenarios',
  templateUrl: './dashboard.scenarios.html',
  styleUrls: ['./dashboard.scss']  
})
export class DashboardScenarios  {

  // scenarios to display
  scenariosIndex : number[] = [0];

  // Allow to notify childs to compute graph width
  updateWidth: Subject<boolean> = new Subject();

  addScenario(){
    this.scenariosIndex.push(this.scenariosIndex.length);

    // Notify children to make room for newcomer
    this.updateWidth.next(true);    
  }

  /**
   * @param $event {scenarioIndex:number}
   */
  closeScenarioAtIndex($event){
    var i=0;
    for(let scenarioIndex of this.scenariosIndex){
      if(scenarioIndex==$event.scenarioIndex){
        this.scenariosIndex[i] = null;
        break;
      }
      i++;
    }
    // Notify children that there is more space
    this.updateWidth.next(true);    
  }

}