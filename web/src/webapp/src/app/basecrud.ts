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

import { EventEmitter } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { BaseCrudService } from './basecrud.service';
import { BaseRecord } from './baserecord';
import { ThesaurusItem } from './thesaurus/thesaurus';
import { ThesaurusService } from './thesaurus/thesaurus.service';
import { CrudSaveResult,RestResult } from './helpers/crud-result';

/**
 Class to be extended by Crud Components
**/

export class BaseCrud {

  public currentRecord : BaseRecord;

  // Edit Mode could be set tp 'view' or 'edit'
  public editMode : string;

  // Cache of the known thesaurus categories
  public thesaurusCatOF : Observable<ThesaurusItem[]>[];

  protected dataLoaded : EventEmitter<BaseRecord>;

  // Child instance will inject there inherited data service
  constructor(
    protected crudService : BaseCrudService,
    private thesaurusService : ThesaurusService,
    protected router: Router
    ) {
    this.currentRecord = this.crudService.createRecord();
    this.thesaurusCatOF = [];
    this.dataLoaded = new EventEmitter<BaseRecord>();
  }

  // Called by child NgOnInit function
  // Set to "" to add a new record
  public init(recordId : string){
    if(recordId!="" && recordId!=undefined){
      this.editMode = "view";
      this.crudService.get(recordId).subscribe(record => {
        this.currentRecord = record;
        this.dataLoaded.emit(this.currentRecord);
      });
    }
    else{
      this.editMode = "edit";
    }
  }

  // Called by crudNavbar Component
  public editModeChange(event){
    this.editMode = event.value;
    if(this.editMode=="view"){
      // Reload data
      this.init(this.currentRecord.id)
    }
  }

  // Gather the data that will be sent to server for update or insert
  public checkData(){}

  // Insert or update currentRecord
  public save(bReload = true) : Observable<CrudSaveResult>{
    this.checkData();
    var ofSave = this.crudService.save(this.currentRecord);

    ofSave.subscribe(response => {
      // Reload and get back to view mode
      if(response.result==RestResult.Ok && bReload){
        this.init(response.data.id);
      }
    });

    return ofSave;
  }

  // Called by crudNavbar Component
  public markAsRemoved(){
    this.crudService.markAsRemoved(this.currentRecord).subscribe(result => {
      // Redirection to the list page corresponding to the crud page
      var pathToList = this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
      this.router.navigate([pathToList]);
    })
  }

  // Called by crudNavbar Component
  public delete(){
    this.crudService.delete(this.currentRecord).subscribe(result => {
      // Redirection to the list page corresponding to the crud page
      var pathToList = this.router.url.replace(/crud(\/[0-9a-zA-Z-]*)?$/i, "list");
      this.router.navigate([pathToList]);
    })
  }

  // Get thesaurus entries
  public th(cat) : Observable<ThesaurusItem[]>{
    if(!this.thesaurusCatOF[cat]){
      this.thesaurusCatOF[cat] = this.thesaurusService.list({cat:cat});
    }
    return this.thesaurusCatOF[cat];
  }

}