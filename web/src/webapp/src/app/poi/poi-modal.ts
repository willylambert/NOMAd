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

import { Component, OnInit,Input } from '@angular/core';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { ThesaurusService } from '../thesaurus/thesaurus.service';
import { POIService } from './poi.service';

import { POI,POIPOI } from './poi';
import { Site } from '../site/site';

@Component({
  templateUrl: './poi-modal.html',
})
export class POIModal implements OnInit {

  // The input POI information, that we want to update
  @Input('poi') poi: POI;

  // Indicates whether we need an acceptable duration for the POI or not
  // Should be set when the modal is open from the HR menu
  @Input('institutions') institutions: Site[];

  @Input('editMode') editMode: string;

  // acceptable durations in minutes
  acceptableDurationsInMin:{
    institutionLabel:string;
    institutionPOILabel:string;
    institutionPOIId:string;
    acceptableDurationFromInstitution:number;
    acceptableDurationToInstitution:number
  }[];

  // Service duration in minutes
  serviceDuration:number;

  // Temporary work POI, will be copied into this.poi if formular is correctly filled
  currentRecord : POI;

  constructor(private thService: ThesaurusService,
          public activeModal: NgbActiveModal,
          public POIService:POIService) {
    this.acceptableDurationsInMin=[];
  }

  /**
   * On data reception, copy the input POI data into the temporary POI
   */
  ngOnInit() {
    this.currentRecord = new POI();
    this.currentRecord.id=this.poi.id;
    this.currentRecord.label=this.poi.label
    this.currentRecord.addr1=this.poi.addr1;
    this.currentRecord.addr2=this.poi.addr2;
    // Make sure the adress is never the empty string
    // The main use for this is to make tests more robusts
    if(this.currentRecord.addr1 == "" || this.currentRecord.addr1 == null || this.currentRecord.addr1 == undefined){
      this.currentRecord.addr1=" ";
    }
    this.currentRecord.postcode=this.poi.postcode;
    this.currentRecord.city=this.poi.city;
    this.currentRecord.selected=this.poi.selected;
    // Convert milliseconds into minutes
    if(this.poi.service_duration!=undefined){
      this.serviceDuration=Math.round(this.poi.service_duration/60000);
    }
    else{
      this.serviceDuration = 2;
    }
    this.computeAcceptableDurations();
  }

  /**
   * Compute a possible acceptable travel duration for the current POI based on the available list of institutions
   */
  computeAcceptableDurations(){
    if(this.institutions){
      // Extract a set of coordinates from the institutions
      var institutionCoordinates = "";
      var institutionPOIIds = "";
      // Initialize acceptableDurationsInMin variable with the institutions and institutions POIs for which
      //   we need the acceptable duration to and from the current HR POI. Start fill the acceptable durations
      //   with the ones already present in this.poi.matrix
      for(let institution of this.institutions){
        if(institution.POIs!=undefined){
          for(let POI of institution.POIs){
            // Retrieve from this.poi.matrix the acceptable duration from an to the current institution POI
            var acceptableDurationFromInstitution:number,acceptableDurationToInstitution:number;
            if(this.poi.matrix!=null && this.poi.matrix!=undefined){
              for(let duration of this.poi.matrix){
                if(duration.site_poi_id_end == POI.id){
                  acceptableDurationToInstitution=Math.round(duration.acceptable_duration/60000);
                  break;
                }
              }
              for(let duration of this.poi.matrix){
                if(duration.site_poi_id_start == POI.id){
                  acceptableDurationFromInstitution=Math.round(duration.acceptable_duration/60000);
                  break;
                }
              }
            }
            // If the acceptable durations from or to the current institution POI are not defined in this.poi.matrix
            //   then we will have to request them by calling server
            if(acceptableDurationFromInstitution == undefined || acceptableDurationToInstitution == undefined){
              // Coordinates are organized as an array with longitude first and then latitude
              if(institutionCoordinates!=""){
                institutionCoordinates+=";";
              }
              if(institutionPOIIds!=""){
                institutionPOIIds+=";";
              }
              institutionCoordinates += POI.geom.coordinates[0]+','+POI.geom.coordinates[1];
              institutionPOIIds += POI.id;
            }
            // Create an item in the array for acceptable durations (even if the acceptable durations are not defined yet)
            this.acceptableDurationsInMin.push({
              institutionLabel:institution.label,
              institutionPOILabel:POI.label,
              institutionPOIId:POI.id,
              acceptableDurationFromInstitution:acceptableDurationFromInstitution,
              acceptableDurationToInstitution:acceptableDurationToInstitution
            })
          }
        }
      }
      if(institutionCoordinates!="" && this.editMode!='view'){
        // If some acceptable durations are undefined, request a default value for them from server
        var poiCoordinates = this.poi.geom.coordinates[0]+','+this.poi.geom.coordinates[1];
        this.POIService.getAcceptableDurations(poiCoordinates,institutionCoordinates,institutionPOIIds).subscribe(acceptableDurations=>{
          for(let acceptableDuration of acceptableDurations){
            for(let acceptableDurationInMin of this.acceptableDurationsInMin){
              if(acceptableDurationInMin.institutionPOIId == acceptableDuration.institutionPOIId){
                if(acceptableDurationInMin.acceptableDurationFromInstitution == undefined){
                  acceptableDurationInMin.acceptableDurationFromInstitution=Math.round(acceptableDuration.fromInstitution/60000);
                }
                if(acceptableDurationInMin.acceptableDurationToInstitution == undefined){
                  acceptableDurationInMin.acceptableDurationToInstitution=Math.round(acceptableDuration.toInstitution/60000);
                }
                break;
              }
            }
          }
        });
      }
    }
  }

