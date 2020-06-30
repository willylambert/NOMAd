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

import { Component, OnInit,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ThesaurusService } from '../thesaurus/thesaurus.service';

import { VehicleConfiguration } from './vehicle-configuration';
import { VehicleCapacity } from './vehicle-configuration';

@Component({
  templateUrl: './vehicle-configuration.crud-modal.html',
})
export class VehicleConfigurationModal implements OnInit {

  // The input vehicle configuration, that we want to update
  @Input('configuration') configuration: VehicleConfiguration;

  // Whether this is edit or add mode
  @Input('editMode') editMode:string;

  // Temporary work vehicle configuration, will be copied into this.configuration if formular is correctly filled
  currentRecord : VehicleConfiguration;

  constructor(public activeModal: NgbActiveModal,private thesaurusService:ThesaurusService) {
    this.currentRecord = new VehicleConfiguration();
  }

  /**
   * On data reception, copy the input configuration data into the temporary configuration
   */
  ngOnInit() {
      this.thesaurusService.list({cat:'VEHICLE_CAPACITY_TRANSPORTED'}).subscribe(transportedCapacities => {
        this.currentRecord.code=this.configuration.code;
        this.currentRecord.label=this.configuration.label;
        for(let transportedCapacity of transportedCapacities){
          var capacity = new VehicleCapacity();
          capacity.transported_code=transportedCapacity.code;
          capacity.transported_label=transportedCapacity.label;
          capacity.quantity = 0;
          if(this.configuration && this.configuration.capacities){
            for(let inputCapacity of this.configuration.capacities){
              if(inputCapacity.transported_code==capacity.transported_code){
                capacity.quantity=inputCapacity.quantity;
                break;
              }
            }
          }
          this.currentRecord.capacities.push(capacity);
        }
      })
    }

    /**
     * Try to update or insert a capacity in this.configuration.capacities.
     * @param capacityToBeSaved VehicleCapacity : the capacity to update or insert in this.configuration.capacities.
     */
    saveCapacity(capacityToBeSaved : VehicleCapacity){
      // Try to update the passengers capacity in this.configuration.capacities
      var bUpdated=false;
      for(let capacity of this.configuration.capacities){
        if(capacity.transported_code==capacityToBeSaved.transported_code){
          capacity.quantity = capacityToBeSaved.quantity;
          bUpdated=true;
          break;
        }
      }
      if(!bUpdated){
        // Update failed because the capacity was not found in this.configuration.capacitie, so insert the capacity
        this.configuration.capacities.push(capacityToBeSaved);
      }
    }

    /**
     * Try to delete a capacity from this.configuration.capacities.
     * @param capacityToBeDeleted VehicleCapacity : the capacity to be deleted from this.configuration.capacities.
     */
    deleteCapacity(capacityToBeDeleted : VehicleCapacity){
      // We will copy the capacities from this.configuration.capacities in a temporary structure, except the capacity
      //  to be deleted
      var temporaryCapacities = [];
      for(let capacity of this.configuration.capacities){
        if(capacity.transported_code!=capacityToBeDeleted.transported_code){
          temporaryCapacities.push(capacity);
        }
      }
      // Put the temporary structure back into this.configuration.capacities
      this.configuration.capacities=temporaryCapacities;
    }

  /**
   * If formular is validated, copy the temporary configuration information into the input configuration before
     *   closing the modal
   */
  save() {
    for(let capacity of this.currentRecord.capacities){
      if(capacity.quantity!=undefined && capacity.quantity!=0){
        this.saveCapacity(capacity);
      }
      else{
        this.deleteCapacity(capacity);
      }
    }
    this.configuration.code=this.currentRecord.code;
    this.configuration.label=this.currentRecord.label;
    this.activeModal.close("save");
  }

    /**
     * Close the modal and tell that the vehicle configuration should be deleted
     */
  delete(){
    this.activeModal.close("delete");
  }
}