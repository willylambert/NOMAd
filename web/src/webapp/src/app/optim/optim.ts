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

import { BaseRecord } from '../baserecord';
import { Route } from '../route/route';

export class Optim extends BaseRecord{

  code: string;
  label: string;

  instance: any;
  parameters: any;
  start_dt : number;
  last_solution_dt : number;
  solution: any;
  cost: number;
  errors:string;
  // In case we want to separate errors from warnings, we use real_errors
  //  This is an objet representing a json, likely to contain a "type", "message" and "details" fields
  real_errors:any;
  logs:string;
  status_th:string;
  status_code:string;
  status_label:string;

  calendar_dt: number;

  constructor() {
    super()
  }
}

export class OptimOptions{
  // Name of the router in use for optimization
  router:string;
  // Parameters of the optimization (some existing parameters are not listed below)
  timeLimit:number;

  optimMode:string; // 'cost' or 'regularity'

  initialSolutionDt: number; // initial solution
  initialSolutionRoutes: Route[];

  regularityRange: number; // if optimMode : 'regularity', range in minutes
}