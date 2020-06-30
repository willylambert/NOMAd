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

class StepCrudAction extends StatelessWidget {
  final String label;
  final void Function(bool) onChanged;
  final bool status;

  StepCrudAction({this.status,this.label,this.onChanged});
  @override
  Widget build(BuildContext context) {
    return (
        Container(
          decoration: BoxDecoration(
              border: new Border(
              top: new BorderSide(
                  width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
              bottom: new BorderSide(
                  width: 1.0, color: const Color.fromRGBO(204, 204, 204, 0.3)),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [              
              Text(this.label, 
                style: TextStyle(
                  fontSize: 20.0,
                  fontWeight: FontWeight.w300,
                  letterSpacing: 0.3,
                )
              ),
              Padding(padding: EdgeInsets.all(20) ,child:Transform.scale( scale: 1.5, child:Switch(value:this.status, onChanged: this.onChanged,)))
            ],)
        )
    );
  }
}
