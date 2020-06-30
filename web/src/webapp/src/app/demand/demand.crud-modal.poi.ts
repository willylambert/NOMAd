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

import { Component,Input,OnInit } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {GridOptions} from "ag-grid-community";

import { POIService } from '../poi/poi.service';
import { MapLeafletService } from '../map-leaflet/map-leaflet.service';
import { POI,TransportPOI } from '../poi/poi';
import { Site } from '../site/site';
import { HR } from '../hr/hr';

import * as L from 'mapbox.js';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faHospital } from '@fortawesome/free-solid-svg-icons';
import { MapLeafletConfig } from '../map-leaflet/map-leaflet';


@Component({
  templateUrl: './demand.crud-modal.poi.html',
  styleUrls: ['./demand.crud-modal.poi.scss']
})
export class DemandCrudModalPOI  implements OnInit {

  // Site type, can be 'HOME' or 'INSTITUTION'
  @Input('siteType') siteType: string;
  // The institution site id, in case the institution poi is already chosen
  @Input('institution') institution: Site;
  // The HR id, in case the HR poi is already chosen
  @Input('HR') HR: HR;
  // The selected POI
  @Input('selectedPOI') selectedPOI : POI;
  // Tell whether the provided data is likely to be non-consistent (selectedPOI vs institution / HR filter)
  @Input('bConflict') bConflict : boolean;

  // The leaflet map
  map : L.Map;

  // The layer that will contain features stored in POIs input list
  POILayer : L.FeatureGroup;

  // The selected POI layer (will contain only one marker)
  SelectedPOILayer : L.FeatureGroup;

  // Available base layers.
  baseLayers:object;

  // Available overlay layers
  overlays:object;

  // Default base layer name (the one displayed at map opening and the one ticked in base layer selector control)
  defaultLayerName:string;

  // The list of available POIs
  POIs: POI[];

  // A filter to restrict the list of presented POIs
  bFilter : boolean

  // A search pattern that will apply to hr lastname or firstname
  search : string;

  public gridOptions: GridOptions;

  // TODO : replace by a smarter debounce using some rxjs functions like debounceTime
  // Temporary handler for debounce function, to be replaced by some rxjs functions like debounceTime
  debounceCounter : number;

  /**
   * Constructor
   * @param siteService
   * @param activeModal
   */
  constructor(
    private POIService: POIService,
    public activeModal: NgbActiveModal,
    private MapLeafletService:MapLeafletService) {

    this.bFilter=true;

    this.POILayer = new L.FeatureGroup();
    this.SelectedPOILayer = new L.FeatureGroup();

    this.gridOptions = {
      rowHeight:30,
      headerHeight:30,
      columnDefs : [
        {headerName: 'Point', field: 'label', checkboxSelection: true},
        {headerName: 'Adresse', field: 'addr1'},
      ]
    } as GridOptions;
    this.debounceCounter=0;
  }

  /**
   * Function to Be called on search pattern change. Handles POI list update and debounce
   */
  onPatternChange(){
    this.debounceCounter++;
    var that=this;
    setTimeout(function(){
      that.debounceCounter--;
      if(that.debounceCounter==0){
        that.listPOIs();
      }
    },500);
  }

  /**
   * List POIs according to the current filters
   */
  listPOIs(){
    // save the previously selected POI so as to restore it after POI loading if possible
    var previousSelectedPOI = this.selectedPOI
    if(this.siteType=='INSTITUTION'){
      this.POIService.list({
        siteId:"",
        siteType:this.siteType,
        hrId:(this.bFilter&&this.HR)?this.HR.id:"",
        siteStatus:"ENABLED"
      }).subscribe((POIs) => {
        this.onNewPOIs(POIs,previousSelectedPOI);
      });
    }
    else{
      this.POIService.listTransportPOIs((this.bFilter&&this.institution)?[this.institution]:[],this.search,true).subscribe((POIs) => {
        this.onNewPOIs(POIs,previousSelectedPOI);
      })
    }
  }

