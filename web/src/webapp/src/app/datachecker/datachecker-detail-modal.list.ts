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
import { faChevronLeft,faWheelchair,faClock,faShuttleVan } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


import { DataCheckerDetailService } from './datachecker-detail.service';
import { DataCheckerDetail } from './datachecker-detail';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { ThesaurusItem } from '../thesaurus/thesaurus';

@Component({
  templateUrl: './datachecker-detail-modal.list.html',
})
export class DataCheckerDetailModalList implements OnInit {

  /**
   * A list of errors to be displayed in the modal
   */
  @Input('dataCheckerDetails') dataCheckerDetails: DataCheckerDetail[];

  /**
   * A filter to apply to the list of errors to limit the scope
   */
  @Input('dataCheckerScopeId') dataCheckerScopeId: string;

  /**
   * A filter to apply to the list of errors to limit the level
   */
  @Input('dataCheckerLevelId') dataCheckerLevelId: string;
  
  dataCheckerScopeCode: string;
  dataCheckerLevelCode: string;

  faWheelchair = faWheelchair;
  faClock = faClock;
  faShuttleVan= faShuttleVan; 

  constructor(private dataCheckerDetailService:DataCheckerDetailService,
              public activeModal: NgbActiveModal,
              public thesaurusService:ThesaurusService) {
  }

  ngOnInit() {
    this.thesaurusService.get(this.dataCheckerScopeId).subscribe(thesaurusItem=>{
      this.dataCheckerScopeCode=thesaurusItem.code
    })
    this.thesaurusService.get(this.dataCheckerLevelId).subscribe(thesaurusItem=>{
      this.dataCheckerLevelCode=thesaurusItem.code
    })    
    
  }

}