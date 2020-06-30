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

import {Component,Input,Output,EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'list-navbar',
  templateUrl: './list-navbar.html',
  styleUrls: ['./list-navbar.css']
})
export class ListNavbar{

  @Input('title') title: string;

  // The search filter can be preset from the component that includes the navbar
  @Input('searchFilter') searchFilter: string;

  // Used to check ACL right to new item button
  @Input('aclObject') aclObject: string;

  @Output() searchEvent = new EventEmitter();

  // This attribute will store the path to the Crud menu corresponding to the current list menu
  public pathToNew : string;

  // TODO : replace by a smarter debounce using some rxjs functions like debounceTime
  // Temporary handler for debounce function, to be replaced by some rxjs functions like debounceTime
  debounceCounter : number;

  constructor(
    protected router: Router) {
      // Compute the path to crud menu assuming a url ending with "list"
      this.pathToNew = router.url.replace(/list$/i, "crud");
      this.debounceCounter=0;
  }

  /**
   * Reemits the caught key up event after taking into account a 500 ms debounce effect
   * @param event
   */
  onSearchChange(event:any ) {
    this.debounceCounter++;
    var that=this;
    setTimeout(function(){
      that.debounceCounter--;
      if(that.debounceCounter==0){
        that.searchEvent.emit({value:that.searchFilter});
      }
    },500);
  }

}