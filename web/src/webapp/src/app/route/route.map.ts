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

import { Component, Input, OnInit, OnChanges, SimpleChanges,Output,EventEmitter } from '@angular/core';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';
import { Router } from '@angular/router';

// Map libraries
// Mapbox.js library extends Leaflet library , so we do not have to include Leafet library
import * as L from 'mapbox.js';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

// The fa-icons
import { faShuttleVan,faHospital } from '@fortawesome/free-solid-svg-icons';
import { Route } from './route';
import { RouteSet } from './route.set';
import { RoutePOI, SelectablePOISet } from './route.poi';
import { Site } from '../site/site';
import { TransportPOI } from '../poi/poi';
import { RouteService } from './route.service';
import { RouteToolbarOptions } from '../route-toolbar/route-toolbar';
import { MapLeafletConfig } from '../map-leaflet/map-leaflet';
import { MapLeafletService } from '../map-leaflet/map-leaflet.service';

/**
 * Class to for routes map
 */
@Component({
  selector: 'route-map',
  templateUrl: './route.map.html',
  styleUrls: ['./route.scss']
})
export class RouteMap implements OnInit, OnChanges {

  // The considered timeslotId (for route computation with traffic estimation)
  @Input('timeSlotId') timeSlotId;

  // All the institutions to be diplayed on the map
  @Input('institutions') institutions:Site[];

  // The list of all available transporters
  @Input('transporters') transporters:Site[];

  // The set of routes
  @Input('routes') routes:RouteSet;

  // The POIs (can be associated to no route)
  @Input('POIs') POIs: SelectablePOISet;

  // Tell whether POI can be selected or not
  @Input('POISelectionEnabled') POISelectionEnabled : boolean;

  // Enable to request map refresh from parent component (without recentering)
  @Input('updateMapCount') updateMapCount: number;

  // Enable to request map refresh from parent component (with recentering)
  @Input('updateMapWithRecenteringCount') updateMapWithRecenteringCount: number;

  // Enable to request routes display refresh in map from parent component
  @Input('routesDisplayCount') routesDisplayCount: number;

  // Whether the rout map toolbox is enabled or not
  @Input('toolbarEnabled') toolbarEnabled:boolean;

  // Events are emitted when a route is modified from map (point added or deleted from route)
  @Output() routePOIsChange = new EventEmitter();

  // The map object
  map : L.Map;

  // The layer that will contain features stored in POIs input list
  POILayer : L.FeatureGroup;

  // The layer that will contain the computed routes (in the current version, only one route will be displayed in the same time)
  RouteLayer : L.FeatureGroup;

  // The layer that will contain the current institutions location
  InstitutionLayer : L.FeatureGroup;

  // The layer that will contain the current transporters location
  TransporterLayer : L.FeatureGroup;

  // Available base layers.
  baseLayers:object;

  // Available overlay layers
  overlays:object;

  // Default base layer name (the one displayed at map opening and the one ticked in base layer selector control)
  defaultLayerName:string;

  // polygon that enable the marker multi selection.inspired by leaflet-lasso plugin
  lassoPolygon : L.Polygon;

  // The fa icons
  faHospital= faHospital;
  faShuttleVan = faShuttleVan;

  // The options for the route map toolbox
  options:RouteToolbarOptions;

  constructor(
    private router: Router,
    private RouteService : RouteService,
    private MapLeafletService : MapLeafletService,    
  ) {
    this.options = { multipleSelect: false,select:true,unselect:false,show:false,inRouteMap:true };
    this.POILayer = new L.FeatureGroup();
    this.RouteLayer = new L.FeatureGroup();
    this.InstitutionLayer = new L.FeatureGroup();
    this.TransporterLayer = new L.FeatureGroup();
    this.POIs=new SelectablePOISet();
  }

  // --------------- MAP TOOLTIP INTERACTION ---------------------------------------

