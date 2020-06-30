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

import { Component,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Scenario, ScenarioTransportGroup } from './scenario';
import { GridOptions } from 'ag-grid-community';
import { GroupService } from '../group/group.service';
import { Group } from '../group/group';
import { TransportPOI } from '../poi/poi';
import { MapLeafletService } from '../map-leaflet/map-leaflet.service';

import * as L from 'mapbox.js';
import { FontAwesomeIcon } from '../helpers/font-awesome-markers';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import { faHospital } from '@fortawesome/free-solid-svg-icons';
import { MapLeafletConfig } from '../map-leaflet/map-leaflet';

@Component({
  templateUrl: './scenario-modal.group.html',
  styleUrls: ['./scenario.scss']
})
export class ScenarioModalGroup {

  // The input scenario
  @Input('currentRecord') currentRecord: Scenario;

  public gridOptions: GridOptions;

  // The available groups of demands
  groups:Group[];

  // The loaded POIs : there will be one POI per demand of a loaded group of demands
  // In order to know whether the POI should be displayed or not, we rely on the selected field
  POIs:TransportPOI[];

  // The leaflet map
  map : L.Map;

  // The layer that will contain features stored in POIs input list
  POILayer : L.FeatureGroup;

  // Available base layers.
  baseLayers:object;

  // Available overlay layers
  overlays:object;

  // Default base layer name (the one displayed at map opening and the one ticked in base layer selector control)
  defaultLayerName:string;

  constructor(
      public activeModal: NgbActiveModal,
      public groupService:GroupService,
      private MapLeafletService:MapLeafletService) {
    this.POIs=[];
    this.POILayer = new L.FeatureGroup();

    this.groupService.list({search:""}).subscribe((groups) => {
      this.groups=groups
    });
    this.gridOptions = {
      rowHeight:30,
      headerHeight:30,
      columnDefs : [
        {headerName: 'Description', field: 'label', checkboxSelection: true},
        {headerName: 'Nombre de demandes', field: 'demands_count' },
      ]
    } as GridOptions;
  }

  /**
   * Called when grid is ready
   * @param params sent by the grid
   */
  gridReady(params){
    params.api.sizeColumnsToFit();
    this.gridOptions.api.forEachNode(node=> {
      var selected = false;
      for(let group of this.currentRecord.groups){
        if(node.data.id == group.data.id){
          // Load the group details so that we are able to map it
          this.loadGroupDetails(group.data.id);
          selected = true;
          break;
        }
      }
      node.setSelected(selected);
    });
    params.api.sizeColumnsToFit();
  }

  /**
   * Load the details of a group of demands, and update the list of POIs accordingly
   * This function has to be called only on selected groups of POIs, otherwise the map will contain to many POIs
   * @param groupId string : a group id
   */
  loadGroupDetails(groupId:string){
    this.groupService.get(groupId).subscribe(response=>{
      for(let group of this.groups){
        if(group.id == groupId){
          // Replacing the whole group does not work
          group.demands = (response as Group).demands;
          // For each demand, insert the involved POIs in the list of POIs,
          //   paying attention not to insert twice the same POI
          this.addGroupPOIs(group);
          break;
        }
      }
      this.displayPOIs(true);
    })
  }

  /**
   * Add new POIs to the list of POIs if needed
   * The added POIs all correspond to the transport demands linked to the group provided as an input
   * This function makes sure no POI is inserted twice and it also set the selected attribute of each POI
   *   to true if required
   * @param group Group : the input group for which we need to display the POIs on the map
   */
  addGroupPOIs(group:Group){
    for(let demand of group.demands){
      // Check whether the Home POI corresponding to the demand already belongs to this.POIs or not
      var bHRPOIAlreadyExisting=false;
      for(let existingPOI of this.POIs){
        if(existingPOI.id == demand.HRPOI.id){
          existingPOI.selected=true;
          bHRPOIAlreadyExisting=true;
          break;
        }
      }
      // Insert the Home POI corresponding to the demand into this.POIs only when not already inserted
      if(!bHRPOIAlreadyExisting){
        demand.HRPOI.selected=true;
        this.POIs.push(demand.HRPOI)
      }
      // Check whether the Institution POI corresponding to the demand already belongs to this.POIs or not
      var bInstitutionPOIAlreadyExisting=false;
      for(let existingPOI of this.POIs){
        if(existingPOI.id == demand.institutionPOI.id){
          existingPOI.selected=true;
          bInstitutionPOIAlreadyExisting=true;
          break;
        }
      }
      // Insert the Institution POI corresponding to the demand into this.POIs only when not already inserted
      if(!bInstitutionPOIAlreadyExisting){
        demand.institutionPOI.selected=true;
        // The institution POI is not a transport POI but it contains the necessary fields
        //   for map display
        this.POIs.push(demand.institutionPOI as TransportPOI)
      }
    }
  }

