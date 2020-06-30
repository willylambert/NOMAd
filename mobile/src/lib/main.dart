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
import 'package:nomad_mobile_driver/Components/route_list/route_list_view.dart';
import 'package:nomad_mobile_driver/Components/route/route_view.dart';
import 'package:nomad_mobile_driver/Components/step/step_crud_view.dart';
import 'package:provider/provider.dart';

import 'Components/log/log_list_view.dart';
import 'Components/login/login_view.dart';
import 'nomad_ctrl.dart';

void main() => runApp(Nomad());

class Nomad extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      child: ChangeNotifierProvider<NomadCtrl>(
        builder: (_) => NomadCtrl(),
        child: NomadView()
      )
    );
  }
}

class NomadView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
        // Start the app with the "/" named route. In this case, the app starts
      // on the FirstScreen widget.
      initialRoute: '/',
      routes: {
        '/': (context) => Login(),
         '/route-list': (context) => RouteList(),
         '/route': (context) => NomadRoute(),
         '/step-crud': (context) => StepCrud(),
         '/log-list': (context) => LogList(),
      },
      title: 'Nomad Mobile',
      theme: ThemeData(
        // Define the default brightness and colors.
        brightness: Brightness.light,
        primaryColor: Colors.lightBlue[800],
        accentColor: Colors.cyan[600],
        
        // Define the default font family.
        fontFamily: 'Montserrat',
        
        // Define the default TextTheme. Use this to specify the default
        // text styling for headlines, titles, bodies of text, and more.
        textTheme: TextTheme(
          headline: TextStyle(fontSize: 16.0, fontWeight: FontWeight.normal,color: Colors.white),
          title: TextStyle(fontSize: 36.0, fontStyle: FontStyle.italic),
          body1: TextStyle(fontSize: 14.0, fontFamily: 'Hind'),
        ),
      ),
    );
  }
}