  /**
   * Redirect to the institution crud page
   * @param institutionId string : the institution id
   */
  private viewInstitution(institutionId : string){
    var path = this.router.url.replace(
      /logistics\/route\/crud(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?$/i,
      "data/site/crud/"+institutionId
    );
    window.open(path);
    // To make sure tooltips are closed
    this.updateMap(false);
  }

  /**
   * Redirect to the HR crud page
   * @param hrId string : the hr id
   */
  private viewHR(hrId : string){
    // To make sure tooltips are closed
    this.updateMap(false);
    var path = this.router.url.replace(
      /logistics\/route\/crud(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?(\/[0-9a-zA-Z-]*)?$/i,
      "data/hr/crud/"+hrId
    );
    window.open(path);
  }

  /**
   * To be called in case of a click in a tooltip
   * @param event
   */
  handleTooltipClick(event: L.MouseEvent){
    if(event.originalEvent.target.className.indexOf('link-to-institution')>=0){
      this.viewInstitution(event.originalEvent.target.id)
    }
    if(event.originalEvent.target.className.indexOf('link-to-hr')>=0){
      this.viewHR(event.originalEvent.target.id)
    }
  }

    /**
   * Tell whether a marker event concerned a marker or the associated tooltip
   * @param event L.MouseEvent : the mouse event
   * @return boolean : whether the event targeted the marker or the tooltip
   */
  private tooltipEvented(event: L.MouseEvent){
    var bClickedInTooltip = false;
    if(event.originalEvent.path!=undefined){
      for(let item of event.originalEvent.path){
        if(item.className!=undefined && item.className.indexOf!=undefined){
          if(item.className.indexOf('leaflet-tooltip')>=0){
            bClickedInTooltip= true;
            break;
          }
        }
      }
    }
    return bClickedInTooltip;
  }

  /**
   * Add a click event handler to a marker and to its tooltip
   * @param newMarker : the clicked marker
   * @param callback : the function to call in case of marker click
   * @param params : the list of parameters to pass to the callback
   * @param context : the execution context (usually set to this)
   */
  private addClickEvent(newMarker,callback,params,context){
    newMarker.on('click',function(e){
      if(context.tooltipEvented(e)){
        context.handleTooltipClick(e);
      }
      else{
        if(callback!=undefined){
          callback.apply(context, params)
          context.updateMap(false);
        }
      }
    },context);
  }

  /**
   * Add a mouse enter event handler to a marker and to its tooltip (event called mouseover in Leaflet)
   * @param newMarker : the entered marker
   */
  private addMouseOverEvent(newMarker){
    newMarker.on('mouseover',function(e){
      if(this.tooltipEvented(e)){
        newMarker.mouseOnTooltip=true;
        // When hovering over the tooltip, remove the mouseover event because sometimes mouseover event keeps firing at every
        //   mousemove (possible bug ?). One drawback is that we will have to activate agaain the mouseover later
        newMarker.off('mouseover')
      }
      else{
        e.target.openTooltip();
      }
    },this);
  }

  /**
   * Short cut that closes a tooltip and reactivate the mouseover handler
   * @param newMarker : marker for which we need close the tooltip
   */
  private closeTooltip(newMarker){
    newMarker.closeTooltip();
    // Add mouse over event again (see remark in addMouseOverEvent)
    this.addMouseOverEvent(newMarker);
  }

  /**
   * Add a mouse leave event handler to a marker and to its tooltip (event called mouseout in Leaflet)
   * @param newMarker : the left marker
   */
  private addMouseOutEvent(newMarker){
    newMarker.on('mouseout',function(e){
      if(this.tooltipEvented(e)){
        newMarker.mouseOnTooltip=false;
        this.closeTooltip(newMarker);
      }
      else{
        // reopen tooltip (override Leaflet default behavior)
        e.target.openTooltip();
        // plan tooltip closing in a few milliseconds, the time to move the mouse over the tooltip
        var that =this
        setTimeout(function(){
          if(!newMarker.mouseOnTooltip){
            that.closeTooltip(newMarker);
          }
        },100);
      }
    },this);
  }

  // --------------- ROUTE AND POI DISPLAY ON MAP ---------------------------------------

  /**
   * Convert the coordinates embeded into the the POI objet into coordinates that can be used by leaflet.
   * A random offset is added to the map-rendered location so as to avoid having 2 points on the same location
   * @param coordinates:number[] : the input coordinates
   * @return LatLng[] : array of coordinates in LatLng format
   */
  private coordsToLatLng(coordinates:number[]){
    //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
    var coordsAsLatLng = L.GeoJSON.coordsToLatLng(coordinates);
    // Add a random offset in [-0.000015;-0.0000075[ or in ]0.000075;-0.000015[ degrees in latitude
    //  (approximatively between 1.2 and 0.6 meters)
    var latRandomFactor = Math.random();
    if(latRandomFactor<0.5){
      latRandomFactor-=1
    }
    coordsAsLatLng.lat += 0.000015*latRandomFactor;
    // Add a random offset in [-0.00001;-0.000005[ or in ]0.00005;-0.00001[ degrees in longitude
    //  (approximatively between 1.2 and 0.6 meters)
    var lngRandomFactor = Math.random();
    if(lngRandomFactor<0.5){
      lngRandomFactor-=1
    }
    coordsAsLatLng.lng += 0.00001*lngRandomFactor;
    return coordsAsLatLng;
  }

  /**
   * Display a home POI on the map
   * @param POI : TransportPOI : a POI to be displayed
   */
  displayHomePOI(POI : TransportPOI){
    if(POI.geom !=null){
      // Since POI is obtained by copying input data, it may not have a getPNGIcon available
      // So we explicitely created a TransportPOI object for that
      var tempPOI = new TransportPOI();
      tempPOI.copyFromPOI(POI);
      var label = this.routes.getMarkerLabel(POI);
      var coordinates = this.coordsToLatLng(POI.geom.coordinates);
      var color = tempPOI.getColor(this.institutions);
      var newMarker;
      var tooltipOffset=[7,0];
      if(!this.routes.isSelected(POI)){
        // Style for POIs that are not associated with a route
        newMarker = L.marker(coordinates, {icon: tempPOI.getSVGIcon(color,false)});
        this.addClickEvent(newMarker,this.addPOI,[POI],this);
      }
      else{
        // Style for POIs that are associated with at least a route
        if(this.routes.isInCurrentRoute(POI)){
          // style for a POI that is associated to the current route
          tooltipOffset=[17,-22];
          newMarker = L.marker(coordinates,{icon:tempPOI.getFAIcon(color)});
          this.addClickEvent(newMarker,this.removePOI,[this.routes.getCurrentRoute(),POI],this);
          this.addRouteIndex(POI,coordinates);
        }
        else{
          // style for a POI that is associated to another route
          newMarker = L.marker(coordinates,{icon: tempPOI.getSVGIcon(color,true)});
          this.addClickEvent(newMarker,this.addPOI,[POI],this);
        }
      }
      if(newMarker!=undefined){
        // Keep into memory the poi ID (makes easier to retrieve POI from marker)
        newMarker.poiId=POI.id;
        newMarker.bindTooltip(label,{permanent:false,interactive:true,offset:tooltipOffset,direction:'right',opacity:1});
        this.addMouseOverEvent(newMarker);
        this.addMouseOutEvent(newMarker);
        this.POILayer.addLayer(newMarker);
      }
    }
  }

  /**
   * Display the route index on the map, as a divIcon.
   * @param POI TransportPOI : a POI
   * @param coordinates : the coordinates of the POI
   */
  private addRouteIndex(POI : TransportPOI,coordinates){
    var currentIndex = this.routes.getIndexInCurrentRoute(POI);
    if(currentIndex.iIndex!=undefined){
      var indexLabel = L.divIcon({
        // the class name is either route-index if no error, or route-index-error, route-index-warning or 
        //   route-index-info according to the error level
        className: 'route-index'+(currentIndex.sLevel==""?"":"-"+(currentIndex.sLevel.toLowerCase())),
        html:currentIndex.iIndex+1});
      var labelMarker = L.marker(coordinates, {icon: indexLabel})
      this.POILayer.addLayer(labelMarker);
    }
  }

  /**
   * Display the POIs on map. We can do that only when map is ready and POIs + routes are available
   * @param bWithMapCentering boolean : whether to trigger map recentering or not
   */
  private displayPOIs(bWithMapCentering: boolean){
    var style;
    // Display the POIs corresponding to active transporters.
    if(this.transporters && this.TransporterLayer){
      this.TransporterLayer.clearLayers();
      style = {icon:new FontAwesomeIcon({icon:faShuttleVan,iconColor:'black',markerColor:'beige'})};
      for(let transporter of this.transporters){
        if(transporter.poi_geom != undefined && transporter.poi_geom !=null){
          var coordinates=this.coordsToLatLng(transporter.poi_geom.coordinates);
          this.TransporterLayer.addLayer(
            new L.marker(coordinates,style).bindTooltip(transporter.label,{permanent:false,offset:[17,-22],direction:'right'})
          );
        }
      }
    }
    // Display the POIs stored in this.POIs
    if(this.POIs && this.POILayer && this.routes){
      this.POILayer.clearLayers();
      for(let POI of this.POIs.list){
        this.displayHomePOI(POI);
      }
    }
    // Display the institution POIs
    if(this.InstitutionLayer){
      this.InstitutionLayer.clearLayers();
      for(let institution of this.institutions){
        if(institution.poi_geom != undefined && institution.poi_geom !=null){
          // Find the right color for the institution marker
          var tempPOI = new TransportPOI();
          tempPOI.copyFromInstitution(institution);
          var label = this.routes.getMarkerLabel(tempPOI);
          style = {icon:new FontAwesomeIcon({icon:faHospital,markerColor:tempPOI.getColor(this.institutions)})};
          var coordinates= this.coordsToLatLng(institution.poi_geom.coordinates);
          var newMarker = new L.marker(coordinates,style);
          newMarker.bindTooltip(label,{permanent:false,interactive:true,offset:[17,-22],direction:'right'})
          this.addMouseOverEvent(newMarker);
          this.addMouseOutEvent(newMarker);
          this.addClickEvent(newMarker,undefined,[],this);
          this.InstitutionLayer.addLayer(newMarker)
          this.addRouteIndex(tempPOI,coordinates);
        }
      }
    }
    if(bWithMapCentering){
      this.centerMap();
    }
  }

  /**
   * Compute a spherical distance in meters
   * @param coordinate1 array [lon,lat]
   * @param coordinate2 array [lon,lat]
   * @return float spherical distance in meters
   */
  sphericalDistance(coordinate1,coordinate2){
    var lat1=coordinate1[1]*Math.PI/180;
    var lon1=coordinate1[0]*Math.PI/180;
    var lat2=coordinate2[1]*Math.PI/180;
    var lon2=coordinate2[0]*Math.PI/180;
    return 6378137*Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon2-lon1))
  }

