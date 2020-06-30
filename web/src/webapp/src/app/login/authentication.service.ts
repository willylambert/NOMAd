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

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from '@angular/router';
import { Subject,Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {

  private authState = new Subject<any>();


  constructor(private http: HttpClient,
              private router: Router) { }

  /**
  * Start session, save session token in localStorage
  **/
  login(login: string, password: string) {

    return this.http.post<any>(environment.restURL+"login", { login: login, password: password })
      .pipe(map(result => {
        // login successful if there's a session token in the response
        if (result && result.user_session_id) {
          // store user details and session token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(result));
        }
        this.authState.next(result);
      return result;
    }));
  }

  getState(): Observable<any> {
    return this.authState.asObservable();
  }

  /**
  * End session, remove session token from localStorage and redirect to login page
  **/
  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    this.authState.next();
    this.router.navigateByUrl('/login');

  }
}