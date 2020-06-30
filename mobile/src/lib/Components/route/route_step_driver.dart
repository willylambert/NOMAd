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

class RouteStepDriver extends StatelessWidget {
  final String title;
  final String subtitle;
  RouteStepDriver({this.subtitle, this.title});

  @override
  Widget build(BuildContext context) {
    return (new Container(
      alignment: Alignment.center,
      decoration: new BoxDecoration(
        color: Colors.white,
        border: new Border(
          top: new BorderSide(
              width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
          bottom: new BorderSide(
              width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
        ),
      ),
      child: 
        Container(
          margin: EdgeInsets.only(top:20,bottom: 20),
          decoration: new BoxDecoration(
            color : Color.fromRGBO(162, 146, 199, 0.8),
          ),
          child:
            new Row(        
              children: <Widget>[          
                new Container(
                    margin: new EdgeInsets.only(
                        left: 20.0, top: 10.0, bottom: 10.0, right: 20.0),
                    width: 60.0,
                    height: 20.0,
                    child: Icon(Icons.location_on),
                    ),
                new Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    new Text(
                      title ?? "",
                      style:
                          new TextStyle(fontSize: 18.0, fontWeight: FontWeight.w400),
                    ),
                    new Padding(
                      padding: new EdgeInsets.only(top: 5.0),
                      child: new Text(
                        subtitle ?? "",
                        style: new TextStyle(
                            color: Colors.white,
                            fontSize: 14.0,
                            fontWeight: FontWeight.w300),
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
    ));
  }
}