  /**
   * Assuming a Tomtom or OSRM route with a legs field and a geometry field, break the input coordinates array
   *    into an array of legs : 
   * Example : [[lon,lat],...,[lon,lat]] will become [[[lon,lat],...,[lon,lat]],...,[[lon,lat],...,[lon,lat]]]
   * @param route Tomtom or OSRM route
   * @return array of legs, where a let is an array of coordinates
   */
  breakIntoLegs(route){
    // Array of resulting legs
    var aResult=[];
    var currentLeg=[];
    var index=0;
    // In order to cut the routes into legs, we rely on the legs array that is returned by both TomTom and OSRM
    // This legs array gives the number of legs in the route and the length (distance) of each leg
    for(var j=0;j<route.legs.length;j++){
      var currentLegLength=0;
      // Find where to cut the route so that resulting route section has the same length as the current leg
      for(var i=index;i<route.geometry.coordinates.length;i++){
        if(i>0){
          // We can compute the distance only when a previous coordinate is available
          currentLegLength +=this.sphericalDistance(
            route.geometry.coordinates[i-1],
            route.geometry.coordinates[i]
          )
        }
        currentLeg.push(route.geometry.coordinates[i]);
        // Stop the iterations in the route coordinates when the sum of the distance is greater
        //   than the current leg length (approximative cut, in fact it could be more precise to
        //   cut the route at i-1 in some cases). For the last leg, we use no break.
        if(currentLegLength>route.legs[j].distance && j<route.legs.length-1){
          // It is not worth displaying legs that contains 0 or 1 coordinates
          if(currentLeg.length>1){
            aResult.push(currentLeg)
          }
          currentLeg=[];
          index=i;
          break;
        }
      }
    }
    if(currentLeg.length>1){
      aResult.push(currentLeg)
    }
    return aResult;                
  }

