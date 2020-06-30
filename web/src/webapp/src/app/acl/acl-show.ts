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

import { Directive, ElementRef,Input,Renderer,OnInit } from '@angular/core';

import { AclActionService } from './acl-action.service';
import { CrudResult } from '../helpers/crud-result';

@Directive({
  selector: '[aclShow]'
})
export class AclShowDirective implements OnInit {

  @Input("aclShow") action: string;

  // Whether to use visibility:hidden (default) or display:none to hide an element
  // To use display:none, pass aclShowMode to 'display'
  // In that case, when revealed, an html element will be displayed with display:block
  @Input("aclShowMode") showMode: string;

  // When set to true, reveal elements when we do NOT have the acl (default value is false)
  @Input("aclShowReverse") bReverseMode: boolean;

  // When aclShowMode == 'display, indicate the type of display (block by default)
  @Input("aclShowDisplay") display: string;

  constructor(private el: ElementRef,
              private renderer: Renderer,
              private aclService: AclActionService) {
  }

  ngOnInit() {
    if(this.showMode == "display"){
      this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
    }
    else{
      this.renderer.setElementStyle(this.el.nativeElement, 'visibility', 'hidden');
    }    
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if(currentUser){
      this.aclService.userHasAccess(currentUser.user_main_id,this.action).subscribe(
        (response: CrudResult) => {
          var bShow = response.data;
          // In case response.data is not defined, do not display
          // In case response.data is defined and reverse mode is active, apply reverse mode
          if(response.data!=undefined && this.bReverseMode){
            bShow=!bShow;
          }
          if(bShow){
            if(this.showMode == "display"){
              if(this.display === undefined){
                this.renderer.setElementStyle(this.el.nativeElement, 'display', 'block');
              }
              else{
                this.renderer.setElementStyle(this.el.nativeElement, 'display', this.display);
              }
            }
            else{
              this.renderer.setElementStyle(this.el.nativeElement, 'visibility', 'visible');
            }             
          }
        },
        error => {
          // In case of error, for instance 403, element is hidden
          this.renderer.setElementStyle(this.el.nativeElement, 'display', 'none');
        }
      );
    }
  }
}