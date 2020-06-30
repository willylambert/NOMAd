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
import { Scenario, ScenarioVehicleCategory } from './scenario';
import { GridOptions } from 'ag-grid-community';

import { VehicleCategory } from '../vehicle-category/vehicle-category';
import { VehicleCategoryService } from '../vehicle-category/vehicle-category.service';

import { faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { faChild } from '@fortawesome/free-solid-svg-icons';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { POI } from '../poi/poi';
import { VehicleCategorySiteQuantity } from '../vehicle-category/vehicle-category-site-quantity';

@Component({
  templateUrl: './scenario-modal.fleet.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioModalFleet {

  // The input scenario
  @Input('currentRecord') currentRecord: Scenario;

  // Available depots
  @Input('depots') depots: POI[];

  public gridOptions: GridOptions;

  // The available categories of vehicle
  vehicleCategories:VehicleCategory[];

  // The associations between a category of vehicle and a quantity.
  fleet:ScenarioVehicleCategory[];

  faWheelchair = faWheelchair;
  faChild = faChild;

  constructor(
      public activeModal: NgbActiveModal,
      public vehicleCategoryService:VehicleCategoryService) {

    this.vehicleCategoryService.list({search:"",startIndex:0,length:0}).subscribe((vehicleCategories) => {
      this.vehicleCategories=vehicleCategories
    });
    this.fleet=[];
    this.gridOptions = {
      rowHeight:30,
      headerHeight:30,
      columnDefs : [
        {headerName: 'Référence', field: 'code', checkboxSelection: true},
        {headerName: 'Description', field: 'label' },
        {headerName: 'Configurations',field: 'configurations', cellRendererFramework: VehicleConfigurationsComponent },
      ]
    } as GridOptions;
  }

  /**
   * Called when grid is ready
   * @param params sent by the grid
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
    this.gridOptions.api.forEachNode(node=> {
      var selected = false;
      // Set this.fleet variable with the fleet content found in this.currentRecord
      for(let fleetItem of this.currentRecord.fleet){
        if(node.data.id == fleetItem.data.id){
          this.fleet.push(fleetItem);
          selected = true;
          break;
        }
      }
      node.setSelected(selected);
    });
    console.log("fleet",this.fleet);

    // Initialise quantity per depot
   this.initQuantityByDepot();

    params.api.sizeColumnsToFit();
  }

  /**
   * Create if needed a quantity entry for each depot on each selected vehicle category
   */
  initQuantityByDepot(){
    for(let depot of this.depots){
      for(let vehicleCat of this.fleet){
        var bDepotFound = false;
        for(let vehicleCatDepot of vehicleCat.data.vehicle_category_site_quantity){
          if(vehicleCatDepot.site_main_id ==  depot.site_main_id){
            bDepotFound = true;
            // Needed as server does not provide site label
            vehicleCatDepot.site_main_label = depot.label;
            break;
          }
        }
        if(!bDepotFound){
          vehicleCat.data.vehicle_category_site_quantity.push( new VehicleCategorySiteQuantity(depot.site_main_id,true,null, depot.label));
        }
      }
    }
  }

  /**
   * Triggered when one row of the grid is selected or unselected.
   */
  onSelected(){
    this.gridOptions.api.forEachNode(node=> {
      if(node.isSelected()){
        // If the node is selected, add a new vehicle category to the fleet if necessary
        var bVehicleCategoryAlreadySelected = false;
        for(let fleetItem of this.fleet){
          if(fleetItem.data.id == node.data.id){
            bVehicleCategoryAlreadySelected = true;
            break;
          }
        }
        if(!bVehicleCategoryAlreadySelected){
          // Default value is unlimited
          this.fleet.push({data:node.data,quantity:0,unlimited:true} as ScenarioVehicleCategory);
        }
      }
      else{
        // If the node is unselected, remove the vehicle categoty from the fleet is necessary
        for(var i=0;i<this.fleet.length;i++){
          if( this.fleet[i].data.id == node.data.id){
            this.fleet.splice(i,1)
            break;
          }
        }
      }
    });
    this.initQuantityByDepot();
  }

  /**
   * Called when modal is ready
   */
  ngOnInit() {

  }


  /**
   * Called when user clicks the validate button.
   */
  validate() {
    // Copy the local fleet data into the input/output fleet data
    this.currentRecord.fleet = this.fleet;
    // Send a boolean to mean that the input currentRecord variable is likely to have been modified
    this.activeModal.close(true);
  }

}

// Enable to display icons for the vehicle configurations in the ag-grid
@Component({
    template: "<div *ngFor=\"let configuration of params.node.data.configurations\" class=\"badge badge-info ml-3\">\
                 <span *ngFor=\"let capacity of configuration.capacities\"> \
                   <span *ngIf=\"capacity.transported_code=='FAUTEUIL'\">{{capacity.quantity}} <fa-icon [icon]=\"faWheelchair\"></fa-icon></span> \
                   <span *ngIf=\"capacity.transported_code=='MARCHANT'\">{{capacity.quantity}} <fa-icon [icon]=\"faChild\"></fa-icon></span> \
                 </span> \
               </div>",
})
export class VehicleConfigurationsComponent implements ICellRendererAngularComp {
  public params: any;

  faWheelchair = faWheelchair;
  faChild = faChild;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }
}