  /**
   * Call the router for a route and display the results.
   */
  displayRoutes(){
    this.RouteLayer.clearLayers();
    for(let currentRoute of this.routes.list){
      if(currentRoute!=undefined && currentRoute.POIs.length>0 && currentRoute.bDisplay){
        if(currentRoute.directions.routes == undefined){
          // No cache available : we call the directions service
          if(currentRoute.POIs!=undefined && currentRoute.POIs.length>1){
            // clear current values
            currentRoute.clearDirections();
            this.RouteService.directions(currentRoute.POIs,this.timeSlotId,currentRoute.start_hr,currentRoute.end_hr).subscribe(result => {
              // Set a cache for the route
              currentRoute.setDirections(result);
              if(result!=undefined && result!=null && result.routes !=undefined && result.routes !=null && result.routes.length>0){
                // Cut the route into legs to apply a different style to the empty / loaded parts of the routes
                var legs = this.breakIntoLegs(result.routes[0]);
                for(var i=0;i<legs.length;i++){
                  var coordinates = L.GeoJSON.coordsToLatLngs(legs[i],0);                  
                  // In case of a leg with no passengers, change the route display : white line with colored border
                  if(currentRoute.load[i].after.length==0){
                    this.RouteLayer.addLayer(new L.polyline(coordinates,{color:currentRoute.color,weight:4,dashArray:"5,5"}));
                    this.RouteLayer.addLayer(new L.polyline(coordinates,{color:'white',weight:2,opacity:0.7}));
                  }
                  else{
                    this.RouteLayer.addLayer(new L.polyline(coordinates,{color:currentRoute.color}));
                  }
                }
              }
            });
          }
        }
        else{
          // Reuse cache
          var coordinates = L.GeoJSON.coordsToLatLngs(currentRoute.directions.routes[0].geometry.coordinates,0);
          this.RouteLayer.addLayer(new L.polyline(coordinates,{color:currentRoute.color}));
        }
      }
    }
  }

