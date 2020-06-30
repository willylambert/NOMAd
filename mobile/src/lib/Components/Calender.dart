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
import 'CalenderCell.dart';

class Calender extends StatelessWidget {
  final EdgeInsets margin;
  final List<String> week = ["DIM", "LUN", "MAR", "MER", "JEU", "VEN", "SAM"];
  final List arrayDay = [];
  Calender({this.margin});

  int totaldays(int month) {
    if (month == 2)
      return (28);
    else if (month == 4 || month == 6 || month == 9 || month == 11)
      return (30);
    else
      return (31);
  }

  @override
  Widget build(BuildContext context) {
    int element = new DateTime.now().day - new DateTime.now().weekday;
    int totalDay = totaldays(new DateTime.now().month);
    for (var i = 0; i < 7; i++) {
      if (element > totalDay) element = 1;
      arrayDay.add(element);
      element++;
    }
    var i = -1;
    return (new Container(
      margin: margin,
      alignment: Alignment.center,
      padding: new EdgeInsets.only(top: 20.0),
      decoration: new BoxDecoration(
        color: Colors.white,
        border: new Border(
          bottom: new BorderSide(
              width: 1.0, color: const Color.fromRGBO(204, 204, 204, 1.0)),
        ),
      ),
      child: new Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: week.map((String week) {
            ++i;
            return new CalenderCell(
                week: week,
                day: arrayDay[i].toString(),
                today: arrayDay[i] != new DateTime.now().day ? false : true);
          }).toList()),
    ));
  }
}