  /**
   * Function called when new POIs are received from server
   * @param newPOIs POI[] : the list of new POIs
   * @param previousSelectedPOI POI : the previously selected POI (may be undefined)
   */
  onNewPOIs(newPOIs : POI[],previousSelectedPOI : POI){
    for(let POI of newPOIs){
      POI.selected=false;
      var label = "";
      if(POI.site_type_code=='HOME'){
        var transportPOI : TransportPOI = POI as TransportPOI;
        label += transportPOI.hr_firstname+" "+transportPOI.hr_lastname;
      }
      else{
        if(POI.site_main_label!=null && POI.site_main_label!=undefined){
          label+=POI.site_main_label;
        }
      }
      if(label!=""){
        label+=" ";
      }
      if(POI.label!=null && POI.label!=undefined){
        label+="("+POI.label+")";
      }
      POI.label = label;
      POI.addr1=this.formatAddress(POI);
    }
    this.POIs=newPOIs;
    // In case a POI was already selected, check wether the POI is still in the selection
    if(previousSelectedPOI){
      this.selectedPOI = undefined;
      for(let POI of this.POIs){
        if(POI.id==previousSelectedPOI.id){
          this.selectedPOI=previousSelectedPOI;
          break;
        }
      }
      this.displayCheckBoxes();
    }
    this.displayPOIs(true)
  }

