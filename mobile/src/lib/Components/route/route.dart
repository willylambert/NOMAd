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
import 'package:nomad_mobile_driver/Components/route/poi.dart';

class DriverRoute{
  final String id;
  final String label;
  final int duration;
  final int distance;
  final DateTime dt;
  DateTime startedDt;
  final DateTime endedDt;
  
  final List<Poi> pois;
  
  DriverRoute({this.id,this.label,this.distance,this.duration,this.pois,this.dt,this.startedDt,this.endedDt});

  factory DriverRoute.fromJson(Map<String, dynamic> json) {
    final pois = json['POIs'] as List;
    final List<Poi> poisList = pois.map( (i) => Poi.fromJson(i) ).toList();
   
    return DriverRoute(id: json['id'],
                       label: json['label'], 
                       distance: json['distance'], 
                       duration: json['duration'],
                       pois: poisList, 
                       dt: DateTime.fromMillisecondsSinceEpoch(json['date_dt']),
                       startedDt: (json['start_driver_dt']!=null ? DateTime.fromMillisecondsSinceEpoch(json['start_driver_dt']) : null),
                       endedDt: (json['end_driver_dt']!=null ? DateTime.fromMillisecondsSinceEpoch(json['end_driver_dt']) : null));
  }
}