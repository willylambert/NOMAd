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

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


import { CrudNavbarModalConfirmDelete } from '../crud-navbar/crud-navbar-modal.confirm-delete';
import { RouteModalSave } from '../route/route-modal.save';
import { RouteSet } from '../route/route.set';
import { Scenario } from './scenario';
import { ScenarioService } from './scenario.service';
import { ScenarioModalCrud } from './scenario-modal.crud';

import { faPlus,faAngleRight,faAngleLeft,faPen,faClone,faTimes,faCogs } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'scenario-quick-list',
  templateUrl: './scenario.quick-list.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioQuickList {

  // Current transport scenario id
  @Input('scenarioMainId') scenarioMainId: string;

  // The displayed routes (enables to know whether the routes that are currently displayed have unsaved changes)
  @Input('routes') routes: RouteSet;

  // Whether scenario overview was requested or not
  @Input('bOverview') bOverview : boolean;

  // Icons used in template
  faPlus = faPlus;
  faAngleRight = faAngleRight;
  faAngleLeft = faAngleLeft;
  faPen = faPen;
  faClone = faClone;
  faTimes = faTimes;
  faCogs = faCogs;

  @Output() scenarioChangeEvent = new EventEmitter();
  @Output() overviewRequestEvent = new EventEmitter();

  // The current list of scenarios
  scenarios : Scenario[];

  // Whether the scenario list is folded or unfolded
  unfolded : boolean;

  constructor(private modalService: NgbModal,public scenarioService:ScenarioService) {
    this.scenarioService.list({}).subscribe(scenarios => this.scenarios = scenarios as Scenario[])
    this.unfolded = true;
  }

  /**
   * Fold or unfold scenario list bar
   */
  toggleFolding(){
    this.unfolded=!this.unfolded;
  }

  /**
   * Called on a scenario click.
   * In case the clicked scenario is different from the current scenario, the current scenario will be udpated.
   * In addition, if one of the routes that are currently displayed contains some unsaved modification, user
   *   confirmation is requested before scenario change
   * @param Scenario scenario : the clicked scenario
   **/
  onScenarioClick(scenario : Scenario){
    if(this.scenarioMainId!=scenario.id){
      if(this.routes.hasChanged(false)){
        // Some changes were detected in the displayed routes, request user confirmation
        const modalRef = this.modalService.open(RouteModalSave);
        modalRef.result.then((result) => {
          if(result=='Y'){
            // User has confirmed the scenario change
            this.scenarioChangeEvent.emit({ value: { scenario:scenario, reloadRoutes:true } });
          }
        });
      }
      else{
        // Scenario chnage without confirmation
        this.scenarioChangeEvent.emit({ value: { scenario:scenario, reloadRoutes:true } });
      }
    }
  }

  /**
   * Launches the scenario crud modal.
   * When a scenario is saved into database, this function will updates the scenarios list and the current scenario
   * @param editMode string : whether this is 'add' or 'edit' mode
   * @param inputScenario Scenario : in case of scenario update or scenario duplication, we need this input scenario
   */
  launchScenarioModal(editMode,inputScenario : Scenario){
    const modalRef = this.modalService.open(ScenarioModalCrud);
    (modalRef.componentInstance as ScenarioModalCrud).inputScenario = inputScenario;
    (modalRef.componentInstance as ScenarioModalCrud).editMode = editMode;
    modalRef.result.then((newScenario) => {
      if(newScenario){
        // A scenario saving succeeded
        this.scenarioService.list({}).subscribe(scenarios => {
          this.scenarios = scenarios as Scenario[];
          for(let scenario of this.scenarios){
            if(scenario.id == newScenario.id){
              // Reload the routes only when we created a new scenario
              this.scenarioChangeEvent.emit({ value: { scenario:scenario, reloadRoutes: editMode=='add' } });
              break;
            }
          }
        })
      }
    });
  }

  /**
   * Called on new scenario button click.
   * If one of the routes that are currently displayed contains some unsaved modification, user
   *   confirmation is requested before the new scenario creation
   */
  newScenario(){
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.launchScenarioModal('add',new Scenario());
        }
      });
    }
    else{
      this.launchScenarioModal('add',new Scenario());
    }
  }

  /**
   * Prevent the default behavior from happening after an event.
   * We use it to prevent from scenario change when clicking a scenario action button
   * @param event Event : the event for which we need ignore the default behavior
   */
  preventScenarioChange(event : Event){
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Called on scenario duplication button click.
   * If one of the routes that are currently displayed contains some unsaved modification, user
   *   confirmation is requested before the scenario duplication
   * @param Scenario inputScenario : the scenario to be duplicated
   *  @param event Event : the event for which we need ignore the default behavior
   */
  duplicateScenario(inputScenario : Scenario, event : Event){
    this.preventScenarioChange(event);
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.launchScenarioModal('add',inputScenario);
        }
      });
    }
    else{
      this.launchScenarioModal('add',inputScenario);
    }
  }

  /**
   * Called on scenario edit button click.
   * No user confirmation requested before launching the modal because we will not change the scenario id
   * @param Scenario inputScenario : the scenario to be edited
   * @param event Event : the event for which we need ignore the default behavior
   */
  editScenario(inputScenario : Scenario, event : Event){
    this.preventScenarioChange(event);
    this.launchScenarioModal('edit',inputScenario);
  }

  /**
   * Shortcut for reseting the list of scenarios as well as the current scenario
   */
  resetScenarios(){
    this.scenarioService.list({}).subscribe(scenarios => this.scenarios = scenarios as Scenario[])
    this.scenarioChangeEvent.emit({ value: { scenario:new Scenario(), reloadRoutes:true } });
  }

  /**
   * Called on scenario deletion button click.
   * @param Scenario inputScenario : the scenario to be deleted
   * @param event Event : the event for which we need ignore the default behavior
   */
  deleteScenario(inputScenario : Scenario, event : Event){
    this.preventScenarioChange(event);
    const modalRef = this.modalService.open(CrudNavbarModalConfirmDelete);
    var chkDelete = false;
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).aclObject = "scenario";
    (modalRef.componentInstance as CrudNavbarModalConfirmDelete).onCkeck.subscribe((value)=>{
      chkDelete = value;
    });
    modalRef.result.then((result) => {
      if(result=='Y'){
        if(chkDelete){
          this.scenarioService.delete(inputScenario).subscribe(response => {
            if(response){
              this.resetScenarios()
            }
          })
        }else{
          this.scenarioService.markAsRemoved(inputScenario).subscribe(response => {
            if(response){
              this.resetScenarios()
            }
          })
        }
      }
    });
  }

  /**
   * Called on scenario overview button click - request a scenario overview
   * If one of the routes that are currently displayed contains some unsaved modification, user
   *   confirmation is requested before the scenario overview request
   */
  overview(){
    if(this.routes.hasChanged(false)){
      const modalRef = this.modalService.open(RouteModalSave);
      modalRef.result.then((result) => {
        if(result=='Y'){
          this.overviewRequestEvent.emit();
        }
      });
    }
    else{
      this.overviewRequestEvent.emit();
    }
  }
}