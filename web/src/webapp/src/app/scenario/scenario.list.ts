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
import { ScenarioService } from '../scenario/scenario.service';
import { Scenario } from './scenario';

import { faWheelchair, faChild } from '@fortawesome/free-solid-svg-icons';
import { ThesaurusItem } from '../thesaurus/thesaurus';
import { ThesaurusService } from '../thesaurus/thesaurus.service';

@Component({
  selector: 'app-scenario',
  templateUrl: './scenario.list.html',
})
export class ScenarioList implements OnInit {

  scenarios : Scenario[];
  search :string;

  // The available statuses for the scenarios
  statuses:ThesaurusItem[];

  faWheelchair = faWheelchair;
  faChild = faChild;

  constructor(
    protected scenarioService:ScenarioService,
    protected thService: ThesaurusService) {
      this.search="";
      this.scenarios=[];
  }

  /**
   * Called on data reception
   */
  ngOnInit() {
    this.updateList();

    this.thService.list({cat:'SCENARIO_MAIN_STATUS'}).subscribe(thesaurusItems=>{
      this.statuses = thesaurusItems;
    });     
  }

  updateSearch(event){
    this.search=event.value;
    this.updateList();
  }

  /**
   * Update the list of scenarios
   */
  updateList(){
    this.scenarioService.list({statusCode: null, search: this.search }).subscribe(scenarios => {
      this.scenarios = scenarios as Scenario[];
      // compute a list of HRs for each scenario
      for(let scenario of this.scenarios){
        // The list of demands may contain some duplicate HRs
        var HRdemands=[];
        for(let demand of scenario.demands){
          if(HRdemands[demand.hr_id]==undefined){
            HRdemands[demand.hr_id]=demand;
          }
        }
        // The list of HRs is similar to the list of demands but without duplicate names
        scenario.HRs = [];
        for(var hr_id in HRdemands){
          scenario.HRs.push(HRdemands[hr_id]);
        }
      }
    });
  }

  scenariosByStatus(statusId: string){
    return this.scenarios.filter(scenario => scenario.status_th===statusId);
  }


}
