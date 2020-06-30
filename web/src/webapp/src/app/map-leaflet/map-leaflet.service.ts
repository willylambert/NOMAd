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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CrudResult } from '../helpers/crud-result';
import { BaseCrudService } from '../basecrud.service';

import * as L from 'mapbox.js';
import "leaflet-control-geocoder/dist/Control.Geocoder";

@Injectable({
  providedIn: 'root'
})
export class MapLeafletService extends BaseCrudService{

  constructor(protected http: HttpClient) { 
    super(http,"map")
    this.defineEtalabGeocoder();
  }

  /**
  * Get a Mapbox token id
  * @return Observable<CrudResult> : a mapbox token id encapsulated in a CrudResult object
  */
  getMapboxAccessToken() :  Observable<CrudResult> {
    return this.http.get(this.getURL('access-token')) as Observable<CrudResult>;
  }

  /**
   * Return a leaflet-control-geocoder instance based on etalab geocoder
   * @return object L.Control.geocoder
   */
  getEtalabGeocoder(){    
    return L.Control.geocoder({
      position:'bottomleft',
      placeholder:'Rechercher une adresse ...',
      collapsed:true,
      errorMessage:"Aucun résultat trouvé.",
      geocoder: new L.Control.Geocoder.Etalab()
    })
  }
  
  /**
   * Define a custom geocoder for Leaflet-control-geocoder, based on https://api-adresse.data.gouv.fr/
   */
  defineEtalabGeocoder(){
    L.Control.Geocoder.Etalab = L.Control.Geocoder.Nominatim.extend({
      options: {
        serviceUrl: 'https://api-adresse.data.gouv.fr/',
        geocodingQueryParams: {},
        reverseQueryParams: {},
        // override Nominatim htmlTemplate function
        htmlTemplate: function(r) {
          var a = r.properties,
          parts = [];
          // Unlike nominatim, we make no difference between the returned place types
          // Currently Etalab proposes 2 different types in the type field : street and municipality
          //   but with both these types the label and context can be used as such
          parts.push(
            '<span class="' +
            (parts.length > 0 ? 'leaflet-control-geocoder-address-detail' : '') +
            '">{label}</span>'
          );
          parts.push(
            '<span class="' +
            (parts.length > 0 ? 'leaflet-control-geocoder-address-context' : '') +
            '">{context}</span>'
          );
          // -- Piece of code copied from Leaflet control geocoder --
          // It would be greet to get the code directly from Leaflet control geocoder
          function template(str, data) {
            return str.replace(/\{ *([\w_]+) *\}/g, function(str, key) {
              var value = data[key];
              if (value === undefined) {
                value = '';
              } else if (typeof value === 'function') {
                value = value(data);
              }
              return htmlEscape(value);
            });
          }
          function escapeChar(chr) {
            return escape[chr];
          }    
          var badChars = /[&<>"'`]/g;
          var possible = /[&<>"'`]/;
          var escape = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '`': '&#x60;'
          };
          function htmlEscape(string) {
           if (string == null) {
              return '';
            } else if (!string) {
              return string + '';
            }
        
            // Force a string conversion as this will be done by the append regardless and
            // the regex test will do this transparently behind the scenes, causing issues if
            // an object's to string has escaped characters in it.
            string = '' + string;
        
            if (!possible.test(string)) {
              return string;
            }
            return string.replace(badChars, escapeChar);
          }
          // -- end of the piece of code copied from Leaflet control geocoder --
          return template(parts.join('<br/>'), a);
        }
      },
      geocode: function(query, cb, context) {
        // -- Piece of code copied from Leaflet control geocoder --
        // It would be greet to get the code directly from Leaflet control geocoder          
        function getParamString(obj, existingUrl, uppercase) {
          var params = [];
          for (var i in obj) {
            var key = encodeURIComponent(uppercase ? i.toUpperCase() : i);
            var value = obj[i];
            if (!L.Util.isArray(value)) {
              params.push(key + '=' + encodeURIComponent(value));
            } else {
              for (var j = 0; j < value.length; j++) {
                params.push(key + '=' + encodeURIComponent(value[j]));
              }
            }
          }
          return (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') + params.join('&');
        }
        function getJSON(url, params, callback) {
          var xmlHttp = new XMLHttpRequest();
          xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState !== 4) {
              return;
            }
            if (xmlHttp.status !== 200 && xmlHttp.status !== 304) {
              callback('');
              return;
            }
            callback(JSON.parse(xmlHttp.response));
          };
          // NB : Note : I had to add 2 undefined parameters for compilation
          xmlHttp.open('GET', url + getParamString(params,undefined,undefined), true);
          xmlHttp.setRequestHeader('Accept', 'application/json');
          xmlHttp.send(null);
        }  
        // -- end of the piece of code copied from Leaflet control geocoder --        
        getJSON(
          this.options.serviceUrl + 'search',
          L.extend(
            {
              q: query,
              limit: 5,
              format: 'json',
              addressdetails: 1
            },
            this.options.geocodingQueryParams
          ),
          L.bind(function(data) {
            var results = [];
            for(var i = data.features.length - 1; i >= 0; i--) {
              // the binding box is not provided by Etalab geocoder but we can creat one based on the center coordinate
              var bbox = [
                data.features[i].geometry.coordinates[1]-0.001,
                data.features[i].geometry.coordinates[1]+0.001,
                data.features[i].geometry.coordinates[0]-0.001,
                data.features[i].geometry.coordinates[0]+0.001
              ];
              results[i] = {
                // icon attribute to mimic Nominatim interfce but it may be useless
                icon: "",
                // name attribute to mimic Nominatim interfce but it may be useless
                name: data.features[i].name,
                // html attribute to mimic Nominatim interfce but it may be useless
                html: this.options.htmlTemplate ? this.options.htmlTemplate(data.features[i]) : undefined,
                // bbox attribute to mimic Nominatim interfce but it may be useless
                bbox: L.latLngBounds([bbox[0], bbox[2]], [bbox[1], bbox[3]]),
                // Enables to zoom on the location when user clicks an item in the proposed list
                center: L.latLng(data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]),
                // Properties that are sent to display function
                properties: data.features[i].properties
              };
            }
            cb.call(context, results);
          }, this)
        );
      }
    });
  }
}

