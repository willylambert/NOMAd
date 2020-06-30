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

import { Component, Input, Output, OnInit, OnChanges, SimpleChanges, EventEmitter,AfterViewInit } from '@angular/core';
import { POI, TransportPOI } from '../poi/poi';
import { POIService } from '../poi/poi.service';
import { AOI } from '../aoi/aoi';

import { MapLeafletService } from './map-leaflet.service';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';
import { faHome,faShuttleVan,faHospital } from '@fortawesome/free-solid-svg-icons';

// Mapbox.js library extends Leaflet library , so we do not have to include Leafet library
import * as L from 'mapbox.js';
import 'leaflet-draw';


/**
 * Class that encapsulates a Leaflet map configuration
 */
export class MapLeafletConfig {

  // token to access mapbox services
  mapBoxKey : string;

  // default map zoom level
  zoom: number;

  // default map maximum zoom level
  maxZoom : number;

  // default map center
  lon : number;
  lat : number;
}

// Make available a <map-leaflet> tag for displaying a leaflet map in a web page
@Component({
    selector: 'map-leaflet',
    templateUrl: './map-leaflet.html',
    styleUrls: ['./map-leaflet.css']
  })

/**
 * Class that encapsulates a Leaflet map
 */
export class MapLeaflet implements OnChanges, OnInit,AfterViewInit {

    // List of POIs received from host component
    @Input('POIs') POIs: POI[];
    // Incremented after any changes in the list of POIs received from host component
    @Input('changeInPOIs') changeInPOIs: number;
    // List of AOIs received from host component
    @Input('AOIs') AOIs: AOI[];
    // Incremented after any changes in the list of AOIs received from host component
    @Input('changeInAOIs') changeInAOIs: number;
    // boolean to tell that we are working only with POIs
    @Input('noAOI') noAOI: boolean;
    // Edit mode received from a host CRUD component
    @Input('editMode') editMode: string;
    // Event emitter that will warn after a new POI creation
    @Output() newPOI = new EventEmitter();
    // Event emitter that will warn after a new AOI creation
    @Output() newAOI = new EventEmitter();

    // the map identifier
    sMapID: string;

    // Another modelization would be to inherit L.Map directly.
    // In that case we would have to call L.Map constructor withing MapLeaflet constructor with a super() call
    // One drawback is that the constructor is called before the DOM is ready, and the L.Map constructor would
    //   not find the div tag with the id attribute set to this.sMapID, thus leading to a leaflet error
    map : L.Map;

    // The control for the features creation/edition/deletion tool using leaflet-draw
    drawControl : L.Control.Draw;

    // The control for the features creation/edition/deletion tool using leaflet-draw (only for POI drawing)
    drawControlNoAOI : L.Control.Draw;

    // The layers that will contain features created by user operations, for instance with leaflet-draw
    POIEditLayer : L.FeatureGroup;
    AOIEditLayer : L.FeatureGroup;

    // The layer that will contain features stored in POIs input list
    POILayer : L.FeatureGroup;

    // The layer that will contain features stored in AOIs input list
    AOILayer : L.FeatureGroup;

    // Icon in use for existing markers stored in POIs
    POIIcon : L.Icon;

    // Icon in use for markers that are under creation stored in POIs
    POIEditIcon : L.Icon;

    // Available base layers.
    baseLayers:object;

    // Available overlay layers
    overlays:object;

    // Default base layer name (the one displayed at map opening and the one ticked in base layer selector control)
    defaultLayerName:string;

    homeIconUrl:string;
    roundIconUrl:string;
    homeEditIconUrl:string;

    /**
     * Default constructor
    **/
    constructor(private POIService : POIService,private MapLeafletService: MapLeafletService){
      // dynamic generation of map id, enables to include several maps withing the same component
      this.sMapID = "map" + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
      // Some SVGs markers : as long as leaflet awesome markers does not work, we can display svg markers this way
      let homeEditSvgString = "<svg xmlns='http://www.w3.org/2000/svg' width='512px' height='512px'><path d='M256,0C150.112,0,64,86.112,64,192c0,133.088,173.312,307.936,180.672,315.328C247.808,510.432,251.904,512,256,512 s8.192-1.568,11.328-4.672C274.688,499.936,448,325.088,448,192C448,86.112,361.888,0,256,0z M351.104,181.312  C348.832,187.712,342.784,192,336,192h-16v80c0,8.832-7.168,16-16,16h-96c-8.832,0-16-7.168-16-16v-80h-16 c-6.784,0-12.832-4.288-15.104-10.688c-2.272-6.4-0.192-13.568,5.12-17.824l80-64c5.856-4.672,14.144-4.672,20,0l80,64  C351.328,167.744,353.344,174.88,351.104,181.312z' fill='#ff9933'/></svg>";

      this.homeEditIconUrl = encodeURI("data:image/svg+xml," + homeEditSvgString).replace('#','%23');

      this.POIEditIcon = new L.Icon({iconUrl: this.homeEditIconUrl,iconSize:40,iconAnchor: [20, 40]})
      this.POIEditLayer = new L.FeatureGroup();
      this.AOIEditLayer = new L.FeatureGroup();
      this.POILayer = new L.FeatureGroup();
      this.AOILayer = new L.FeatureGroup();
      this.drawControl = new L.Control.Draw({
        position:'bottomleft',
        draw:{
          polygon: { showArea:true, shapeOptions: {
            color: 'orange'
        }},
          polyline: false,
          rectangle: false,
          circle: false,
          marker: { icon:this.POIEditIcon },
          circlemarker:false
        },
        edit: {
          featureGroup: this.POIEditLayer,
          edit: false,
          remove: false
      }});
      this.drawControlNoAOI = new L.Control.Draw({
        position:'bottomleft',
        draw:{
          polygon: false,
          polyline: false,
          rectangle: false,
          circle: false,
          marker: { icon:this.POIEditIcon },
          circlemarker:false
        },
        edit: {
          featureGroup: this.POIEditLayer,
          edit: false,
          remove: false
      }});
    }

