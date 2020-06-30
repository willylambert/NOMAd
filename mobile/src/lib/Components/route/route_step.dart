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
import 'package:intl/intl.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression.dart';
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';

class RouteStep extends StatelessWidget {
  final EdgeInsets margin;
  final double width;
  final String title;
  final String subtitle;
  final RouteProgressionStep step;
  final RouteProgression routeProgression;
  RouteStep({this.margin, this.subtitle, this.title, this.width, this.step,this.routeProgression});

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

  @override
  Widget build(BuildContext context) {
    return ( Container(
      alignment: Alignment.center,
      margin: margin,
      width: width,
      decoration:  BoxDecoration(
        color: Colors.white,
        border:  Border(
          top:  BorderSide(
              width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
          bottom:  BorderSide(
              width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
        ),
      ),
      child:  Row(
        children: <Widget>[
           Container(
              margin:  EdgeInsets.only(
                  left: 20.0, top: 10.0, bottom: 10.0, right: 20.0),
              width: 20.0,
              height: 50.0,
              child: getStepIcon(step.type),
              ),
           Expanded(
            child:
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    title ?? "",
                    style:
                        TextStyle(fontSize: 18.0, fontWeight: FontWeight.w400),
                  ),
                  Padding(
                    padding:  EdgeInsets.only(top: 5.0),
                    child:  
                      Text(
                      step.poi.addr1 ?? "" + (step.poi.addr2 ?? "" !=""?", ":"") + step.poi.addr2 ?? "" + ", " + step.poi.city ?? "",
                      softWrap: true,
                      style:  TextStyle(
                          color: Colors.grey[700],
                          fontSize: 14.0,
                          fontWeight: FontWeight.w300),
                    ),
                  )
                ],
              ),
           ),
             Container(
               margin: EdgeInsets.only(right: 10),
               child:
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,                
                  children: <Widget>[
                    routeProgression.isServiceStarted
                    ? Text( (step.arrivalDuration!=null?(step.arrivalDuration/60).round().toString() + " min.":"--"),
                      style:
                          TextStyle(fontSize: 18.0, fontWeight: FontWeight.w400),
                      )
                    : Container(),
                    Padding(
                      padding:  EdgeInsets.only(top: 5.0),
                      child:  Text(
                        DateFormat.Hm().format( routeProgression.isServiceStarted?step.arrivalTime:step.targetTime),
                        style:  TextStyle(
                            color: Color.fromRGBO(25, 43, 63, 0.9),
                            fontSize: 20.0,
                            fontWeight: FontWeight.w300),
                      ),
                    )
                  ],
                )
             )
        ],
      ),
    ));
  }
}
