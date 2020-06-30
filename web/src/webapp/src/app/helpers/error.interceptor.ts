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
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import {Router} from '@angular/router';

import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthenticationService } from '../login/authentication.service';
import { AlertService } from '../alert/alert.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService,
              private alertservice: AlertService,
              private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(err => {
      //console.log("err",err);
      switch(err.status){
        case 401:
          // auto logout if 401 response returned from api
          this.authenticationService.logout();
          this.alertservice.error("Veuillez vous connecter.");
          this.router.navigateByUrl('/login');
          break;
        case 403:
          this.alertservice.error("Vous n'avez pas accès à la ressource demandée.");
          break;
        case 500:
          switch(err.error.errorCode){
            // See BaseObject class on server side for the declaration of custom codes
            case 101:
              this.alertservice.error("La référence fournie est déjà utilisée. Merci d'en choisir une autre.");
              break;
            case 102:
              this.alertservice.error("L'enregistrement des données a échoué. Votre administrateur a été notifié.");
              break;
            case 103:
              this.alertservice.error("L'optimisation a échoué.");
              break;
            case 104:
              this.alertservice.error("Le mode de transport n'a pas été renseigné pour l'un des usagers.");
              break;
            case 105:
              this.alertservice.error("Aucun véhicule renseigné.");
              break;
            case 106:
              this.alertservice.error("Merci de choisir au moins un véhicule pouvant transporter des usagers marchants.");
              break;
            case 107:
              this.alertservice.error("Merci de choisir au moins un véhicule pouvant transporter des usagers en fauteuil roulant.");
              break;
            case 108:
              this.alertservice.error("Le serveur d'optimisation est injoignable.");
              break;
            case 109:
              this.alertservice.error(err.error.errorMessage);
              break;
            case 110:
              this.alertservice.error(err.error.errorMessage);
              break;
            case 111:
              this.alertservice.error("Durée de montée non définie pour certains usagers.");
              break;
            case 112:
              this.alertservice.error("Durée de descente non définie pour certains usagers.");
              break;
            case 113:
              this.alertservice.error("Impossible de démarrer le calcul des matrices de distance et de temps.");
              break;
            case 120:
              this.alertservice.error("Les données fournies en entrée ne sont pas valides. Détails : "+err.error.errorMessage);
              break;
            default:
              this.alertservice.error("Une erreur interne est survenue. Votre administrateur a été notifié.");
              break;
          }
          break;
        default:
          break;
      }
      const error = err.error.message || err.statusText;
      return throwError(error);
    }));
  }
}