    /**
     * Display the POIs on map. We can do that only when both map and POIs are available
     */
    private displayPOIs(){
      if(this.POIs && this.POILayer){
        this.POILayer.clearLayers();
        this.POIEditLayer.clearLayers();
        for(let POI of this.POIs){
          if(POI.geom !=null){
            if(POI.id!=undefined){
              var icon;
              var label=POI.label;
              switch(POI.site_type_code){
                case 'HOME':
                  icon = new FontAwesomeIcon({icon:faHome});
                  // In case of a home POI, using the label may not be relevant enough : it is
                  //   better to search for information about the HR to which the POI is attached.
                  // If such HR information is available, use it instead of just the POI label
                  var tempPOI = POI as TransportPOI;
                  if(tempPOI.hr_firstname!=undefined && tempPOI.hr_lastname!=undefined){
                    label = tempPOI.hr_firstname + ' ' + tempPOI.hr_lastname;
                    if(tempPOI.label != '' && tempPOI.label != undefined && tempPOI.label != null){
                      label+= ' ('+tempPOI.label+')';
                    }
                  }
                  break;
                case 'INSTITUTION': icon = new FontAwesomeIcon({icon:faHospital,markerColor:'green'});break;
                case 'TRANSPORTER': icon = new FontAwesomeIcon({icon:faShuttleVan,markerColor:'green'});break;
              }
              //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
              // Use permanent labels only if there are very few points
              this.POILayer.addLayer(
                L.marker(L.GeoJSON.coordsToLatLng(POI.geom.coordinates), {icon: icon})
                .bindTooltip(label,{permanent:this.POIs.length<5,offset:[17,-20],direction:'right'}));
            }
            else{
              var label = POI.label!=undefined ? POI.label : "Nouveau point";
              //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
              this.POIEditLayer.addLayer(
                L.marker(L.GeoJSON.coordsToLatLng(POI.geom.coordinates), {icon: this.POIEditIcon})
                .bindTooltip(label,{permanent:true,offset:[17,-20],direction:'right'}));
            }
          }
        }
        this.centerMap();
      }
    }

    /**
     * Display the AOIs on map. We can do that only when both map and AOIs are available
     */
    private displayAOIs(){
      if(this.AOIs  && this.AOILayer){
        this.AOILayer.clearLayers();
        for(let AOI of this.AOIs){
          if(AOI.geom !=null){
            if(AOI.id!=undefined){
              //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
              this.AOILayer.addLayer(
                L.polygon(L.GeoJSON.coordsToLatLngs(AOI.geom.coordinates,1), {color: 'blue'})
                .bindTooltip(AOI.label,{permanent:true})
              )
            }
            else{
              var label = AOI.label!=undefined ? AOI.label : 'Nouvelle zone';
              //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
              this.AOIEditLayer.addLayer(
                L.polygon(L.GeoJSON.coordsToLatLngs(AOI.geom.coordinates,1), {color: 'orange'})
                .bindTooltip(label,{permanent:true})
              )
            }
          }
        }
        this.centerMap();
      }
    }

    /**
     * Function triggered on any data change.
     * We avoid relying on change detection in arrays since this may be ressource consuming
     * Enables to update POI or AOI display in case of POIs or AOIs changes, or drawing toolbar toggling
     * @param changes : list of changed objects
     */
    ngOnChanges(changes: SimpleChanges) {
      if(changes.changeInPOIs && !changes.changeInPOIs.firstChange){
        // Some changes have been detected in the collection of POIs so we repaint them on the map
        this.displayPOIs();
      }
      if(changes.changeInAOIs && !changes.changeInAOIs.firstChange){
        // Some changes have been detected in the collection of AOIs so we repaint them on the map
        this.displayAOIs();
      }
      if(changes.editMode){
        // The edit mode changes, so we toggle the leaflet-draw control
        if(changes.editMode.currentValue=="view" && !changes.editMode.firstChange){
          if(this.noAOI){
            this.map.removeControl(this.drawControlNoAOI);
          }
          else{
            this.map.removeControl(this.drawControl);
          }
        }
        if(changes.editMode.currentValue=="edit" && !changes.editMode.firstChange){
          if(this.noAOI){
            this.map.addControl(this.drawControlNoAOI);
          }
          else{
            this.map.addControl(this.drawControl);
          }
        }
        // Make sure the edit layers are empty after any mode switch
        this.POIEditLayer.clearLayers();
        this.AOIEditLayer.clearLayers();
      }
    }