  /**
   * Update the map display
   * @param bWithMapCentering boolean : whether to trigger map recentering or not
   */
  private updateMap(bWithMapCentering: boolean){
    this.displayRoutes()
    this.displayPOIs(bWithMapCentering);
  }

  // --------------- INTERACTION WITH POIS ---------------------------------------

  /**
   * Add a POI to the current route after a map event (click or selection by lasso)
   * @param POI TransportPOI : the POI to be added to the current route
   */
  private addPOI(POI : TransportPOI){
    // Select is activated only when form is valid
    if(this.POISelectionEnabled && this.routes.currentRouteId!="" && this.routes.currentRouteId!=null){
      // Make sure that the institutions list is set on the POI
      if(POI.institutions==undefined){
        POI.institutions = this.POIs.getPOIInstitutions(POI.id);
      }
      // Add the POI to the current route
      this.routes.addPOI(POI);
      this.routePOIsChange.emit();
    }
  }

  /**
   * Remove a POI from a route
   * @param route Route : the route the POI belongs to
   * @param POI RoutePOI: the POI to be removed from the route
   */
  private removePOI(route : Route ,POI : RoutePOI){
    route.deletePOI(POI);
    this.routePOIsChange.emit();
  }

  // --------------- INTERACTION WITH MAP ---------------------------------------

  /**
   * Center the map on all available features.
   */
  centerMap(){
    var allFeatures = new L.FeatureGroup();
    allFeatures.addLayer(this.POILayer);
    allFeatures.addLayer(this.RouteLayer);
    allFeatures.addLayer(this.InstitutionLayer);
    allFeatures.addLayer(this.TransporterLayer);
    var bounds = allFeatures.getBounds();
    // In case no poi and no aoi are available, bounds may not be valid.
    if(bounds.isValid()){
      this.map.fitBounds(bounds,{maxZoom:16});
    }
  }

