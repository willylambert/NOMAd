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

import 'package:flutter/material.dart';
import 'package:nomad_mobile_driver/Components/route/route_ctrl.dart';
import 'package:nomad_mobile_driver/Components/route/route_step.dart';
import 'package:nomad_mobile_driver/Components/route/route_step_next.dart';
import 'package:nomad_mobile_driver/Components/route/route_step_visited.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';
import 'package:provider/provider.dart';

class RouteViewContent extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final routeListModel = Provider.of<RouteCtrl>(context);
    return (
      routeListModel.route != null 
      ? ListView.builder(
        shrinkWrap: true,
        itemCount: routeListModel.routeProgression.steps.length,
        itemBuilder: (BuildContext context, int index){
          
          RouteProgressionStep step;
          Widget stepWidget;

          step = routeListModel.routeProgression.steps.elementAt(index);
          
          String title;
          if(step.poi.siteTypeCode=="HOME"){
            title = step.poi.firstname + " " + step.poi.lastname;
          }else{
            title = step.poi.label;
          }
          if(step.poi.visitedDt!=null){
            stepWidget = RouteStepVisited(title:title,subtitle: step.poi.addr1,step: step);
          }else{
            if(step.isNextStep && routeListModel.routeProgression.isServiceStarted){
              stepWidget = RouteStepNext(title:title,subtitle: step.poi.addr1,step: step);
            }else{
              stepWidget = RouteStep(title:title,subtitle: step.poi.addr1,step: step,routeProgression: routeListModel.routeProgression);
            }
          }

          // Catch tap on widget
          return InkWell(
            child: stepWidget,
            onTap: () async {
              await Navigator.pushNamed(context, '/step-crud',arguments: {"step":step,"route":routeListModel.route});
              // Wait the return from step-crud view to update waypoints and refresh route
              routeListModel.updateDriverProgression();
            },
          );

        })
      : Container()
      );
  }
}