  /**
   * If formular is validated, copy the temporary POI information into the input POI before closing the modal
   */
  saveModal() {
    this.poi.label=this.currentRecord.label;
    this.poi.addr1=this.currentRecord.addr1;
    this.poi.addr2=this.currentRecord.addr2;
    this.poi.postcode=this.currentRecord.postcode;
    this.poi.city=this.currentRecord.city;
    // Convert minutes into milliseconds
    if(this.serviceDuration!=undefined){
      this.poi.service_duration=this.serviceDuration*60000;
    }
    if(this.poi.matrix==undefined || this.poi.matrix == null){
      this.poi.matrix = [];
    }
    for(let acceptableDurationInMin of this.acceptableDurationsInMin){
      // Try to update the acceptable duration from the POI to the institution POI, and not found then insert it
      var bFound = false;
      for(let acceptableDuration of this.poi.matrix){
        if(acceptableDurationInMin.institutionPOIId == acceptableDuration.site_poi_id_end){
          acceptableDuration.acceptable_duration = acceptableDurationInMin.acceptableDurationToInstitution*60000;
          bFound = true;
          break;
        }
      }
      if(!bFound){
        this.poi.matrix.push({
          acceptable_duration:acceptableDurationInMin.acceptableDurationToInstitution*60000,
          site_poi_id_start:this.poi.id,
          site_poi_id_end:acceptableDurationInMin.institutionPOIId
        } as POIPOI)
      }
      // Try to update the acceptable duration from the institution POI to the POI, and not found then insert it
      bFound = false;
      for(let acceptableDuration of this.poi.matrix){
        if(acceptableDurationInMin.institutionPOIId == acceptableDuration.site_poi_id_start){
         acceptableDuration.acceptable_duration = acceptableDurationInMin.acceptableDurationFromInstitution*60000;
         bFound = true;
         break;
        }
      }
      if(!bFound){
        this.poi.matrix.push({
          acceptable_duration:acceptableDurationInMin.acceptableDurationFromInstitution*60000,
          site_poi_id_end:this.poi.id,
          site_poi_id_start:acceptableDurationInMin.institutionPOIId
        } as POIPOI)
      }
    }
    // Mark the poi as validated by user, even if not saved into database
    this.poi.selected=true;
    this.activeModal.close("save");
  }

  deletePOI(){
    this.activeModal.close("delete");
  }
}