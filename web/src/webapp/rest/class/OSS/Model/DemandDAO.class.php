<?php
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

 /**
 *  Class for demands handling in database
 *  @creationdate 2018-09-13
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class DemandDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * Get the demands list
   * The input data array is expected to contain some filters
   * @param array $aData : filtering data ["hrMainId"=>'id of hr', "bOnlyActiveHRs" => boolean, "search" => string]
   * @return array({object}) : array of Demand objects
   */
  public function list($aData){
    $sTypeCodeClause = "";
    if(isset($aData['hrMainId']) && $aData['hrMainId']!= null && $aData['hrMainId']!= ""){
      $hrMainIdQuoted = $this->db()->quote($aData['hrMainId']);
      $sTypeCodeClause = " AND transport_demand.hr_main_id = $hrMainIdQuoted ";
    }
    $sSearchClause = $this->db()->getSearchClause($aData,array("hr_main.firstname","hr_main.lastname"));
    $sOnlyActiveHRsClause = "";
    if(isset($aData['bOnlyActiveHRs']) && $aData['bOnlyActiveHRs']){
      $sOnlyActiveHRsClause = " AND hr_main_status.code<>'DISABLED' ";
    }
    $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
    $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');

    $sQuery = "SELECT transport_demand.id,
                     transport_demand.site_poi_id_institution,
                     site_poi_institution.label as site_poi_label_institution,
                     site_main_institution_type.code as site_poi_type_code_institution,
                     ST_AsGeoJSON(site_poi_institution.geom) as site_poi_geom_institution,
                     site_main_institution.label as institution_label,
                     transport_demand.site_poi_id_hr,
                     site_poi_hr.label as site_poi_label_hr,
                     site_main_hr_type.code as site_poi_type_code_hr,
                     ST_AsGeoJSON(site_poi_hr.geom) as site_poi_geom_hr,
                     transport_demand.hr_main_id,
                     hr_main.firstname as hr_firstname,
                     hr_main.lastname as hr_lastname,
                     CAST(transport_demand.start_dt AS bigint)*1000 as start_dt,
                     CAST(transport_demand.end_dt AS bigint)*1000 as end_dt,
                     json_agg(json_build_object(
                       'id',transport_demandtime.id,
                       'timeslot_th',transport_demandtime.timeslot_th,
                       'start_hr',transport_demandtime.start_hr*1000,
                       'end_hr',transport_demandtime.end_hr*1000,
                       'code',timeslot.code
                     )) as timeslots
                FROM transport_demand
          INNER JOIN transport_demandtime ON transport_demandtime.transport_demand_id = transport_demand.id AND
                                             transport_demandtime.rec_st<>'D'
          INNER JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                     AND site_poi_institution.rec_st<>'D'
                                                     AND site_poi_institution.geom IS NOT NULL

          $sInstitutionAccessRestrictionClause
          INNER JOIN site_main AS site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                       AND site_main_institution.rec_st<>'D'
          INNER JOIN util_thesaurus as site_main_institution_type ON site_main_institution.type_th = site_main_institution_type.id
          INNER JOIN util_thesaurus AS site_main_institution_status ON site_main_institution_status.id = site_main_institution.status_th
                                                                   AND site_main_institution_status.code<>'DISABLED'
          INNER JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                            AND site_poi_hr.rec_st<>'D'
                                            AND site_poi_hr.geom IS NOT NULL
          INNER JOIN site_main AS site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id
                                              AND site_main_hr.rec_st<>'D'
          INNER JOIN util_thesaurus as site_main_hr_type ON site_main_hr.type_th = site_main_hr_type.id
          INNER JOIN util_thesaurus AS site_main_hr_status ON site_main_hr_status.id = site_main_hr.status_th
                                                          AND site_main_hr_status.code<>'DISABLED'
          $sHRAccessRestrictionClause
          INNER JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
          INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
          INNER JOIN util_thesaurus as timeslot ON timeslot.id = transport_demandtime.timeslot_th
               WHERE transport_demand.rec_st<>'D'
                     $sTypeCodeClause
                     $sOnlyActiveHRsClause
                     $sSearchClause
            GROUP BY transport_demand.id,
                     transport_demand.site_poi_id_institution,
                     site_poi_institution.geom,
                     site_poi_institution.label,
                     site_main_institution_type.code,
                     site_main_institution.label,
                     transport_demand.site_poi_id_hr,
                     site_poi_hr.geom,
                     site_poi_hr.label,
                     site_main_hr_type.code,
                     transport_demand.hr_main_id,
                     hr_main.firstname,
                     hr_main.lastname,
                     transport_demand.start_dt,
                     transport_demand.end_dt";
    $result = $this->db()->query($sQuery);
    $aResults = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach($aResults as &$aResult){
      $aResult["timeslots"]=json_decode($aResult["timeslots"],true);
      $aResult["institutionPOI"]=array(
        "id"=> $aResult["site_poi_id_institution"],
        "label"=>$aResult["site_poi_label_institution"],
        "site_main_label"=>$aResult["institution_label"],
        "site_type_code"=>$aResult["site_poi_type_code_institution"],
        "geom"=>json_decode($aResult["site_poi_geom_institution"],true),
      );
      unset($aResult["site_poi_id_institution"]);
      unset($aResult["site_poi_label_institution"]);
      unset($aResult["institution_label"]);
      unset($aResult["site_poi_type_code_institution"]);
      unset($aResult["site_poi_geom_institution"]);
      $aResult["HRPOI"]=array(
        "id"=>$aResult["site_poi_id_hr"],
        "label"=>$aResult["site_poi_label_hr"],
        "hr_firstname"=>$aResult["hr_firstname"],
        "hr_lastname"=>$aResult["hr_lastname"],
        "hr_id"=>$aResult["hr_main_id"],
        "site_type_code"=>$aResult["site_poi_type_code_hr"],
        "geom"=>json_decode($aResult["site_poi_geom_hr"],true),
      );
      unset($aResult["site_poi_id_hr"]);
      unset($aResult["site_poi_label_hr"]);
      unset($aResult["hr_firstname"]);
      unset($aResult["hr_lastname"]);
      unset($aResult["hr_main_id"]);
      unset($aResult["site_poi_type_code_hr"]);
      unset($aResult["site_poi_geom_hr"]);
      // Make sure conversions from timestamp to date are done on server side
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aResult['startDt']=$oCalendarCtrl->fromTimestamp($aResult['start_dt']);
      $aResult['endDt']=$oCalendarCtrl->fromTimestamp($aResult['end_dt']);
    }
    return $aResults;
  }

  /**
  * Read the asked demand
  * Notice that when using this function with a demand associated to 0 timeslots, you will get an empty array
  * @param string $demandId : Demand Reference
  * @return array demand data
  **/
  public function get($demandId){
    $sDemandIdQuoted = $this->db()->quote($demandId);
    $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
    $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');
    $sQuery = "SELECT transport_demand.id,
                     transport_demand.site_poi_id_institution,
                     site_poi_institution.label as site_poi_label_institution,
                     ST_AsGeoJSON(site_poi_institution.geom) as site_poi_geom_institution,
                     site_poi_type_institution.code as site_poi_type_code_institution,
                     site_main_institution.label as institution_label,
                     site_main_institution.id as institution_id,
                     transport_demand.site_poi_id_hr,
                     site_poi_hr.label as site_poi_label_hr,
                     ST_AsGeoJSON(site_poi_hr.geom) as site_poi_geom_hr,
                     site_poi_type_hr.code as site_poi_type_code_hr,
                     transport_demand.hr_main_id,
                     hr_main.firstname as hr_firstname,
                     hr_main.lastname as hr_lastname,
                     CAST(transport_demand.start_dt as bigint)*1000 as start_dt,
                     CAST(transport_demand.end_dt as bigint)*1000 as end_dt,
                     transport_demand.rec_st,
                     home_to_institution.acceptable_duration*1000 as home_to_institution_acceptable_duration,
                     institution_to_home.acceptable_duration*1000 as institution_to_home_acceptable_duration,
                     home_to_institution.duration*1000 as home_to_institution_duration,
                     institution_to_home.duration*1000 as institution_to_home_duration,
                     json_agg(json_build_object(
                       'id',transport_demandtime.id,
                       'timeslot_th',transport_demandtime.timeslot_th,
                       'start_hr',transport_demandtime.start_hr*1000,
                       'end_hr',transport_demandtime.end_hr*1000,
                       'code',timeslot.code
                     )) as timeslots
                FROM transport_demand
          LEFT JOIN transport_demandtime ON transport_demandtime.transport_demand_id = transport_demand.id AND
                                             transport_demandtime.rec_st<>'D'
          LEFT JOIN util_thesaurus as timeslot ON timeslot.id = transport_demandtime.timeslot_th          
          INNER JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                      AND site_poi_institution.rec_st<>'D' AND site_poi_institution.geom IS NOT NULL
          $sInstitutionAccessRestrictionClause
          INNER JOIN site_main as site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                        AND site_main_institution.rec_st<>'D'
          INNER JOIN util_thesaurus as site_poi_type_institution ON site_main_institution.type_th = site_poi_type_institution.id
          INNER JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                             AND site_poi_hr.rec_st<>'D' AND site_poi_hr.geom IS NOT NULL
          $sHRAccessRestrictionClause
          INNER JOIN site_main as site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id AND site_main_hr.rec_st<>'D'
          INNER JOIN util_thesaurus as site_poi_type_hr ON site_main_hr.type_th = site_poi_type_hr.id
          INNER JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
           LEFT JOIN site_poisitepoi AS home_to_institution
                       ON home_to_institution.site_poi_id_start = site_poi_hr.id
                       AND home_to_institution.site_poi_id_end = site_poi_institution.id
                       AND home_to_institution.rec_st<>'D'
                       AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
           LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                       AND institution_to_home.site_poi_id_start = site_poi_institution.id
                       AND institution_to_home.rec_st<>'D'
                       AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
               WHERE transport_demand.id=$sDemandIdQuoted
            GROUP BY transport_demand.id,
                     transport_demand.site_poi_id_institution,
                     site_poi_institution.label,
                     site_poi_institution.geom,
                     site_poi_type_institution.code,
                     site_main_institution.label,
                     site_main_institution.id,
                     transport_demand.site_poi_id_hr,
                     site_poi_hr.label,
                     site_poi_hr.geom,
                     site_poi_type_hr.code,
                     transport_demand.hr_main_id,
                     hr_main.firstname,
                     hr_main.lastname,
                     transport_demand.start_dt,
                     transport_demand.end_dt,
                     transport_demand.rec_st,
                     home_to_institution.acceptable_duration,
                     institution_to_home.acceptable_duration,
                     home_to_institution.duration,
                     institution_to_home.duration";
    $result = $this->db()->query($sQuery);
    $aResult = $result->fetch(PDO::FETCH_ASSOC);
    if(isset($aResult["id"])){
      $aResult["timeslots"]=json_decode($aResult["timeslots"],true);
      $aResult["institutionPOI"]=array(
        "id"=>$aResult["site_poi_id_institution"],
        "label"=>$aResult["site_poi_label_institution"],
        "site_main_id"=>$aResult["institution_id"],
        "site_main_label"=>$aResult["institution_label"],
        "site_type_code"=>$aResult["site_poi_type_code_institution"],
        "geom"=>json_decode($aResult["site_poi_geom_institution"],true)
      );
      unset($aResult["site_poi_id_institution"]);
      unset($aResult["site_poi_label_institution"]);
      unset($aResult["institution_id"]);
      unset($aResult["institution_label"]);
      unset($aResult["site_poi_type_code_institution"]);
      unset($aResult["site_poi_geom_institution"]);
      $aResult["HRPOI"]=array(
        "id"=>$aResult["site_poi_id_hr"],
        "label"=>$aResult["site_poi_label_hr"],
        "hr_firstname"=>$aResult["hr_firstname"],
        "hr_lastname"=>$aResult["hr_lastname"],
        "hr_id"=>$aResult["hr_main_id"],
        "site_type_code"=>$aResult["site_poi_type_code_hr"],
        "geom"=>json_decode($aResult["site_poi_geom_hr"],true),
        "home_to_institution_duration"=>$aResult["home_to_institution_duration"],
        "institution_to_home_duration"=>$aResult["institution_to_home_duration"]     
      );
      unset($aResult["site_poi_id_hr"]);
      unset($aResult["site_poi_label_hr"]);
      unset($aResult["hr_firstname"]);
      unset($aResult["hr_lastname"]);
      unset($aResult["hr_main_id"]);
      unset($aResult["site_poi_type_code_hr"]);
      unset($aResult["home_to_institution_duration"]);
      unset($aResult["institution_to_home_duration"]);
      // Make sure conversions from timestamp to date are done on server side
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aResult['startDt']=$oCalendarCtrl->fromTimestamp($aResult['start_dt']);
      $aResult['endDt']=$oCalendarCtrl->fromTimestamp($aResult['end_dt']);
    }
    else{
      $aResult["timeslots"] = array();
      $aResult["institutionPOI"]=array();
      $aResult["HRPOI"]=array();
    }
    return $aResult;
  }

  /**
   * List Transport demands with the information that is required to create routes
   * @param $aData array : filters for the search of transport demands
   * @return array : list of transport demands with the information that is required to create routes
   */
  function listForRoutes($aData){
    $sInstitutionClause="";
    if(isset($aData['institutions']) && $aData['institutions']!= null && $aData['institutions']!= ""){
      $aInstitutions = explode(";",$aData['institutions']);
      $sInstitutionsQuoted = "";
      foreach($aInstitutions as $sInstitution){
        if($sInstitutionsQuoted != ""){
          $sInstitutionsQuoted.=',';
        }
        $sInstitutionsQuoted .= $this->db()->quote($sInstitution);
      }
      $sInstitutionClause = " AND site_poi_institution.site_main_id IN ( $sInstitutionsQuoted ) ";
    }
    $sTimeslotIDClause = "";
    if(isset($aData['timeSlotId']) && $aData['timeSlotId']!= null && $aData['timeSlotId']!= ""){
      $sTimeslotIDQuoted = $this->db()->quote($aData['timeSlotId']);
      $sTimeslotIDClause = " AND transport_demandtime.timeslot_th = $sTimeslotIDQuoted ";
    }
    $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
    $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');    
    // SQL query that collects the timeslots for each transport demand
    $sTimeslotsByDemandSQL =
      " SELECT
          transport_demand_id,
          json_agg(json_build_object(
            'timeslot_th',timeslot_th,
            'code',th_timeslot.code,
            'start_hr',start_hr*1000,
            'end_hr',end_hr*1000
           )) as list
      FROM transport_demandtime
INNER JOIN util_thesaurus as th_timeslot on th_timeslot.id=transport_demandtime.timeslot_th
     WHERE transport_demandtime.rec_st<>'D' $sTimeslotIDClause
  GROUP BY transport_demand_id";

    // SQL query that collects some information about the institutions that are associated to home POIs
    $sInstitutionsByHomePOISQL =
    " SELECT
        site_poi_hr.id,
        json_agg(json_build_object(
          'id',institution.id,
          'label',institution.label,
          'poi_id',site_poi_institution.id,
          'home_to_institution_acceptable_duration',home_to_institution.acceptable_duration*1000,
          'institution_to_home_acceptable_duration',institution_to_home.acceptable_duration*1000
        )) as institutions
        FROM site_poi AS site_poi_hr
  INNER JOIN site_main as site_main_hr ON site_main_hr.id = site_poi_hr.site_main_id
  INNER JOIN hr_mainsite ON hr_mainsite.site_main_id = site_main_hr.id
  INNER JOIN hr_main ON hr_main.id = hr_mainsite.hr_main_id
  INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
                                             AND hr_main_status.code<>'DISABLED'
  INNER JOIN hr_mainsite AS hr_institution ON hr_institution.hr_main_id = hr_main.id AND hr_institution.rec_st<>'D'
  INNER JOIN site_main AS institution ON institution.id=hr_institution.site_main_id AND institution.rec_st<>'D'
  INNER JOIN util_thesaurus AS institution_type ON institution.type_th=institution_type.id AND
                                  institution_type.code = 'INSTITUTION'
   LEFT JOIN site_poi AS site_poi_institution ON site_poi_institution.id = (
             SELECT id
               FROM site_poi
              WHERE site_poi.site_main_id = institution.id AND geom IS NOT NULL AND site_poi.rec_st<>'D'
           ORDER BY position
              LIMIT 1 )
   LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi_hr.id
                                 AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                 AND home_to_institution.rec_st<>'D'
                                 AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
   LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                                 AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                 AND institution_to_home.rec_st<>'D'
                                 AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
                                 WHERE site_poi_hr.rec_st<>'D' AND site_poi_hr.geom IS NOT NULL
    GROUP BY site_poi_hr.id";

    $sQuery = "SELECT
                      transport_demand.id as transport_demand_id,
                      home_to_institution.acceptable_duration*1000 as home_to_institution_acceptable_duration,
                      institution_to_home.acceptable_duration*1000 as institution_to_home_acceptable_duration,
                      site_main_institution.id as transport_demand_institution_id,
                      site_main_institution.label as transport_demand_institution_label,
                      site_poi_institution.id as transport_demand_institution_poi_id,
                      timeslots.list as timeslots,
                      site_poi_hr.id,
                      site_poi_hr.site_main_id,
                      site_poi_hr.label,
                      site_poi_hr.position,
                      site_poi_hr.addr1,
                      site_poi_hr.addr2,
                      site_poi_hr.postcode,
                      site_poi_hr.city,
                      site_poi_hr.country_th,
                      site_poi_hr.type_th,
                      site_poi_hr.service_duration*1000 as service_duration,
                      ST_AsGeoJSON(site_poi_hr.geom) AS geom,
                      site_poi_hr.rec_st,
                      site_main_hr.type_th as site_type_th,
                      site_main_hr_type.code as site_type_code,
                      site_main_hr_type.label as site_type_label,
                      hr_main.firstname as hr_firstname,
                      hr_main.lastname as hr_lastname,
                      th_gender.label as hr_gender_label,
                      CAST(hr_main.birthday_dt AS bigint)*1000 as hr_birthday_dt,
                      hr_maindetail.crisis_risk as hr_crisis_risk,
                      hr_maindetail.specific_arrangement as hr_specific_arrangement,
                      hr_maindetail.pickup_duration*1000 as hr_pickup_duration,
                      hr_maindetail.delivery_duration*1000 as hr_delivery_duration,
                      hr_main.id as hr_id,
                      transport_mode.code as transport_mode_code,
                      institutions.institutions
                FROM transport_demand
          INNER JOIN ( $sTimeslotsByDemandSQL ) AS timeslots ON timeslots.transport_demand_id=transport_demand.id
          INNER JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
          INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
                                             AND hr_main_status.code<>'DISABLED'
           LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
           LEFT JOIN hr_maindetail on hr_main.id=hr_maindetail.hr_main_id AND hr_maindetail.rec_st<>'D'
           LEFT JOIN util_thesaurus as transport_mode on transport_mode.id=hr_maindetail.transportmode_th
          INNER JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                             AND site_poi_hr.rec_st<>'D' AND site_poi_hr.geom IS NOT NULL
          $sHRAccessRestrictionClause
          INNER JOIN ( $sInstitutionsByHomePOISQL ) AS institutions ON institutions.id=site_poi_hr.id
          INNER JOIN site_main as site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id AND site_main_hr.rec_st<>'D'
          INNER JOIN util_thesaurus as site_main_hr_type on site_main_hr.type_th=site_main_hr_type.id
          INNER JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                      AND site_poi_institution.rec_st<>'D'
                                                      AND site_poi_institution.geom IS NOT NULL
          $sInstitutionAccessRestrictionClause                                                      
          INNER JOIN site_main as site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                        AND site_main_institution.rec_st<>'D'
          LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi_hr.id
                                                        AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                                        AND home_to_institution.rec_st<>'D'
                                                        AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
          LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                                                        AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                                        AND institution_to_home.rec_st<>'D'
                                                        AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
               WHERE transport_demand.rec_st<>'D'
                     $sInstitutionClause";
    $result = $this->db()->query($sQuery);
    $aDemands = $result->fetchAll(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    foreach($aDemands as &$aDemand){
      $aDemand["geom"]=json_decode($aDemand["geom"],true);
      $aDemand["institutions"]=json_decode($aDemand["institutions"],true);
      $aDemand["timeslots"]=json_decode($aDemand["timeslots"],true);
    }
    return $aDemands;
  }

  /**
  * Add a demand
  * @param array $aData : data of the demand to be inserted.
  * @return array created demand with an id field
  */
  public function add($aData){
    if(isset($aData['startDt']) && $aData['endDt']){
      // Make sure the received dates are converted into timestamps (expressed at 0h server time)
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aData['start_dt']=$oCalendarCtrl->toTimestamp($aData['startDt']);
      $aData['end_dt']=$oCalendarCtrl->toTimestamp($aData['endDt']);
    }
    $sSQL = "INSERT INTO transport_demand (
                           site_poi_id_institution,
                           site_poi_id_hr,
                           hr_main_id,
                           start_dt,
                           end_dt,
                           rec_st)
                VALUES (
                         :site_poi_id_institution,
                         :site_poi_id_hr,
                         :hr_main_id,
                         :start_dt,
                         :end_dt,
                         :rec_st)
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute(array(
        ':site_poi_id_institution'=>$aData['institutionPOI']['id'],
        ':site_poi_id_hr'=>$aData['HRPOI']['id'],
        ':hr_main_id'=>$aData['HRPOI']['hr_id'],
        ':start_dt'=>round($aData['start_dt']/1000),
        ':end_dt'=>round($aData['end_dt']/1000),
        ':rec_st'=>$aData['rec_st']
      ));
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Demand with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a demand
  * @param array $aData : data of the demand to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $bResult=false;
    if($this->hasAccess($aData['id'])){
      if(isset($aData['startDt']) && $aData['endDt']){
        // Make sure the received dates are converted into timestamps (expressed at 0h server time)
        $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
        $aData['start_dt']=$oCalendarCtrl->toTimestamp($aData['startDt']);
        $aData['end_dt']=$oCalendarCtrl->toTimestamp($aData['endDt']);
      }
      $sSQL = "UPDATE transport_demand
                  SET
                    site_poi_id_institution=:site_poi_id_institution,
                    site_poi_id_hr=:site_poi_id_hr,
                    hr_main_id=:hr_main_id,
                    start_dt=:start_dt,
                    end_dt=:end_dt,
                    rec_st=:rec_st
                WHERE id=:id";
      $oQuery = $this->db()->prepare($sSQL);
      try{
        $bResult= $oQuery->execute(array(
          ':id'=>$aData['id'],
          ':site_poi_id_institution'=>$aData['institutionPOI']['id'],
          ':site_poi_id_hr'=>$aData['HRPOI']['id'],
          ':hr_main_id'=>$aData['HRPOI']['hr_id'],
          ':start_dt'=>round($aData['start_dt']/1000),
          ':end_dt'=>round($aData['end_dt']/1000),
          ':rec_st'=>$aData['rec_st']
        ));
      }
      catch(Exception $e){
        if($e->getCode()==23505){
          throw new \OSS\AppException(
            "Demand with code " . $aData['code'] . " already exists in database.",
            \OSS\AppException::ALREADY_EXISTS
          );
        }else{
          throw $e;
        }
      }
    }
    return $bResult;
  }

  /**
  * Mark a demand as removed
  * @param string $sDemandID : id of the demand to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sDemandID){
    $bResult = false;
    if($this->hasAccess($sDemandID)){
      $query = "UPDATE transport_demand SET rec_st='D' WHERE id=" . $this->db()->quote($sDemandID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a demand.
  * @param string $sDemandID : id of the demand to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sDemandID){
    $query = "DELETE FROM datachecker_detail WHERE transport_demand_id=" . $this->db()->quote($sDemandID);
    $this->db()->exec($query);     
    $query = "DELETE FROM transport_routesitepoi WHERE transport_demand_id=" . $this->db()->quote($sDemandID);
    $this->db()->exec($query);
    $query = "DELETE FROM transport_demand WHERE id=" . $this->db()->quote($sDemandID);
    return $this->db()->exec($query);
  }

  /**
  * Get a list of timeslots based on search criteria
  * The input data array is expected to contain some filters
  * @param array $aData : filtering data
  * @return array({object}) : array of timeslots
  **/
  public function listTimeslots($aData){
    $aResult = array();
    if($this->hasAccess($aData['demandId'])){    
      $sDemandIDClause = "";
      if(isset($aData['demandId']) && $aData['demandId']!= null && $aData['demandId']!= ""){
        $sDemandIDQuoted = $this->db()->quote($aData['demandId']);
        $sDemandIDClause = " AND transport_demandtime.transport_demand_id = $sDemandIDQuoted ";
      }
      $sql = "SELECT
                     transport_demandtime.id,
                     transport_demandtime.transport_demand_id,
                     transport_demandtime.timeslot_th,
                     transport_demandtime.start_hr*1000,
                     transport_demandtime.end_hr*1000
                FROM transport_demandtime
               WHERE transport_demandtime.rec_st<>'D'
                     $sDemandIDClause";
      $result = $this->db()->query($sql);
      $aResult = $result->fetchAll(PDO::FETCH_ASSOC);
    }
    return $aResult;
  }

  /**
  * Add a new timeslot
  * @param array $aData : data of the timeslot to be added.
  * @return array created timeslot with an id field
  */
  public function addTimeslot($aData){
    // The access control before adding a timeslot into a transport demand is disabled.
    // Indeed, the access for a demand without any timeslots will always be denied (even for admins)
    // Disabling the access control is not a problem as long as addTimeslot function is used in a secure
    //   context
    $sSQL = "INSERT INTO transport_demandtime (transport_demand_id,timeslot_th,start_hr,end_hr,rec_st)
              VALUES (:transport_demand_id,:timeslot_th,:start_hr,:end_hr,:rec_st)
              RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':transport_demand_id'=>$aData['transport_demand_id'],
      ':timeslot_th'=>$aData['timeslot_th'],
      ':start_hr'=>isset($aData['start_hr'])?round($aData['start_hr']/1000):null,
      ':end_hr'=>isset($aData['end_hr'])?round($aData['end_hr']/1000):null,
      ':rec_st'=>$aData['rec_st']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a timeslot
  * @param array $aData : data of the timeslot to be updated.
  * @return boolean : true if the update succeeded
  */
  public function updateTimeslot($aData){
    $bResult = false;
    if($this->hasAccess($aData['transport_demand_id'])){ 
      $sSQL = "UPDATE transport_demandtime
                   SET
                     transport_demand_id=:transport_demand_id,
                     timeslot_th=:timeslot_th,
                     start_hr=:start_hr,
                     end_hr=:end_hr,
                     rec_st=:rec_st
        WHERE id=" . $this->db()->quote($aData['id']);
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute(array(
        ':transport_demand_id'=>$aData['transport_demand_id'],
        ':timeslot_th'=>$aData['timeslot_th'],
        ':start_hr'=>isset($aData['start_hr'])?round($aData['start_hr']/1000):null,
        ':end_hr'=>isset($aData['end_hr'])?round($aData['end_hr']/1000):null,
        ':rec_st'=>$aData['rec_st']
      ));
    }
    return $bResult;
  }

  /**
  * Mark a timeslot as removed
  * @param string $sTimeslotID : id of the timeslot to be removed.
  * @param string $sDemandID : the corresponding transport demand, for access right checks
  * @return boolean : true if the operation succeeded
  */
  public function markTimeslotAsRemoved($sTimeslotID,$sDemandID){
    $bResult = false;
    if($this->hasAccess($sDemandID)){    
      $query = "UPDATE transport_demandtime SET rec_st='D' WHERE id=" . $this->db()->quote($sTimeslotID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a timeslot.
  * @param string $sTimeslotID : id of the timeslot to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteTimeslot($sTimeslotID){
    $query = "DELETE FROM transport_demandtime WHERE id=" . $this->db()->quote($sTimeslotID);
    return $this->db()->exec($query);
  }

}