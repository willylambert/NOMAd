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
import 'package:flutter/material.dart';
import 'package:flutter_swiper/flutter_swiper.dart';
import 'package:nomad_mobile_driver/Components/Calendar/calendar_view.dart';
import 'package:nomad_mobile_driver/Components/route/route_actions.dart';
import 'package:nomad_mobile_driver/Components/route_list/route_list_ctrl.dart';
import 'package:nomad_mobile_driver/Components/route_list/route_list_item.dart';
import 'package:provider/provider.dart';

class RouteList extends StatelessWidget {
@override
  Widget build(BuildContext context) {
    return Scaffold(
            appBar: AppBar(
              backgroundColor: Color.fromRGBO(25, 43, 63, 0.9),
              title: Text("Feuille de route", style: TextStyle(color: Colors.white),),
            ),
            body: ChangeNotifierProvider<RouteListCtrl>(
              builder: (_) => RouteListCtrl(),
              child: RouteListView()
            ),
            floatingActionButton: RouteActions()
    );
  }
}

class RouteListView extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final routeListModel = Provider.of<RouteListCtrl>(context);
    routeListModel.setContext(context);

    final currentWeekOffset = routeListModel.weekNumber(routeListModel.dt)-routeListModel.weekNumber(DateTime.now());
    FLog.info(text:"Weekoffset:"+currentWeekOffset.toString());
    return            
        Column(                    
              children: <Widget>[
                SizedBox(
                  height: 85,
                  child: 
                Swiper(
                  itemBuilder: (BuildContext context,int index){
                    final weekOffset = index-2; // 2 weeks in the past, 2 in the future
                    return Calendar(weekOffset:weekOffset);
                  }, 
                  itemCount: 5, 
                  index: currentWeekOffset+2,
                  loop:false,
                )),
                Expanded(
                  child:
                    routeListModel.routes != null 
                    ? ListView.builder(
                      shrinkWrap: true,
                      itemCount: routeListModel.routes.length,
                      itemBuilder: (BuildContext context, int index){
                        
                        var route = routeListModel.routes.elementAt(index);
                        var subtitle = (route.duration/60).floor().toString() + " min. / " + (route.distance/1000).floor().toString() + " km";
                        
                        // Catch tap on widget
                        return InkWell(
                          child: RouteListItem(title: route.label, subtitle: subtitle, route: route),
                          onTap: () async {
                            await Navigator.pushNamed(context, '/route',arguments: route);
                          },
                        );

                      })
                    : Container()
                  )
              ]
        );
  }
  
}