  /**
   * Triggered when one row of the grid is selected or unselected.
   * Missing group data is gathered, the list of POIs is updated and the map display is reset
   */
  onSelected(){
    for(let POI of this.POIs){
      POI.selected=false;
    }
    this.gridOptions.api.forEachNode(node=> {
      if(node.isSelected()){
        if(node.data.demands==undefined){
          // If the list of demands for the group is not loaded, load it now
          this.loadGroupDetails(node.data.id)
        }
        else{
          // If the list of demands for the group was already loaded, no need to reload it
          this.addGroupPOIs(node.data);
        }
      }
    })
    this.displayPOIs(true);
  }

  /**
   * Display the POIs on map. We can do that only when both map and POIs are available
   * @param bWithMapCenter boolean : whether to center the map on the whole point set
   */
  private displayPOIs(bWithMapCenter : boolean){
    if(this.POIs && this.POILayer){
      this.POILayer.clearLayers();
      // Then paint the selected POI if any
      for(let POI of this.POIs){
        if(POI.geom !=null && POI.selected){
          //swap x and y as geojson uses (lng,lat) point structure when leaflet uses (lat,lng) point structure
          var coordinates = L.GeoJSON.coordsToLatLng(POI.geom.coordinates);
          var icon,label;
          // Keep the same style as in leaflet-map component but with permanent labels
          if(POI.site_type_code=='HOME'){
            label = POI.hr_firstname + ' ' + POI.hr_lastname;
            if(POI.label != '' && POI.label != undefined && POI.label != null){
              label+= ' ('+POI.label+')';
            }
            icon = new FontAwesomeIcon({icon:faHome});
          }
          else{
            label = POI.label
            icon = new FontAwesomeIcon({icon:faHospital,markerColor:'green'});
          }
          var newMarker = L.marker(coordinates, {icon:icon})
                         .bindTooltip(label,{permanent:false,offset:[17,-20],direction:'right'});
          newMarker.poiId=POI.id;
          this.POILayer.addLayer(newMarker);
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
    var bounds = allFeatures.getBounds();
    // In case no poi and no aoi are available, bounds may not be valid.
    if(bounds.isValid() && this.map){
      this.map.fitBounds(bounds,{maxZoom:16});
    }
  }

  /**
   * Called when modal is ready
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

      // Insert the layers control to the map
      L.control.layers(this.baseLayers, this.overlays,{collapsed:true,position:'topright'}).addTo(this.map);
      // Add a geocoder control
      this.MapLeafletService.getEtalabGeocoder().addTo(this.map)
      // Set the default base layer
      this.baseLayers[this.defaultLayerName].addTo(this.map)
    })
  }

  /**
   * To be called so that map displays properly
   */
  ngAfterViewInit(){
    setTimeout( () => {if(this.map){this.map.invalidateSize();}} );
  }

  /**
   * Called when user clicks the validate button.
   * This will get the detailed information about the selected groups before closing the modal
   */
  validate() {
    this.currentRecord.groups = [];
    this.gridOptions.api.forEachNode(node=> {
      if(node.isSelected()){
        this.currentRecord.groups.push({data:node.data} as ScenarioTransportGroup)
      }
    });
    // Send a boolean to mean that the input currentRecord variable is likely to have been modified
    this.activeModal.close(true);
  }

}