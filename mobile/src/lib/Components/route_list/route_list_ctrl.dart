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

import 'package:f_logs/f_logs.dart';
import 'package:intl/intl.dart';

import 'package:nomad_mobile_driver/Components/login/login_service.dart';
import 'package:nomad_mobile_driver/Components/route/route.dart';
import 'package:nomad_mobile_driver/Components/route/route_service.dart';
import 'package:nomad_mobile_driver/base_ctrl.dart';

import '../nomad_exception.dart';

class RouteListCtrl extends BaseCtrl {
  
  RouteService _routeService = RouteService();

  List<DriverRoute> routes;

  DateTime dt = DateTime.now();

  RouteListCtrl(){
    loadData();
  }
  
  setDate(DateTime dt){
    this.dt = dt;
    this.loadData();
  }

  // Load routes from server
  void loadData() async {

    FLog.info(text: "Load Data");
    var routeResponse;
    
    try{
      routeResponse = await _routeService.getRoutes(userMainId: LoginService.driverHrId,dt: this.dt);
      FLog.info(text: routeResponse.routes.length.toString() + " routes found");
      if(routeResponse.routes.length==0){
        this.addInfo("Aucun circuit associée au " + this.dt.day.toString() + "/" + this.dt.month.toString() );
      }
      routes = routeResponse.routes;
    } on NomadException catch(e){
      this.addError(e.errMsg);
    }

    notifyListeners();
  }

  int weekNumber(DateTime date) {
    int dayOfYear = int.parse(DateFormat("D").format(date));
    return ((dayOfYear - date.weekday + 10) / 7).floor();
  }

}