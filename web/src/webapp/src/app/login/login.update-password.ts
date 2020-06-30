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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { UserService } from '../user/user.service';
import { User } from '../user/user';
import { AlertService } from '../alert/alert.service';
import {NavbarService} from '../navbar/navbar.service';

@Component({templateUrl: 'login.update-password.html'})
export class LoginUpdatePassword implements OnInit {
    updatePasswordForm: FormGroup;
    loading = false;
    submitted = false;
    returnUrl: string;
    user : User

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private userService: UserService,
        private alertService: AlertService,
        private navbarService: NavbarService) {
          this.user=new User();
        }

    ngOnInit() {
        this.updatePasswordForm = this.formBuilder.group({
            password: ['', Validators.required]
        });

        // If session is started, User Id is available in localStorage
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.user_main_id) {
          this.userService
              .get(currentUser.user_main_id)
              .subscribe((user: User) => {
                this.user = user;
              });
        }else{
          // Need to login first
          this.router.navigateByUrl('/login');
        }


        // get return url from route parameters or default to '/'
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    }

    // convenience getter for easy access to form fields
    get f() { return this.updatePasswordForm.controls; }

    onSubmit() {
      this.submitted = true;

      // stop here if form is invalid
      if (this.updatePasswordForm.invalid) {
          return;
      }

      this.loading = true;
      this.user.passwd = this.f.password.value;
      this.userService.updatePassword(this.user)
        .pipe(first())
        .subscribe(
          result => {
            if(result["result"]){
              this.navbarService.sendMessage({bNavigationAllowed:true});
              this.router.navigate([this.returnUrl]);
            }else{
              this.alertService.error("Veuillez renseigner un mot de passe valide.");
              this.loading = false;
            }
          });
    }
}