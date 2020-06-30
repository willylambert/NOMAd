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

class CalendarCell extends StatelessWidget {
  final String week;
  final String day;
  final bool today;
  CalendarCell({this.week, this.day, this.today});
  @override
  Widget build(BuildContext context) {
    return (new Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        new Text(
          week,
          style: new TextStyle(
              color: const Color.fromRGBO(204, 204, 204, 1.0),
              fontSize: 12.0,
              fontWeight: FontWeight.w400),
        ),
        new Padding(
          padding: new EdgeInsets.only(top: 10.0, bottom: 5.0),
          child: new Container(
              width: 35.0,
              height: 35.0,
              alignment: Alignment.center,
              decoration: new BoxDecoration(
                  shape: BoxShape.circle,
                  color: today
                      ? const Color.fromRGBO(204, 204, 204, 0.3)
                      : Colors.transparent),
              child: new Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  new Text(
                    day,
                    style: new TextStyle(
                        fontSize: 12.0, fontWeight: FontWeight.w400),
                  ),
                  today
                      ? new Container(
                          padding: new EdgeInsets.only(top: 3.0),
                          width: 3.0,
                          height: 3.0,
                          decoration: new BoxDecoration(
                              shape: BoxShape.circle,
                              color: const Color.fromRGBO(247, 64, 106, 1.0)),
                        )
                      : new Container()
                ],
              )),
        )
      ],
    ));
  }
}
