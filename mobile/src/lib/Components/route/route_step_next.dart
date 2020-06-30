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
import 'package:nomad_mobile_driver/Components/route/route_progression_step.dart';

class RouteStepNext extends StatelessWidget {
  final EdgeInsets margin;
  final double width;
  final String title;
  final String subtitle;
  final RouteProgressionStep step;
  RouteStepNext({this.margin, this.subtitle, this.title, this.width, this.step});

  Icon getStepIcon(RouteStepType type){
    switch(type){
      case RouteStepType.driver : 
        return Icon(Icons.directions_bus,color: Colors.white);
      case RouteStepType.institution :
        return Icon(Icons.location_city,color: Colors.white);
      case RouteStepType.walker :
        return Icon(Icons.directions_walk,color: Colors.white);
      case RouteStepType.wheelchair :
        return Icon(Icons.accessible,color: Colors.white);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ( 
      Container(
      alignment: Alignment.center,
      margin: EdgeInsets.all(5),
      width: width,
      decoration: new BoxDecoration(
        color : Colors.green,
        borderRadius:  BorderRadius.all(const Radius.circular(5.0)),
      ),
      child: 
        Column(
          children:[
            Row(
              children:[
                Container(
                  child:Text(" Prochain arrêt ",style:TextStyle(color:Colors.white)),
                  decoration: BoxDecoration(
                    color : Colors.green,
                    borderRadius:  BorderRadius.all(const Radius.circular(5.0)),
                  )
                ),
                Expanded(child: 
                  Container(
                    color: Colors.white,
                    child: 
                          step.getAheadDuration().inMinutes<0
                          ? Text("Retard estimé à " + (-step.getAheadDuration().inMinutes).toString() + " min.", style: TextStyle(color: Color.fromRGBO(250, 80, 80, 1),fontWeight: FontWeight.w900,fontSize: 20))
                          : Text("Avance estimée à " + step.getAheadDuration().inMinutes.toString() + " min.",style: TextStyle(color: Colors.green,fontWeight: FontWeight.w900,fontSize: 20)),
                      alignment: Alignment.centerRight,
                    )
                  )
                ]
            ),
            Row(
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
                      overflow: TextOverflow.ellipsis,
                      style:
                          TextStyle(fontSize: 18.0, fontWeight: FontWeight.w400,color: Colors.white),
                    ),
                    Padding(
                      padding:  EdgeInsets.only(top: 5.0),
                      child:  Text(
                        subtitle ?? "",
                        style:  TextStyle(
                            color: Colors.white,
                            fontSize: 14.0,
                            fontWeight: FontWeight.w300),
                      ),
                    )
                  ],
                )
              ),
                Container(
                  margin: EdgeInsets.only(right: 10),
                  child:
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,                
                      children: <Widget>[
                        Text( (step.arrivalDuration/60).round().toString() + " min.",
                          style:
                              TextStyle(fontSize: 18.0, fontWeight: FontWeight.w700,color: Colors.white),
                        ),
                        Padding(
                          padding:  EdgeInsets.only(top: 5.0),
                          child:  Text(
                            DateFormat.Hm().format(step.arrivalTime),
                            style:  TextStyle(
                                color: Colors.white,
                                fontSize: 20.0,
                                fontWeight: FontWeight.w300),
                          ),
                        )
                      ],
                    )
                )
            ],
          ),
        ] 
      )
    ));
  }
}
