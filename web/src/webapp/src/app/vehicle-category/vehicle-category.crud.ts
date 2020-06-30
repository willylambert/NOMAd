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

import {Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { BaseCrud } from '../basecrud';

import { VehicleCategory } from './vehicle-category';
import { VehicleCategoryService } from './vehicle-category.service';
import { VehicleConfiguration } from '../vehicle-configuration/vehicle-configuration';
import { VehicleConfigurationModal } from '../vehicle-configuration/vehicle-configuration.crud-modal';

import { ThesaurusService } from '../thesaurus/thesaurus.service';

import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faChild } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-vehicle-category-crud',
  templateUrl: './vehicle-category.crud.html',
  styleUrls: ['./vehicle-category.css']
})
export class VehicleCategoryCrud extends BaseCrud implements OnInit  {

  currentRecord : VehicleCategory;

  faWheelchair = faWheelchair;
  faChild = faChild;

  // Tell whether there are some changes in the formular that are not handled by form.pristine
  //  (for instance configuration creation or deletion)
  bChanges:boolean;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private vehicleCategoryService:VehicleCategoryService,
    private thService:ThesaurusService,
    private modalService:NgbModal
    ) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(vehicleCategoryService,thService,router);
      this.currentRecord = new VehicleCategory();
      this.bChanges=false;
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => {
        // After data loading, no changes have occured
        this.bChanges=false;
      });
    }

  /**
   * Called on vehicle-category data reception
   */
  ngOnInit() {
    // Load Vehicle
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
    });
  }

  /**
   * Launch the modal for editing a vehicle configuration
   * @param configuration VehicleConfiguration : the vehicle configuration to edit
   * @param i number : the index of the vehicle configuration (in case we want to delete the configuration)
   */
  editConfiguration(configuration : VehicleConfiguration,i:number){
    const modalRef = this.modalService.open(VehicleConfigurationModal);
    (modalRef.componentInstance as VehicleConfigurationModal).configuration =  configuration;
    (modalRef.componentInstance as VehicleConfigurationModal).editMode = 'edit';

    modalRef.result.then((result) => {
      if(result=="delete"){
        this.bChanges=true;
        this.currentRecord.configurations.splice(i,1);
      }
      if(result=="save"){
        this.bChanges=true;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  /**
   * Launch the modal for adding a vehicle configuration
   */
  addConfiguration(){
    const modalRef = this.modalService.open(VehicleConfigurationModal);
    var configuration = new VehicleConfiguration();
    (modalRef.componentInstance as VehicleConfigurationModal).configuration =  configuration;
    (modalRef.componentInstance as VehicleConfigurationModal).editMode = 'add';

    modalRef.result.then((result) => {
      if(result=="save"){
        this.bChanges=true;
        this.currentRecord.configurations.push(configuration)
      }
    }).catch((error) => {
      console.log(error);
    });
  }

}