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
import { faWrench } from '@fortawesome/free-solid-svg-icons';
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons';
import { faHandPointer } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'route-toolbar',
  templateUrl: './route-toolbar.html',
  styleUrls: ['./route-toolbar.css']
})

/**
 * Toolbar that can be displayed anywhere, for instance on top of the map
 */
export class RouteToolbar{

  // The route toolbar options, that are declared in the parent component
  @Input('options') options: RouteToolbarOptions;

  // Enable to warn including scope that the multiple selection was enabled or disabled
  @Output() multiselectChange = new EventEmitter();

  faWrench = faWrench;
  faDrawPolygon = faDrawPolygon;
  faHandPointer = faHandPointer;
  faCheck = faCheck;
  faTimes = faTimes;

  constructor() {}

  /**
   * To be called in case the multiple selection toggling button is being clicked
   */
  toggleMultipleSelect(){
    this.multiselectChange.emit();
  }
}

/**
 * The existing options for the route toolbar
 */
export class RouteToolbarOptions{
  multipleSelect:boolean;
  select:boolean;
  unselect:boolean;
  show:boolean;
  // Whether the toolbar is for a route map or not
  inRouteMap:boolean;
}

import { Directive, ElementRef,HostListener ,AfterViewInit  } from '@angular/core';

@Directive({
  selector: '[route-toolbar-position]'
})
export class RouteToolbarPosition implements AfterViewInit  {

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    // Compute the total height of the bars that are displayed at the top of the map
    var aboveMapHeight = this.el.nativeElement.getBoundingClientRect().top-parseFloat(this.el.nativeElement.style.top);
    // Compute the new top position for the toolbar
    this.el.nativeElement.style.top = window.innerHeight - aboveMapHeight - 90 + "px";
  }

  constructor(private el: ElementRef) {
  }

  ngAfterViewInit () {
    // Compute the total height of the bars that are displayed at the top of the map
    var aboveMapHeight = this.el.nativeElement.getBoundingClientRect().top;
    // Compute the new top position for the toolbar
    this.el.nativeElement.style.top = window.innerHeight - aboveMapHeight - 90 + "px";
    this.el.nativeElement.classList.add("route-toolbar-position");
  }
}