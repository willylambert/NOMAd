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

class ProfileNotification extends StatelessWidget {
  final Animation<double> containerGrowAnimation;
  final DecorationImage profileImage;
  ProfileNotification({this.containerGrowAnimation, this.profileImage});
  @override
  Widget build(BuildContext context) {
    return (new Container(
        child: new Column(
          children: [
            new Container(
                width: containerGrowAnimation.value * 35,
                height: containerGrowAnimation.value * 35,
                margin: new EdgeInsets.only(left: 80.0),
                child: new Center(
                  child: new Text("3",
                      style: new TextStyle(
                          fontSize: containerGrowAnimation.value * 15,
                          fontWeight: FontWeight.w400,
                          color: Colors.white)),
                ),
                decoration: new BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color.fromRGBO(80, 210, 194, 1.0),
                )),
          ],
        ),
        width: containerGrowAnimation.value * 120,
        height: containerGrowAnimation.value * 120,
        decoration: new BoxDecoration(
          shape: BoxShape.circle,
          image: profileImage,
        )));
  }
}
