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
import 'MonthView.dart';
import 'Profile_Notification.dart';

class ImageBackground extends StatelessWidget {
  final DecorationImage backgroundImage;
  final DecorationImage profileImage;
  final VoidCallback selectbackward;
  final VoidCallback selectforward;
  final String month;
  final Animation<double> containerGrowAnimation;
  ImageBackground(
      {this.backgroundImage,
      this.containerGrowAnimation,
      this.profileImage,
      this.month,
      this.selectbackward,
      this.selectforward});
  @override
  Widget build(BuildContext context) {
    Size screenSize = MediaQuery.of(context).size;
    final Orientation orientation = MediaQuery.of(context).orientation;
    bool isLandscape = orientation == Orientation.landscape;
    return (new Container(
        width: screenSize.width,
        height: screenSize.height / 2.5,
        decoration: new BoxDecoration(image: backgroundImage),
        child: new Container(
          decoration: new BoxDecoration(
              gradient: new LinearGradient(
            colors: <Color>[
              const Color.fromRGBO(110, 101, 103, 0.6),
              const Color.fromRGBO(51, 51, 63, 0.9),
            ],
            stops: [0.2, 1.0],
            begin: const FractionalOffset(0.0, 0.0),
            end: const FractionalOffset(0.0, 1.0),
          )),
          child: isLandscape
              ? new ListView(
                  children: <Widget>[
                    new Flex(
                      direction: Axis.vertical,
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: <Widget>[
                        new Text(
                          "Good Morning!",
                          style: new TextStyle(
                              fontSize: 30.0,
                              letterSpacing: 1.2,
                              fontWeight: FontWeight.w300,
                              color: Colors.white),
                        ),
                        new ProfileNotification(
                          containerGrowAnimation: containerGrowAnimation,
                          profileImage: profileImage,
                        ),
                        new MonthView(
                          month: month,
                          selectbackward: selectbackward,
                          selectforward: selectforward,
                        )
                      ],
                    )
                  ],
                )
              : new Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: <Widget>[
                    new Text(
                      "Good Morning!",
                      style: new TextStyle(
                          fontSize: 30.0,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w300,
                          color: Colors.white),
                    ),
                    new ProfileNotification(
                      containerGrowAnimation: containerGrowAnimation,
                      profileImage: profileImage,
                    ),
                    new MonthView(
                      month: month,
                      selectbackward: selectbackward,
                      selectforward: selectforward,
                    )
                  ],
                ),
        )));
  }
}
