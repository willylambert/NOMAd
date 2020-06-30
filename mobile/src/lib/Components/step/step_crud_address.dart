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
  import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';

  class StepCrudAddress extends StatelessWidget {
    final RouteProgressionStep step;
    StepCrudAddress({this.step});
    @override
    Widget build(BuildContext context) {

      Icon getStepIcon(RouteStepType type){
        switch(type){
          case RouteStepType.driver : 
            return Icon(Icons.directions_bus);
          case RouteStepType.institution :
            return Icon(Icons.location_city);
          case RouteStepType.walker :
            return Icon(Icons.directions_walk);
          case RouteStepType.wheelchair :
            return Icon(Icons.accessible);
        }
      }

      return (
        Padding(
          padding: const EdgeInsets.all(5),
          child:
          Container(
              alignment: FractionalOffset.center,
              decoration:  BoxDecoration(
                color: const Color.fromRGBO(162, 146, 199, 0.8),
                borderRadius:  BorderRadius.all(const Radius.circular(5.0)),
              ),
              child:  Row(
                children: <Widget>[
                  Container(
                      margin:  EdgeInsets.only(
                          left: 20.0, top: 10.0, bottom: 10.0, right: 20.0),
                      width: 50.0,
                      height: 50.0,
                      child: getStepIcon(step.type),
                      ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        step.poi.addr1 ?? "",
                        style:
                            TextStyle(fontSize: 18.0, fontWeight: FontWeight.w500),
                      ),
                      Text(
                        step.poi.addr2 ?? "",
                        style:
                            TextStyle(fontSize: 18.0, fontWeight: FontWeight.w500),
                      ),
                      Padding(
                        padding:  EdgeInsets.only(top: 5.0),
                        child:  Text(
                          step.poi.city ?? "",
                          style:  TextStyle(
                              color: Colors.black,
                              fontSize: 18.0,
                              fontWeight: FontWeight.w300),
                        ),
                      )
                    ],
                  )
                ],
              ),
            ))
      );
    }
  }
