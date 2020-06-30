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

import { Component,OnInit,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Optim } from './optim';
import { Scenario } from '../scenario/scenario';
import { OptimService } from './optim.service';

@Component({
  templateUrl: './optim-modal.restore.html'
})
export class OptimModalRestore implements OnInit{

  @Input('filters') filters:{
    timeSlotId:string,
    calendarDt:number,
    scenarioMain:Scenario
  };

  // The considered timeslot id and scenario main id
  optims : Optim[];

  //The selected optimization
  selectedOptim : Optim;

  constructor(public activeModal: NgbActiveModal,public optimService :OptimService) {

  }

  /**
   * Called when the input data is completely received
   */
  ngOnInit() {
    this.optimService.list({
        search:"",
        descendingOrder:true,
        status_code:"FINISHED",
        scenarioMainId:this.filters.scenarioMain.id,
        timeSlotId:this.filters.timeSlotId,
        calendarDt:this.filters.calendarDt,
        nbDays:null
      }).subscribe((optims)=>{
        this.optims = optims;
      })
  }

  validate(){
    this.activeModal.close(this.selectedOptim);
  }

}