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

import { Component, Input, OnInit,OnDestroy } from '@angular/core';
import {Router} from '@angular/router';

import { User } from '../user/user';
import { UserService } from '../user/user.service';
import { AuthenticationService } from "../login/authentication.service";
import { NavbarService } from "./navbar.service";

import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit,OnDestroy {

  subscription: Subscription;

  public user: User;
  public bNavigationAllowed:boolean;
  faPowerOff = faPowerOff;

  private authSubscription: Subscription;

  public appVersion: String;

  constructor(private userService: UserService,
              public authenticationService: AuthenticationService,
              private navbarService: NavbarService,
              private router: Router) {
    this.user = new User();
    this.bNavigationAllowed = false;

    // Listen to messages coming from main components
    this.subscription = this.navbarService.getMessage().subscribe(message => {
      this.bNavigationAllowed = message.bNavigationAllowed;
    });

    // Listen to message comming from login / logout functions
    this.authSubscription = authenticationService.getState().subscribe(authResult => {
      this.updateUserInfo();
    });
  }

  ngOnInit() {
    this.updateUserInfo();
  }

  private updateUserInfo(){
    // If session is started, User Id is available in localStorage
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser && currentUser.user_main_id) {
      this.appVersion = currentUser.app_version;
      this.userService
          .get(currentUser.user_main_id)
          .subscribe((user: User) => {
            this.user = user;
            this.bNavigationAllowed = (this.user.lastconnection_dt != null && this.user.lastconnection_dt != undefined);
            if( !this.bNavigationAllowed ){
              this.router.navigateByUrl('/login/update-password');
            }
          });
    }else{
      // Need to login first
      this.user=new User();
      this.router.navigateByUrl('/login');
    }
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.authSubscription.unsubscribe();
    this.subscription.unsubscribe();
  }


}
