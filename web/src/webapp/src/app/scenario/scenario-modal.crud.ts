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

import { Component,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Scenario } from './scenario';
import { ScenarioService } from './scenario.service';
import { RestResult } from '../helpers/crud-result';
import { faTimes,faCheck} from '@fortawesome/free-solid-svg-icons';

@Component({
  templateUrl: './scenario-modal.crud.html',
})
export class ScenarioModalCrud {

  // The input scenario if needed :
  //  - in edit mode we need the input scenario to populate this.currentRecord
  //  - in add mode we may need it in case we want to duplicate an existing scenario
  @Input('inputScenario') inputScenario: Scenario;

  // The edit mode ('add' for scenario creation or duplication or 'edit' for scenario update)
  @Input('editMode') editMode: string;

  currentRecord : Scenario;
  bDuplicate : boolean;

  // The fa icons
  faTimes=faTimes;
  faCheck=faCheck;

  constructor(
      public activeModal: NgbActiveModal,
      public scenarioService:ScenarioService) {
    this.currentRecord=new Scenario();
    this.bDuplicate = true;
  }

  /**
   * Called when modal is ready
   */
  ngOnInit() {
    if(this.editMode=='edit' && this.inputScenario!=undefined && this.inputScenario.id!=undefined){
      this.currentRecord.id=this.inputScenario.id;
      this.currentRecord.label=this.inputScenario.label;
      this.currentRecord.code=this.inputScenario.code;
      this.currentRecord.status_code=this.inputScenario.status_code;
    }
  }

  /**
   * Called when user clicks the validate button.
   * This will save the scenario into database and leave the modal
   */
  validate(){
    if(this.editMode=='add' && this.inputScenario.id!=undefined){
      this.scenarioService.duplicate({scenarioMainId:this.inputScenario.id,newScenario:this.currentRecord}).subscribe(response => {
        if(response.result==RestResult.Ok){
          this.activeModal.close(response.data);
        }
      });
    }
    else{
      this.scenarioService.save(this.currentRecord).subscribe(response => {
        if(response.result==RestResult.Ok){
          this.activeModal.close(response.data);
        }
      });
    }
  }

  onDuplicateToggle(){
    this.bDuplicate=!this.bDuplicate;
  }

}