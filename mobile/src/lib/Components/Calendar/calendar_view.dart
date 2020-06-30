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
import 'package:nomad_mobile_driver/Components/Calendar/calendar_ctrl.dart';
import 'package:nomad_mobile_driver/Components/route_list/route_list_ctrl.dart';
import 'package:provider/provider.dart';
import 'calendar_cell.dart';


class Calendar extends StatelessWidget {

  final weekOffset;

  Calendar({this.weekOffset});

@override
  Widget build(BuildContext context) {
    return Container(
      child: ChangeNotifierProvider<CalendarCtrl>(
        builder: (_) => CalendarCtrl(),
        child: CalendarView(margin: EdgeInsets.only(left:2),weekOffset: this.weekOffset)
      )
    );
  }
}

class CalendarView extends StatelessWidget {
  final EdgeInsets margin;
  final List<String> week = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM","DIM"];
  final List arrayDay = [];
  final weekOffset;
  
  CalendarView({this.margin,this.weekOffset});

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

    final routeListModel = Provider.of<RouteListCtrl>(context);

    DateTime refDt = DateTime.now();

    if(weekOffset!=0){
      refDt = refDt.add(Duration(days: weekOffset*7));
    }

    int element = refDt.day - refDt.weekday +1;

    int totalDay = totaldays(refDt.month);
    for (var i = 0; i < 7; i++) {
      if (element > totalDay) element = 1;
      arrayDay.add(element);
      element++;
    }
    var i = -1;
    return (
      new Container(
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
      child: 
      new Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: week.map((String week) {
            ++i;
            final currentI = i;
            return InkWell(
              child: CalendarCell(
                week: week,
                day: arrayDay[i].toString(),
                today: arrayDay[i] != routeListModel.dt.day ? false : true
              ),
              onTap: (){
                DateTime dt = DateTime(refDt.year,refDt.month,arrayDay[currentI]);
                routeListModel.setDate(dt);
              },
            );
          }).toList()),
    ));
  }
}