  /**
   * Toggle the main filter and update the list of POIs accordingly
   * @param newValue boolean : new filter state (active or unactive)
   */
  toggleFilter(newValue){
    if(newValue!=this.bFilter){
      this.bFilter=newValue;
      this.listPOIs();
    }
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
   * Compute an address for a site by concatenating the site address subfields
   * @param site a site for which we need to compute the address in one field
   * @return string : the address for the site
   */
  public formatAddress(POI){
    var address = "";
    if(POI.addr1!=null){
      address+= POI.addr1
    }
    if(POI.addr2!=null){
      if(address!=''){
        address+=' - ';
      }
      address+= POI.addr2
    }
    if(POI.postcode!=null){
      if(address!=''){
        address+=' ';
      }
      address+= POI.postcode
    }
    if(POI.city!=null){
      if(address!=''){
        address+=' ';
      }
      address+= POI.city
    }
    return address;
  }

  /**
   * Make sur the check boxes display is up-to-date.
   * To be called every time this.selectedPOI is updated from outside the ag-grid
   */
  displayCheckBoxes(){
    // Test wether grid is ready or not
    if(this.gridOptions.api){
      this.gridOptions.api.forEachNode(node=> {
        node.setSelected(this.selectedPOI ? node.data.id == this.selectedPOI.id : false);
      });
      // Make sure the selected POI is always visible in the grid (scroll and move to the right page)
      this.gridOptions.api.forEachNode(node=> {
        if(node.isSelected()){
          this.gridOptions.api.ensureIndexVisible(node.rowIndex);
        }
      })
    }
  }

  /**
   * Triggered on selection from grid
   */
  onSelected(){
    // Compute the new value for this.selectedPOI
    this.selectedPOI = undefined;
    this.gridOptions.api.forEachNode(node=> {
      if(node.isSelected()){
        this.selectedPOI = node.data;
      }
    })
    // Compute the new value for this.POIs
    for(let POI of this.POIs){
      POI.selected = this.selectedPOI ? POI.id == this.selectedPOI.id : false;
    }
    // Update display
    this.displayPOIs(false)
  }

  /**
   * Triggered on selection from map
   */
  onPOIClicked(event){
    // Compute the new value for this.selectedPOI and for this.POIs
    this.selectedPOI = undefined;
    for(let POI of this.POIs){
      if(POI.id==event.target.poiId){
        POI.selected=!POI.selected;
        if(POI.selected){
          this.selectedPOI = POI;
        }
      }
    }
    // Update display
    this.displayCheckBoxes();
    this.displayPOIs(false)
  }

  /**
   * Triggered on "Valider" button click
   */
  saveModal() {
    // Send the selected POI as a response
    this.activeModal.close(this.selectedPOI);
  }

  /**
   * Display the POIs on map. We can do that only when both map and POIs are available
   * @param bWithMapCenter boolean : whether to center the map on the whole point set
   */
  private displayPOIs(bWithMapCenter : boolean){
    if(this.POIs && this.POILayer){
      this.POILayer.clearLayers();
      this.SelectedPOILayer.clearLayers();
      // First paint the non selected POIs
      for(let POI of this.POIs){
        if(POI.geom !=null && !POI.selected){
          //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
          var coordinates = L.GeoJSON.coordsToLatLng(POI.geom.coordinates);
          var newMarker = L.circleMarker(coordinates, {opacity:0.3})
                         .bindTooltip(POI.label,{permanent:false,offset:[10,0],direction:'right'})
                         .on('click',this.onPOIClicked,this);
          newMarker.poiId=POI.id;
          this.POILayer.addLayer(newMarker);
        }
      }
      // Then paint the selected POI if any
      for(let POI of this.POIs){
        if(POI.geom !=null && POI.selected){
          //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
          var coordinates = L.GeoJSON.coordsToLatLng(POI.geom.coordinates);
          var icon;
          if(POI.site_type_code=='HOME'){
            icon = new FontAwesomeIcon({icon:faHome,markerColor:'green'});
          }
          else{
            icon = new FontAwesomeIcon({icon:faHospital,markerColor:'green'});
          }
          var newMarker = L.marker(coordinates, {icon:icon})
                         .bindTooltip(POI.label,{permanent:false,offset:[17,-20],direction:'right'})
                         .on('click',this.onPOIClicked,this);
          newMarker.poiId=POI.id;
          this.SelectedPOILayer.addLayer(newMarker);
        }
      }
      if(bWithMapCenter){
        this.centerMap();
      }
    }
  }

  /**
   * Center the map on all available features.
   */
  centerMap(){
    var allFeatures = new L.FeatureGroup();
    allFeatures.addLayer(this.POILayer);
    allFeatures.addLayer(this.SelectedPOILayer);
    var bounds = allFeatures.getBounds();
    // In case no poi and no aoi are available, bounds may not be valid.
    if(bounds.isValid() && this.map){
      this.map.fitBounds(bounds,{maxZoom:16});
    }
  }

  /**
   * Function called after DOM completion.
   * Create a leaflet map
   */
  ngOnInit() {
    // In case of conflict, do not use the provided filter by default
    this.bFilter=!this.bConflict;
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
      // Getting rid of mapbox is still possible, using leaflet constructor instead : this.map = L.map('mapId').
      // Base layer id is left undefined since it will be specified later
      this.map = L.mapbox.map('mapId',undefined,{
          maxZoom: mapConfig.maxZoom,
          bounceAtZoomLimits:false,
          center: new L.LatLng(mapConfig.lat,mapConfig.lon),
          zoom: mapConfig.zoom
      });
      // Add the feature layers (generic layers gathering layers of the same type (markers, polygons))
      this.map.addLayer(this.POILayer);
      this.map.addLayer(this.SelectedPOILayer);
      // Insert the layers control to the map
      L.control.layers(this.baseLayers, this.overlays,{collapsed:true,position:'topright'}).addTo(this.map);
      // Add a geocoder control
      this.MapLeafletService.getEtalabGeocoder().addTo(this.map)
      // Set the default base layer
      this.baseLayers[this.defaultLayerName].addTo(this.map)
      // Get the list of POIs and display it on map
      this.listPOIs();
    })
  }

  /**
   * To be called so that map displays properly
   */
  ngAfterViewInit(){
    setTimeout( () => {if(this.map){this.map.invalidateSize();}} );
  }
}