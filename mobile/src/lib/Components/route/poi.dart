
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
import 'package:mapbox_gl/mapbox_gl.dart';

class Poi{
  final String id;
  final String addr1;
  final String addr2;
  final String city;
  final String label;
  final String siteTypeCode;
  final String transportModeCode;
  final LatLng coordinates;
  final String firstname;
  final String lastname;
  final int targetHr; // Local time for arrival_dt set by server-user (default value setted by traffic aware router)
  DateTime visitedDt;
  bool visited;
  bool visitMissing;

  Poi({this.id,this.addr1,this.addr2,this.city,this.label,this.siteTypeCode,this.transportModeCode,this.coordinates,this.firstname,this.lastname,this.visited,this.visitedDt,this.visitMissing,this.targetHr});

  factory Poi.fromJson(Map<String, dynamic> json) {
    final coord = LatLng(json['geom']['coordinates'][1],json['geom']['coordinates'][0]);
    return Poi(id: json['id'],addr1: json['addr1'],addr2:json['addr2'],
              city:json['city'],label: json['label'],siteTypeCode: json['site_type_code'], 
              transportModeCode: json['transport_mode_code'],coordinates: coord,
              firstname: json['hr_firstname'],lastname: json['hr_lastname'],
              visited : json['visited_yn']!=null?json['visited_yn']=='Y':false,
              visitedDt: json['visited_dt']!=null?DateTime.fromMillisecondsSinceEpoch(json['visited_dt']):null,
              targetHr: json['target_hr']!=null?json['target_hr']:null,
              visitMissing: json['visit_missing_yn']!=null?json['visit_missing_yn']=='Y':false);
  }

  String toString(){
    return this.id + " : " + this.label;
  }

}