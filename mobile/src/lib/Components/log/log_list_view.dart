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
import 'package:flutter_speed_dial/flutter_speed_dial.dart';
import 'package:provider/provider.dart';

import 'log_list_ctrl.dart';

class LogList extends StatelessWidget {
@override
  Widget build(BuildContext context) {
    return Container(
      child: ChangeNotifierProvider<LogListCtrl>(
        builder: (_) => LogListCtrl(),
        child: LogListView()
      )
    );
  }
}

class LogListView extends StatelessWidget{

  @override
  Widget build(BuildContext context) {
    final logListModel = Provider.of<LogListCtrl>(context);

    return 
        Scaffold(
            appBar: AppBar(
              backgroundColor: Color.fromRGBO(25, 43, 63, 0.9),
              title: Text("Logs", style: TextStyle(color: Colors.white),),
            ),
            body:
            Column(                    
              children: <Widget>[
                Expanded(child: ListView.builder(
                  itemCount: logListModel.logs.length,
                  itemBuilder: (BuildContext context, int index){
                    Log log = logListModel.logs[index];
                    return Text(log.timestamp + " " + log.text, style: TextStyle(color: log.logLevel==LogLevel.INFO?Colors.black:Colors.red),);
                  },
                ),
              )
              ]
            ),
            floatingActionButton: 
              SpeedDial(
                // both default to 16
                marginRight: 18,
                marginBottom: 20,
                animatedIcon: AnimatedIcons.menu_close,
                animatedIconTheme: IconThemeData(size: 22.0),
                visible: true,
                closeManually: false,
                curve: Curves.bounceIn,
                overlayColor: Colors.black,
                overlayOpacity: 0.5,
                tooltip: 'Speed Dial',
                heroTag: 'speed-dial-hero-tag',
                backgroundColor: Color.fromRGBO(25, 43, 63, 0.9),
                foregroundColor: Colors.white,
                elevation: 8.0,
                shape: CircleBorder(),
                children: [
                  SpeedDialChild(
                    child: Icon(Icons.settings),
                    backgroundColor: Colors.grey,
                    label: 'Vider les logs',
                    labelStyle: TextStyle(fontSize: 18.0),
                    onTap: () => logListModel.clearLogs(),
                  ),
                ],
              )
            ,
        );
    }
  }