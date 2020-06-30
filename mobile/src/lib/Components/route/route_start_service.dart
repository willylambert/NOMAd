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

class RouteStartService extends StatelessWidget {
  final VoidCallback onTap;
  final String label;
  final Color color;
  final Icon icon;
  RouteStartService({this.label,this.color,this.icon,this.onTap});

  @override
  Widget build(BuildContext context) {

    return (
       Padding(
        padding: const EdgeInsets.all(5),
        child:
         InkWell(
           onTap: this.onTap,
           child: 
            Container(
                alignment: FractionalOffset.center,
                decoration:  BoxDecoration(
                  color: this.color,
                  borderRadius:  BorderRadius.all(const Radius.circular(30.0)),
                ),
                child:  Row(
                  children: <Widget>[
                    Container(
                        margin:  EdgeInsets.only(
                            left: 20.0, top: 10.0, bottom: 10.0, right: 40.0),
                        width: 50.0,
                        height: 40.0,
                        child: this.icon,
                        ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          this.label,
                          style:
                              TextStyle(fontSize: 20.0, fontWeight: FontWeight.w300, color: Colors.white,letterSpacing: 0.3),
                        ),
                      ],
                    )
                  ],
                ),
              )
            )
       )
    );
  }
}