  /**
   * Function called after DOM completion.
   * Create a leaflet map
   */
  ngOnInit() {
    // Key to access mapbox data
    this.MapLeafletService.getMapboxAccessToken().subscribe(response => {
      var mapConfig = (response.data as MapLeafletConfig);
      L.mapbox.accessToken = mapConfig.mapBoxKey;
      this.baseLayers = {
        'Rues': L.mapbox.tileLayer('willylambert.ig7ac2k2'),
        // We do not add the attribution since we are using mapbox-gl that displays automatically a OSM attribution
        'OSM': L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png'),
        'Satellite' : L.mapbox.tileLayer('willylambert.ig7a2pb9'),
        'Nuit' : L.mapbox.tileLayer('willylambert.np094ng9')
      };
      this.defaultLayerName="Rues";
      // Creating a map with mapbox.js constructor. This enables to load tiles that were prepared under mapbox tile
      //   creation tool.
      // Getting rid of mapbox is still possible, using leaflet constructor instead : this.map = L.map('mapid').
      // Base layer id is left undefined since it will be specified later
      this.map = L.mapbox.map('mapid',undefined,{
        maxZoom: mapConfig.maxZoom,
        bounceAtZoomLimits:false,
        center: new L.LatLng(mapConfig.lat,mapConfig.lon),
        zoom: mapConfig.zoom
      });
      // Add the feature layers
      this.map.addLayer(this.POILayer);
      this.map.addLayer(this.RouteLayer);
      this.map.addLayer(this.InstitutionLayer);
      this.map.addLayer(this.TransporterLayer);
      this.updateMap(true);
      // Insert the layers control to the map
      L.control.layers(this.baseLayers, this.overlays,{collapsed:true,position:'topright'}).addTo(this.map);
      // Add a geocoder control
      this.MapLeafletService.getEtalabGeocoder().addTo(this.map)
      // Set the default base layer
      this.baseLayers[this.defaultLayerName].addTo(this.map);
    })
  }

  /**
   * Make sure map will fit the frame
   */
  ngAfterViewInit(){
    setTimeout( () => {if(this.map){this.map.invalidateSize();}} );
  }

  /**
   * Function triggered on any data change.
   * We avoid relying on change detection in arrays since this may be ressource consuming
   * @param changes : list of changed objects
   */
  ngOnChanges(changes: SimpleChanges) {
    if(changes.updateMapCount && !changes.updateMapCount.firstChange){
      this.updateMap(false);
    }
    if(changes.updateMapWithRecenteringCount && !changes.updateMapWithRecenteringCount.firstChange){
      if(this.map != undefined){
        // Apply recentering only if map is defined
        this.updateMap(true);
      }
    }
    if(changes.routesDisplayCount && !changes.routesDisplayCount.firstChange){
      this.displayRoutes();
    }
  }

  // --------------- MULTI SELECT HANDLING ---------------------------------------

  /**
   * Toggle multi select
   */
  toggleMultipleSelect(){
    if(!this.options.multipleSelect){
      this.disableMultiSelect();
    }
    else{
      this.enableMultiSelect();
    }
  }

  /**
   * Enable multiselection of markers by free-form drawing
   */
  enableMultiSelect() {
    this.map.on('mousedown', this.onMouseDown, this);
    this.map.on('mouseup', this.onMouseUp, this);
    const mapContainer = this.map.getContainer();
    mapContainer.style.cursor ='crosshair'
    mapContainer.style.userSelect = 'none';
    mapContainer.style.msUserSelect = 'none';
    (mapContainer.style as any).mozUserSelect = 'none'; // missing typings
    mapContainer.style.webkitUserSelect = 'none';
    this.map.dragging.disable();
  }

  /**
   * Disable multiselection of markers by free-form drawing and reset default map behavior
   */
  disableMultiSelect(){
    this.map.off('mousedown', this.onMouseDown, this);
    this.map.off('mousemove', this.onMouseMove, this);
    this.map.off('mouseup', this.onMouseUp, this);
    const mapContainer = this.map.getContainer();
    mapContainer.style.cursor = '';
    mapContainer.style.userSelect = '';
    mapContainer.style.msUserSelect = '';
    (mapContainer.style as any).mozUserSelect = ''; // missing typings
    mapContainer.style.webkitUserSelect = '';
    this.map.dragging.enable();
  }

