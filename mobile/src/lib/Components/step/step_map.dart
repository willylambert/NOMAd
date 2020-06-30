    
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
  import 'package:mapbox_gl/mapbox_gl.dart';

class StepMap extends StatelessWidget{

  final LatLng stepPosition;
  final CameraPosition initialPosition;

  void _onMapCreated(MapboxMapController controller) {
    // Map load is sensitive... had here an extra wait time
    Future.delayed(const Duration(milliseconds: 500), () async {
      await controller.waitForMap();
      controller.addMarker(
        SymbolOptions(
            geometry: this.stepPosition,
        ),
      );
      controller.moveCamera(
        CameraUpdate.newLatLng(this.stepPosition)
      );
    });
  }

  StepMap({this.stepPosition}) : 
    this.initialPosition = CameraPosition(
      target: stepPosition,
      zoom: 11.0,
    );
  
  @override
  Widget build(BuildContext context) {
    return MapboxMap(
      initialCameraPosition: CameraPosition(target: LatLng(47.4711616,-0.5518257),zoom:11),
      myLocationEnabled: false,
      onMapCreated: _onMapCreated);
  }
}