    /**
     * Center the map on all available features.
     */
    centerMap(){
      var allFeatures = new L.FeatureGroup();
      allFeatures.addLayer(this.POILayer);
      allFeatures.addLayer(this.AOILayer);
      allFeatures.addLayer(this.POIEditLayer);
      allFeatures.addLayer(this.AOIEditLayer);
      var bounds = allFeatures.getBounds();
      // In case no poi and no aoi are available, bounds may not be valid.
      if(bounds.isValid() && this.map){
        this.map.fitBounds(bounds,{maxZoom:16});
      }
    }

    /**
     * Function to add a created feature (marker, polygon) to the already existing created features
     */
    onFeatureCreation(e : L.DrawEvents.Created) {
      if(e.layerType === 'marker'){
        e.layer.bindTooltip("Nouveau point",{permanent:true,offset:[17,-20],direction:'right'}).addTo(this.POIEditLayer)
        // Send new POI to host component but geocode it beforehand
        var point = e.layer.toGeoJSON();
        this.POIService.reverseGeocode({
          lat:point.geometry.coordinates[1],
          lng:point.geometry.coordinates[0]
        }).subscribe( result => {
          var POI = result.data as POI;
          point.properties.addr1 = POI.addr1;
          point.properties.addr2 = POI.addr2;
          point.properties.postcode = POI.postcode;
          point.properties.city = POI.city;
          this.newPOI.emit({
            value: point
          });
        })
      }
      else{
        e.layer.bindTooltip("Nouvelle zone",{permanent:true}).addTo(this.AOIEditLayer);
        // Send new AOI to host component
        this.newAOI.emit({
          value: e.layer.toGeoJSON()
        });
      }
    }



    /**
     * Function called after DOM completion.
     * Create a leaflet map
     */
    ngOnInit() {
      this.MapLeafletService.getMapboxAccessToken().subscribe(response => {
        var mapConfig = (response.data as MapLeafletConfig);
        L.mapbox.accessToken = mapConfig.mapBoxKey;
        // Create base layers
        this.baseLayers = {
          'Rues': L.mapbox.tileLayer('willylambert.ig7ac2k2'),
          'OSM': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
          'Satellite' : L.mapbox.tileLayer('willylambert.ig7a2pb9'),
          'Nuit' : L.mapbox.tileLayer('willylambert.np094ng9')
        };
        this.defaultLayerName="Rues";

        // Creating a map with mapbox.js constructor. This enables to load tiles that were prepared under mapbox tile creation tool.
        // Getting rid of mapbox is still possible, using leaflet constructor instead : this.map = L.map(this.sMapID).
        // Base layer id is left undefined since it will be specified later
        this.map = L.mapbox.map(this.sMapID,undefined,{
          maxZoom: mapConfig.maxZoom,
          bounceAtZoomLimits:false,
          center: new L.LatLng(mapConfig.lat,mapConfig.lon),
          zoom: mapConfig.zoom
        });
        // Add the feature layers (generic layers gathering layers of the same type (markers, polygons))
        this.map.addLayer(this.POIEditLayer);
        this.map.addLayer(this.AOIEditLayer);
        this.map.addLayer(this.POILayer);
        this.map.addLayer(this.AOILayer);
        // Render the received list of POIs and the list of AOIs
        this.displayPOIs();
        this.displayAOIs();
        // Activate the features creation callback on features drawing events
        this.map.on(L.Draw.Event.CREATED,(event :L.DrawEvents.Created) => this.onFeatureCreation(event))
        // Insert the layers control to the map
        L.control.layers(this.baseLayers, this.overlays,{collapsed:true,position:'topright'}).addTo(this.map);
        // Add a geocoder control
        this.MapLeafletService.getEtalabGeocoder().addTo(this.map)
        // Set the default base layer
        this.baseLayers[this.defaultLayerName].addTo(this.map)
        // Add draw control (in edit mode only)
        if(this.editMode=="edit"){
          if(this.noAOI){
            this.map.addControl(this.drawControlNoAOI);
          }
          else{
            this.map.addControl(this.drawControl);
          }
        }
      })
    }

    ngAfterViewInit(){
      setTimeout( () => {if(this.map){this.map.invalidateSize();}} );
    }
}