  /**
   * Handle Mouse down events when the multi select is activated : start drawing a lasso polygon
   * @param event LeafletEvent : a mouve down event
   */
  onMouseDown(event: LeafletEvent) {
    const event2 = event as LeafletMouseEvent;
    this.lassoPolygon = L.polygon([event2.latlng],{ color: '#00C3FF', weight: 2 }).addTo(this.map);
    this.map.on('mousemove', this.onMouseMove, this);
  }

  /**
   * Handle Mouse move events when the multi select is activated : continue the lasso polygon drawing
   * @param event LeafletEvent : a mouve move event
   */
  onMouseMove(event: LeafletEvent) {
    if (!this.lassoPolygon) {
      return;
    }
    const event2 = event as LeafletMouseEvent;
    this.lassoPolygon.addLatLng(event2.latlng);
  }

  /**
   * Handle Mouse up events when the multi select is activated : ends the lasso polygon drawing
   * @param event LeafletEvent : a mouve move event
   */
  onMouseUp() {
    if (!this.lassoPolygon) {
      return;
    }
    // toggle the POIs selection if some POIs fall within the lasso polygon
    this.togglePOIs(this.lassoPolygon);
    this.updateMap(false);
    this.map.removeLayer(this.lassoPolygon);
    this.lassoPolygon = undefined;
    // get back to single selection mode
    this.options.multipleSelect = false;
    this.toggleMultipleSelect();
  }

  /**
   * If a POI is within the input polygon, add or remove it from current route according to POI state and user settings
   * @param polygon L.Polygon : a polygon
   */
  togglePOIs(polygon: L.Polygon) {
    const lassoPolygonGeometry = polygon.toGeoJSON().geometry;
    // Gather each available layer
    const layers: L.Layer[] = [];
    this.map.eachLayer((layer: L.Layer) => {
      if (layer === this.lassoPolygon) {
        return;
      }
      if (L.MarkerCluster && layer instanceof L.MarkerCluster) {
        layers.push(layer.getAllChildMarkers());
      } else {
        layers.push(layer);
      }
    });
    // Avoid treating 2 times the same POI that could be represented by several markers
    var treatedPOIIds = [];
    // Check each layer of circleMarker type or marker type
    layers.filter(layer => {
      if(treatedPOIIds.indexOf(layer.poiId)<0 && (layer instanceof L.CircleMarker || layer instanceof L.Marker)) {
        treatedPOIIds.push(layer.poiId);
        const layerGeometry = layer.toGeoJSON().geometry;
        if(booleanPointInPolygon(layerGeometry, lassoPolygonGeometry)){
          // POI is in the input polygon.
          var bFound=false;
          for(let route of this.routes.list){
            if(route.routeId==this.routes.currentRouteId){
              for(let POI of route.POIs){
                if(POI.id==layer.poiId && this.options.unselect){
                  // POI is in the current route and unselection mode is activated : remove that POI from current route
                  this.removePOI(route,POI);
                  bFound = true;
                }
              }
            }
          }
          if(!bFound){
            // If the POI does not belong any route, add it to the current route
            for(let POI of this.POIs.list){
              if(POI.id==layer.poiId){
                if(!this.routes.isSelected(POI) && this.options.select){
                  // POI is not in the current route yet and selection mode is activated : add that POI to current route
                  bFound=true;
                  this.addPOI(POI);
                }
              }
            }
          }
          if(!bFound){
            // If the POI belongs to a route that is not the current route, add it to the current route
            for(let route of this.routes.list){
              if(route.routeId!=this.routes.currentRouteId){
                for(let POI of route.POIs){
                  if(POI.id==layer.poiId && this.options.select){
                    // POI is not in the current route and selection mode is activated : add that POI to current route
                    this.addPOI(POI);
                  }
                }
              }
            }
          }
        }
      }
    });
  }
}
