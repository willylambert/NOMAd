
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

import { Component, OnInit  } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapGLService } from './map-gl.service';
import { MapLeafletConfig } from '../map-leaflet/map-leaflet';

// Make available a <map-gl> tag for displaying a mapbox-gl map in a web page
@Component({
    selector: 'map-gl',
    templateUrl: './map-gl.html',
    styleUrls: ['./map-gl.css']
  })

/**
 * Class that encapsulates a Leaflet map
 */
export class MapGL implements OnInit {

  // Another modelization would be to inherit mapboxgl.Map directly.
  // In that case we would have to call mapboxgl.Map constructor withing MapLeaflet constructor with a super() call
  // One drawback is that the constructor is called before the DOM is ready, and the mapboxgl.Map constructor would
  //   not find the div tag with a mapid attribute, thus leading to a mapbox-gl error
  map : mapboxgl.Map;

  constructor(private MapGLService: MapGLService){}

  ngOnInit() {
    this.MapGLService.getMapboxAccessToken().subscribe(response => {
      var mapConfig = (response.data as MapLeafletConfig);
      // Definition of the mapbox token
      // Notice that mapboxgl.accessToken = '<MY_TOKEN>' is causing the following compilation error :
      //  "TS2540: Cannot assign to 'accessToken' because it is a constant or a read-only property"
      // This error seems to be non blocking since execution is still enabled and map displays fine.
      // The following workaround was found on stack overflow website :
      //   https://stackoverflow.com/questions/44332290/mapbox-gl-typing-wont-allow-accesstoken-assignment
      Object.getOwnPropertyDescriptor(mapboxgl, "accessToken").set(mapConfig.mapBoxKey);

      this.map = new mapboxgl.Map({
        container: 'mapid', // container id
        style: 'mapbox://styles/mapbox/streets-v9', // stylesheet location
        center: [-0.6, 47.54], // starting position [lng, lat]
        zoom: 10 // starting zoom
      });
    });
  }

}
