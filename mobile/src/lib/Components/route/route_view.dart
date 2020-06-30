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
import 'package:nomad_mobile_driver/Components/route/poi.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';
import 'package:nomad_mobile_driver/Components/route/route_actions.dart';
import 'package:nomad_mobile_driver/Components/route/route_content.dart';
import 'package:nomad_mobile_driver/Components/route/route_ctrl.dart';
import 'package:nomad_mobile_driver/Components/route/route_start_service.dart';
import 'package:nomad_mobile_driver/Components/route/route_step_visited.dart';
import 'package:provider/provider.dart';

class NomadRoute extends StatelessWidget {
@override
  Widget build(BuildContext context) {

    return Container(
      child: ChangeNotifierProvider<RouteCtrl>(
        builder: (_) => RouteCtrl(context),
        child: RouteViewScaffold()
      )
    );
  }
}

class RouteViewScaffold extends StatelessWidget{
@override
  Widget build(BuildContext context) {
    final routeModel = Provider.of<RouteCtrl>(context);

    return Scaffold(
                appBar: AppBar(
                  backgroundColor: Color.fromRGBO(25, 43, 63, 0.9),
                  title: Text("Feuille de route " + routeModel.route.dt.day.toString() + "/" + routeModel.route.dt.month.toString(), style: TextStyle(color: Colors.white)),
                ),
                body:RouteView()
                ,
            floatingActionButton: RouteActions(),
        );
  }
}

class RouteView extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final routeModel = Provider.of<RouteCtrl>(context);
    routeModel.setContext(context);

    return               
              Column(                    
                    children: <Widget>[
                      !routeModel.routeProgression.isServiceStarted && routeModel.nbRemainingSteps!=0
                      ? routeModel.bLoadingDirection
                        ? Padding(padding:EdgeInsets.all(5) , child:Center(child:CircularProgressIndicator()))
                        : RouteStartService(onTap: routeModel.startService,
                                                color: Color.fromRGBO(69, 176, 115, 1.0),
                                                label:"Débuter le circuit",
                                                icon:Icon(Icons.play_arrow,color: Colors.white,))
                      : Container(),
                      routeModel.routeProgression.isServiceStarted && routeModel.nbRemainingSteps==0 && routeModel.route.endedDt==null
                      ? RouteStartService(onTap: routeModel.endService,
                                              color: Color.fromRGBO(238, 98, 55, 1.0),
                                              label:"Terminer le circuit",
                                              icon:Icon(Icons.stop,color: Colors.white,))
                      : Container(),

                      routeModel.routeProgression.isServiceStarted 
                        ? RouteStepVisited(title: "Circuit demarré ",subtitle: "", step:RouteProgressionStep(poi:Poi(visitedDt:routeModel.route.startedDt,visitMissing:false))) 
                        : Container(),

                      Expanded(
                        child:
                          RouteViewContent(),
                      )
                    ]
              );
  }
  
}