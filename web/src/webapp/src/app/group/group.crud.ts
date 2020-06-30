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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { NgbDateFRParserFormatter } from "../helpers/ngb-date-fr-parser-formatter"
import {GridOptions} from "ag-grid-community";

// Mapbox.js library extends Leaflet library , so we do not have to include Leafet library
import * as L from 'mapbox.js';
import { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

import { MapLeafletService } from '../map-leaflet/map-leaflet.service';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';
import { faHome,faHospital } from '@fortawesome/free-solid-svg-icons';

import { POI } from '../poi/poi';
import { BaseCrud } from '../basecrud';
import { Group } from './group';
import { GroupService } from './group.service';
import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { DemandService } from '../demand/demand.service';
import { Demand } from '../demand/demand';
import { RouteToolbarOptions } from '../route-toolbar/route-toolbar';
import { MapLeafletConfig } from '../map-leaflet/map-leaflet';

@Component({
  templateUrl: './group.crud.html',
  styleUrls: ['./group.scss'],
  providers: [{provide: NgbDateParserFormatter, useClass: NgbDateFRParserFormatter}]
})
export class GroupCrud extends BaseCrud implements OnInit  {

  // Override type defined in parent class so that we can access currentRecord fields from within that class
  currentRecord : Group;

  // The maps
  map : L.Map;

  // The layer that will contain points to draw on the map input list
  POILayer : L.FeatureGroup;

  // Available base layers.
  baseLayers:object;

  // Available overlay layers
  overlays:object;

  // Default base layer name (the one displayed at map opening and the one ticked in base layer selector control)
  defaultLayerName:string;

  public gridOptions: GridOptions;
  public gridOptionsView: GridOptions;

  // The list of all existing demands
  demands : Demand[];

  // multiseclection options
  options:RouteToolbarOptions;

  // polygon that enable the marker multi selection.inspired by leaflet-lasso plugin
  lassoPolygon : L.Polygon;

  constructor(
    private route: ActivatedRoute,
    protected router: Router,
    private groupService:GroupService,
    private thService: ThesaurusService,
    private demandService: DemandService,
    private MapLeafletService: MapLeafletService) {
      // Inject data service - it will be used by parent BaseCrud class
      // to run CRUD actions
      // It populates currentRecord member variable
      super(groupService,thService,router);
      this.options = { multipleSelect: false,select:true,unselect:false,show:false,inRouteMap:false };
      this.POILayer = new L.FeatureGroup();
      // In case some data is loaded or reloaded
      this.dataLoaded.subscribe((currentRecord) => { this.onDataLoaded() });
      // Style for the grid in edit mode
      this.gridOptions = {
        rowHeight:30,
        headerHeight:30,
        columnDefs : [
          {
            headerName: 'Etablissement',
            field: 'site_poi_label_institution',
            valueFormatter:this.formatInstitutionLabel,
            checkboxSelection: true,
            valueGetter: function ( params ) {
              var institutionLabel = "";
              if(params.data.institutionPOI.site_main_label!=undefined &&
                 params.data.institutionPOI.site_main_label!=null &&
                 params.data.institutionPOI.site_main_label!=""){
                institutionLabel+=params.data.institutionPOI.site_main_label;
              }
              return institutionLabel;
            }
          },
          {
            headerName: 'Usager',
            field: 'site_poi_label_hr',
            valueFormatter:this.formatHRLabel,
            valueGetter: function ( params ) {
              var hrLabel = params.data.HRPOI.hr_firstname+" "+params.data.HRPOI.hr_lastname;
              if(params.data.HRPOI.label!=undefined && params.data.HRPOI.label!=null &&
                 params.data.HRPOI.label!=""){
                if(hrLabel!=""){
                  hrLabel+=" ";
                }
                hrLabel+="("+params.data.HRPOI.label+")";
              }
              return hrLabel;
            }
          },
          {
            headerName: 'Début',
            field: 'start_dt',
            valueFormatter : this.formatDate,
            filter: 'agDateColumnFilter'
          },
          {
            headerName: 'Fin',
            field: 'end_dt',
            valueFormatter : this.formatDate,
            filter: 'agDateColumnFilter'
          },
        ]
      } as GridOptions;
      // Style for the grid in view mode
      this.gridOptionsView = {
        rowHeight:30,
        headerHeight:30,
        columnDefs : [
          {
            headerName: 'Etablissement',
            field: 'site_poi_label_institution',
            valueFormatter:this.formatInstitutionLabel,
            valueGetter: function ( params ) {
             var institutionLabel = "";
             if(params.data.institutionPOI.site_main_label!=undefined &&
                params.data.institutionPOI.site_main_label!=null &&
                params.data.institutionPOI.site_main_label!=""){
               institutionLabel+=params.data.institutionPOI.site_main_label;
             }
             return institutionLabel;
            }
          },
          {
            headerName: 'Usager',
            field: 'site_poi_label_hr',
            valueFormatter:this.formatHRLabel,
            valueGetter: function ( params ) {
              var hrLabel = params.data.HRPOI.hr_firstname+" "+params.data.HRPOI.hr_lastname;
              if(params.data.HRPOI.label!=undefined && params.data.HRPOI.label!=null &&
                 params.data.HRPOI.label!=""){
                if(hrLabel!=""){
                  hrLabel+=" ";
                }
                hrLabel+="("+params.data.HRPOI.label+")";
              }
              return hrLabel;
            }
          },
          {
            headerName: 'Début',
            field: 'start_dt',
            valueFormatter : this.formatDate,
            filter: 'agDateColumnFilter'
          },
          {
            headerName: 'Fin',
            field: 'end_dt',
            valueFormatter : this.formatDate,
            filter: 'agDateColumnFilter'
          },
        ]
      } as GridOptions;
      // Load the list of all existing demands
      this.demandService.list({hrMainId:"",bOnlyActiveHRs:true,search:""}).subscribe(demands=>{
        this.demands=demands;
        this.displayPOIs(true)
      });
  }

  /**
   * Ag grid style for the institution POIs labels
   * @param data
   */
  formatInstitutionLabel(data){
    var institutionLabel = "";
    if(data.data.institutionPOI.site_main_label!=undefined && data.data.institutionPOI.site_main_label!=null && data.data.institutionPOI.site_main_label!=""){
      institutionLabel+=data.data.institutionPOI.site_main_label;
    }
    return institutionLabel;
  }

  /**
   * Ag grid style for the HR POIs labels
   * @param data
   */
  formatHRLabel(data){
    var hrLabel = data.data.HRPOI.hr_firstname+" "+data.data.HRPOI.hr_lastname;
    if(data.data.HRPOI.label!=undefined && data.data.HRPOI.label!=null && data.data.HRPOI.label!=""){
      if(hrLabel!=""){
        hrLabel+=" ";
      }
      hrLabel+="("+data.data.HRPOI.label+")";
    }
    return hrLabel;
  }

  formatDate(data){
    return moment(data.value).format("DD/MM/YYYY");
  }

  /**
   * To be called on data loading.
   */
  onDataLoaded(){
    this.displayPOIs(true)
  }

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
   * Get the label to be displayed within the map marker tooltip
   * @param POI TransportPOI : the POI for which we need the marker label
   * @return string : the label for the marker
   */
  getMarkerLabel(demand : Demand) : string{
    var sHTML = "<div class='card'> \
                   <div class='card-header'> \
                     <div style='max-width:300px'> \
                       <button class='link-to-hr btn btn-link' \
                                  id='{{hr_id}}'>{{hr_firstname}} {{hr_lastname}}</button> \
                       </button> \
                     </div> \
                   </div> \
                   <div class='card-body'> \
                     <div> \
                       <button class='link-to-institution btn btn-link' \
                                  id='{{site_main_id}}'>{{site_main_label}} \
                       </button> \
                     </div> \
                   </div> \
                 </div>";
    return sHTML.replace("{{hr_id}}", demand.HRPOI.hr_id)
                .replace("{{hr_firstname}}", demand.HRPOI.hr_firstname)
                .replace("{{hr_lastname}}", demand.HRPOI.hr_lastname)
                .replace("{{site_main_id}}", demand.institutionPOI.site_main_id)
                .replace("{{site_main_label}}", demand.institutionPOI.label);
  }

  /**
   * Get the label to be displayed within the map marker tooltip in case of an institution POI
   * @param POI TransportPOI : the POI for which we need the marker label
   * @return string : the label for the marker
   */
  getInstitutionLabel(institutionPOI : POI) : string{
    var sHTML = "<div class='card'> \
                   <div class='card-header'> \
                     <div style='max-width:300px'> \
                       <button class='link-to-institution btn btn-link' \
                                  id='{{site_main_id}}'>{{site_main_label}} \
                       </button> \
                     </div> \
                   </div> \
                 </div>";
    return sHTML.replace("{{site_main_id}}", institutionPOI.site_main_id)
                .replace("{{site_main_label}}", institutionPOI.label);
  }

  /**
   * Display the POIs on map. We can do that only when both POILayer and POIs are available
   * @param bWithMapCentering boolean : whether to trigger map recentering or not
   */
  private displayPOIs(bWithMapCentering: boolean){
    if(this.POILayer){
      this.POILayer.clearLayers();
      if(this.demands){
        // Display the demands that were not selected yet
        for(let demand of this.demands){
          // Check whether demands is selected or not
          var bSelected =false;
          for(let selectedDemands of this.currentRecord.demands){
            if(selectedDemands.id==demand.id){
              bSelected=true;
              break;
            }
          }
          if(!bSelected && demand.HRPOI && demand.HRPOI.geom !=null){
            // Style for POIs that are not associated with a route
            var style = {radius: 7,color:'black',fillOpacity:0.3,dashArray:"4",weight:2,fillColor:'gray'}
            var newMarker = L.circleMarker(
              this.coordsToLatLng(demand.HRPOI.geom.coordinates), style
            ).bindTooltip(this.getMarkerLabel(demand),{permanent:false,interactive:true,offset:[7,0],direction:'right',opacity:1});
            // Keep into memory the demand (makes easier to retrieve POI from marker)
            newMarker.demand=demand;
            //newMarker.mouseOnTooltip=false;
            this.addClickEvent(newMarker,this.selectDemand,[demand],this);
            this.addMouseOverEvent(newMarker);
            this.addMouseOutEvent(newMarker);
            this.POILayer.addLayer(newMarker);
          }
        }
      }
      if(this.currentRecord && this.currentRecord.demands){
        // Creation of a collection of institution to avoid displaying them twice
        var institutionPOIs = [];
        for(let demand of this.currentRecord.demands){
          var bFound = false;
          for(let institutionPOI of institutionPOIs){
            if(institutionPOI.id == demand.institutionPOI.id){
              bFound=true;
              break;
            }
          }
          if(!bFound){
            institutionPOIs.push(demand.institutionPOI);
          }
        }
        // Display the institutions for the selected demands
        for(let institutionPOI of institutionPOIs){
          if(institutionPOI.geom !=null){
            var newMarker = L.marker(
              this.coordsToLatLng(institutionPOI.geom.coordinates),
              {icon: new FontAwesomeIcon({icon:faHospital,markerColor:'green'})}
            ).bindTooltip(
              this.getInstitutionLabel(institutionPOI),
              {permanent:false,interactive:true,offset:[17,-20],direction:'right'}
            )
            this.addClickEvent(newMarker,undefined,undefined,this);
            this.addMouseOverEvent(newMarker);
            this.addMouseOutEvent(newMarker);
            this.POILayer.addLayer(newMarker);
          }
        }
        // Display the home POIs for the selected demands
        for(let demand of this.currentRecord.demands){
          if(demand.HRPOI.geom !=null){
            var newMarker = L.marker(
              this.coordsToLatLng(demand.HRPOI.geom.coordinates),
              {icon: new FontAwesomeIcon({icon:faHome})}
            ).bindTooltip(
              this.getMarkerLabel(demand),
              {permanent:false,interactive:true,offset:[17,-20],direction:'right'}
            )
            // Keep into memory the demand (makes easier to retrieve POI from marker)
            newMarker.demand=demand;
            this.addClickEvent(newMarker,this.unselectDemand,[demand],this);
            this.addMouseOverEvent(newMarker);
            this.addMouseOutEvent(newMarker);
            this.POILayer.addLayer(newMarker);
          }
        }
      }
      if(bWithMapCentering){
        this.centerMap();
      }
    }
  }

  /**
   * Function to be called on demand selection, whatever the way it is selected
   * @param newDemand
   */
  private selectDemand(newDemand){
    if(this.editMode!='view'){
      // Check that node is not already present in the set of demands
      var bAlreadySelected = false;
      for(let demand of this.currentRecord.demands){
        if(demand.id==newDemand.id){
          bAlreadySelected=true;
          break;
        }
      }
      if(!bAlreadySelected){
        this.currentRecord.demands.push(newDemand);
        this.displayPOIs(false)
        this.displayCheckBoxes();
      }
    }
  }

  /**
   * Function to be called on demand unselection, whatever the way it is unselected
   * @param newDemand
   */
  private unselectDemand(demand) : boolean{
    var bUnselected = false;
    if(this.editMode!='view'){
      for(var i=0;i<this.currentRecord.demands.length;i++){
        if(this.currentRecord.demands[i].id == demand.id){
          this.currentRecord.demands.splice(i,1);
          this.displayPOIs(false);
          this.displayCheckBoxes();
          bUnselected = true;
          break;
        }
      }
    }
    return bUnselected;
  }

  /**
   * Center the map on all available features.
   */
  centerMap(){
    var allFeatures = new L.FeatureGroup();
    allFeatures.addLayer(this.POILayer);
    var bounds = allFeatures.getBounds();
    // In case no poi and no aoi are available, bounds may not be valid.
    if(bounds.isValid() && this.map){
      this.map.fitBounds(bounds,{maxZoom:16});
    }
  }

  /**
   * Called after DOM completion. It will request data from server if an id is found
   */
  ngOnInit() {
    // Load Group
    this.route.params.subscribe(routeParams => {
      super.init(routeParams.id);
      if(routeParams.id==undefined || routeParams.id==""){
        // Data initialization in case this is a new group creation
      }
    });
    // Create map
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
      this.map = L.mapbox.map('mapid',undefined,{
        maxZoom: mapConfig.maxZoom,
        bounceAtZoomLimits:false,
        center: new L.LatLng(mapConfig.lat,mapConfig.lon),
        zoom: mapConfig.zoom
      });
      // Add the feature layers (generic layers gathering layers of the same type (markers, polygons))
      this.map.addLayer(this.POILayer);
      // In case map is ready after data arrival, we need to displayPOIs again
      this.displayPOIs(true);
      // Insert the layers control to the map
      L.control.layers(this.baseLayers, this.overlays,{collapsed:true,position:'topright'}).addTo(this.map);
      // Add a geocoder control
      this.MapLeafletService.getEtalabGeocoder().addTo(this.map)
      // Set the default base layer
      this.baseLayers[this.defaultLayerName].addTo(this.map)
    })
  }

  /**
   * Fit the map to its html container
   */
  ngAfterViewInit(){
    setTimeout( () => {if(this.map){this.map.invalidateSize();}} );
  }

  /**
   * Called when grid is ready
   * @param params sent by the grid
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
    this.displayCheckBoxes();
  }

  /**
   * Make sur the check boxes display is up-to-date.
   * To be called every time this.selectedPOI is updated from outside the ag-grid
   */
  displayCheckBoxes(){
    // Test wether grid is ready or not
    if(this.gridOptions.api){
      this.gridOptions.api.forEachNode(node=> {
        var bIsSelected = false;
        for(let demand of this.currentRecord.demands){
          if(demand.id==node.data.id){
            bIsSelected=true;
            break;
          }
        }
        node.setSelected(bIsSelected);
      });      
    }    
  }

  /**
   * Called on selection by a click in the ag grid.
   * @param event : A ag grid selection event
   */
  onSelected(event){
    if(event.node.selected){
      this.selectDemand(event.data);
    }
    else{
      this.unselectDemand(event.data);
    }
  }

  // --------------- MAP TOOLTIP INTERACTION ---------------------------------------

  /**
   * Redirect to the institution crud page
   * @param institutionId string : the institution id
   */
  private viewInstitution(institutionId : string){
    var path = this.router.url.replace(/logistics\/group\/crud\/.*$/i, "data/site/crud/"+institutionId);
    window.open(path);
    // To make sure tooltips are closed
    this.displayPOIs(false)
  }

  /**
   * Redirect to the HR crud page
   * @param hrId string : the hr id
   */
  private viewHR(hrId : string){
    // To make sure tooltips are closed
    this.displayPOIs(false)
    var path = this.router.url.replace(/logistics\/group\/crud\/.*$/i, "data/hr/crud/"+hrId);
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
        callback.apply(context, params)
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
        layers.push(...layer.getAllChildMarkers());
      } else {
        layers.push(layer);
      }
    });
    // Avoid treating 2 times the same demand that could be represented by several markers
    var treatedDemandIds = [];
    // Check each layer of circleMarker type or marker type
    layers.filter(layer => {
      if(layer.demand && treatedDemandIds.indexOf(layer.demand.id)<0 && (layer instanceof L.CircleMarker || layer instanceof L.Marker)) {
        treatedDemandIds.push(layer.demand.id);
        const layerGeometry = layer.toGeoJSON().geometry;
        if(booleanPointInPolygon(layerGeometry, lassoPolygonGeometry)){
          // Demand HR POI is in the lasso polygon
          var bFound=false;
          if(this.options.unselect){
            bFound = this.unselectDemand(layer.demand);
          }
          if(!bFound && this.options.select){
            this.selectDemand(layer.demand);
          }
        }
      }
    });
  }


}
