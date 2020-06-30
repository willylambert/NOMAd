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
 *  Class for hr handling in database
 *  @creationdate 2018-10-10
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class HRDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
   * Generate a INNER JOIN SQL cause to insert in a SQL SELECT query so as to restrict access to a list of HRs.
   * In order to decide whether the access to a HR is granted or not to the current user, we use user_mainsite table
   *   and also the user type (column type_th from the user_main table).
   * @param string $sSiteMainTableName : name of the site_main table as used in the SELECT SQL query
   * @param string $sSiteMainFieldName : name of the site_main field as used in the SELECT SQL query
   * @return string : a INNER JOIN SQL clause to insert in a SQL query
   */
  public function getHRAccessRestrictionClause($sSiteMainTableName='site_main',$sSiteMainFieldName='id'){
    $sAccessRestrictionClause = $this->getAccessRestrictionClause($sSiteMainTableName,$sSiteMainFieldName);
    // If user is an administrator, then $sAccessRestrictionClause is the empty string so we do not have to put any
    //   additionnal restrictions. Otherwise, we consider the type of the user (CLIENT or INSTITUTION or TRANSPORT_ORGANIZER)
    //   and use it to restrict the access to the HR list in the following way :
    // - A user of CLIENT type can not access the data a HR unless this user has the right on the HR home.
    // - A user of INSTITUTION type can access the data of a HR that is associated to the user's institution
    // - A user of TRANSPORT_ORGANIZER type can access the data of a HR that is associated to the user's institution
    if($sAccessRestrictionClause!=""){
      $sSuffix = $this->getAccessRestrictionSuffix();
      $sAccessRestrictionClause .= "
        INNER JOIN util_thesaurus th_hr_mainsite_type_$sSuffix
                ON th_hr_mainsite_type_$sSuffix.id=hr_mainsite.type_th
        INNER JOIN util_thesaurus th_user_type_$sSuffix
                ON th_user_type_$sSuffix.id = user_main_$sSuffix.type_th
               AND (
                     (th_user_type_$sSuffix.code='INSTITUTION') OR
                     (th_user_type_$sSuffix.code='TRANSPORT_ORGANIZER') OR
                     (th_user_type_$sSuffix.code='CLIENT' AND th_hr_mainsite_type_$sSuffix.code='HOME')
                   ) ";
    }
    return $sAccessRestrictionClause;
  }

  /*
   * Get the hrs list
   * The input data array is expected to contain the following fields :
   *   statusCode, search (on label or code), startIndex, length, typeCode
   * @param array $aData : filtering data ["aUserId" => array of id]
   * @return array({object}) : array of HR objects
   */
  public function list($aData){
    $sLimitClause = $this->db()->getLimitClause($aData);
    $sOffsetClause = $this->db()->getOffsetClause($aData);
    $sSearchClause = $this->db()->getSearchClause($aData,array("hr_main.firstname","hr_main.lastname"));

    $sTypeCodeClause = "";
    if(isset($aData['typeCode']) && $aData['typeCode']!= null && $aData['typeCode']!= ""){
      $sTypeCodeString = $this->db()->quote($aData['typeCode']);
      $sTypeCodeClause = " AND th_type.code = $sTypeCodeString ";
    }

    $sStatusCodeClause = "";
    if(isset($aData['statusCode']) && $aData['statusCode']!= null && $aData['statusCode']!= ""){
      $sStatusCodeString = $this->db()->quote($aData['statusCode']);
      $sStatusCodeClause = " AND th_status.code = $sStatusCodeString ";
    }

    $sUserIdInClause = "";
    if(isset($aData["aUserId"])){
      $aData["aUserId"] = array_map( array($this->db(),'quote'), $aData["aUserId"] );
      $sUserIdInClause = " AND hr_main.id IN (" . implode(",",$aData["aUserId"]) . ")";
    }

    $sAccessRestrictionClause = $this->getHRAccessRestrictionClause();

    // In the query below, we consider that every HR is associated to at least one site (the home site)
    // HRs without sites will not be listed
    $query = "SELECT hr_main.id,
                     hr_main.lastname,
                     hr_main.firstname,
                     hr_main.gender_th,
                     th_gender.code AS gender_code,
                     th_gender.label AS gender_label,
                     CAST(hr_main.birthday_dt AS bigint)*1000 as birthday_dt,
                     hr_main.status_th,
                     th_status.code AS status_code,
                     th_status.label AS status_label,
                     hr_main.type_th,
                     th_type.code AS type_code,
                     th_type.label AS type_label,
                     th_hr_maindetail_transport.code as transportmode_code,
                     hr_maindetail.crisis_risk,
                     hr_maindetail.specific_arrangement,
                     hr_maindetail.pickup_duration*1000 as pickup_duration,
                     hr_maindetail.delivery_duration*1000 as delivery_duration,
                     demands.count as demands_count,
                     json_agg(json_build_object('id',site_main.id,'label',site_main.label,'type',th_hr_mainsite_type.code,'city',site_poi.city)) as sites
              FROM hr_main
              LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
              INNER JOIN util_thesaurus th_status ON th_status.id=hr_main.status_th
              INNER JOIN util_thesaurus th_type ON th_type.id=hr_main.type_th

              LEFT JOIN hr_maindetail ON hr_maindetail.hr_main_id=hr_main.id
              
              LEFT JOIN hr_mainsite ON hr_main.id = hr_mainsite.hr_main_id AND hr_mainsite.rec_st<>'D'
              LEFT JOIN util_thesaurus th_hr_mainsite_type ON th_hr_mainsite_type.id=hr_mainsite.type_th
              LEFT JOIN site_main ON hr_mainsite.site_main_id = site_main.id
              
              $sAccessRestrictionClause
              LEFT JOIN util_thesaurus th_hr_maindetail_transport ON th_hr_maindetail_transport.id=hr_maindetail.transportmode_th

              LEFT JOIN site_poi on site_poi.site_main_id = site_main.id
              LEFT JOIN (
                  SELECT hr_main2.id as hr_main_id, count(transport_demand.id)
                  FROM hr_main as hr_main2
                  INNER JOIN transport_demand ON transport_demand.hr_main_id=hr_main2.id
                  GROUP BY hr_main2.id
              ) AS demands ON demands.hr_main_id = hr_main.id
              WHERE hr_main.rec_st<>'D'
                    $sTypeCodeClause
                    $sStatusCodeClause
                    $sSearchClause
                    $sUserIdInClause
              GROUP BY hr_main.id, hr_main.lastname, hr_main.firstname, hr_main.gender_th, th_gender.code, th_gender.label, hr_main.birthday_dt,
              hr_main.status_th, th_status.code, th_status.label, hr_main.type_th, th_type.code, th_type.label,th_hr_maindetail_transport.code,demands.count,
              hr_maindetail.crisis_risk, hr_maindetail.specific_arrangement, hr_maindetail.pickup_duration, hr_maindetail.delivery_duration
              ORDER BY hr_main.id
              $sLimitClause
              $sOffsetClause";
    $result = $this->db()->query($query);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * List the routes for a driver and a given day
   * The input data may contain a driver id in the hr_main_id field and a calendar_dt field in with the
   *    requested day at midnight server time expressed in ms
   * @param string $aData : with the concerned hr_main_id (driver) and calendar_dt (the concerned timestamp)
   * @param boolean $bWithAccessRestriction : enable to request routes with or without access restriction
   * @return array : list of routes
   */
  function listRoutes($aData,$bWithAccessRestriction=true){
    $aResult=array();
    if(isset($aData["hr_main_id"]) && $aData["hr_main_id"]!=""){
      $sInstitutionAccessRestrictionClause = "";
      $sHRAccessRestrictionClause = "";
      if($bWithAccessRestriction){
        $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_institution_transport_demand','id');
        $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_main','id');
      }
      // In order to query the transport_calendar table, let us make sure the queried date is expressed
      //   a midnight server time
      $sHRIdQuoted = $this->db()->quote($aData["hr_main_id"]);
      if(isset($aData["calendar_dt"])){
        $sCalendarDtQuoted = $this->db()->quote(round($aData["calendar_dt"]/1000));
      }else{
        $sCalendarDtQuoted = "0";
      }
      // SQL query that collects the opening hours for some institutions sites
      $sHoursByInstitutionSQL =
" SELECT site_main.id as site_main_id, json_agg(json_build_object(
          'timeslot_th',site_hour.timeslot_th,
          'start_hr',site_hour.start_hr*1000,
          'end_hr',site_hour.end_hr*1000
        )) AS list
  FROM site_main
  INNER JOIN site_hour ON site_hour.site_main_id=site_main.id
                      AND site_hour.rec_st <> 'D'
  INNER JOIN util_thesaurus ON site_main.type_th=util_thesaurus.id AND util_thesaurus.code = 'INSTITUTION'
       WHERE site_main.rec_st <> 'D'
       GROUP BY site_main.id";

      // SQL query that collects some information about the institutions that are associated to home POIs
      $sInstitutionsByHomePOISQL =
" SELECT site_poi_hr.id,
         json_agg(json_build_object(
           'id',site_main_institution.id,
           'label',site_main_institution.label,
           'poi_id',site_poi_institution.id,
           'home_to_institution_acceptable_duration',home_to_institution.acceptable_duration*1000,
           'institution_to_home_acceptable_duration',institution_to_home.acceptable_duration*1000
         )) AS list
FROM site_poi AS site_poi_hr
INNER JOIN site_main AS site_main_hr ON site_main_hr.id=site_poi_hr.site_main_id AND site_main_hr.rec_st <> 'D'
INNER JOIN util_thesaurus AS th_site_type_hr ON site_main_hr.type_th=th_site_type_hr.id AND th_site_type_hr.code = 'HOME'
INNER JOIN hr_mainsite ON hr_mainsite.site_main_id=site_main_hr.id AND hr_mainsite.rec_st <> 'D'
INNER JOIN hr_main ON hr_main.id=hr_mainsite.hr_main_id AND hr_main.rec_st <> 'D'
INNER JOIN hr_mainsite AS hr_main_institution ON hr_main_institution.hr_main_id=hr_main.id AND hr_main_institution.rec_st <> 'D'
INNER JOIN site_main AS site_main_institution ON site_main_institution.id=hr_main_institution.site_main_id
                                             AND site_main_institution.rec_st <> 'D'
INNER JOIN util_thesaurus AS th_site_type_institution  ON site_main_institution.type_th=th_site_type_institution.id
                                             AND th_site_type_institution.code = 'INSTITUTION'
-- for each institution, we consider only the first poi --
LEFT JOIN site_poi AS site_poi_institution ON site_poi_institution.id = (
  SELECT id
  FROM site_poi
  WHERE site_poi.site_main_id = site_main_institution.id AND geom IS NOT NULL AND  site_poi.rec_st<>'D'
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
WHERE site_poi_hr.rec_st <> 'D'
GROUP BY site_poi_hr.id";
      // Main query
      $sSQL =
"SELECT
        route.id,
        route.label,
        CAST(route.date_dt AS bigint)*1000 as date_dt,
        route.timeslot_th,
        time_slot.code as timeslot_code,
        route.vehicle_category_id,
        vehicle_category.code as vehicle_category_code,
        vehicle_category.label as vehicle_category_label,
        vehicle_category.daily_cost as vehicle_category_daily_cost,
        vehicle_category.hourly_cost as vehicle_category_hourly_cost,
        vehicle_category.kilometric_cost as vehicle_category_kilometric_cost,
        vehicle_category.co2_quantity as vehicle_category_co2_quantity,
        route.start_hr*1000 as start_hr,
        route.end_hr*1000 as end_hr,
        route.distance,
        route.duration,
        route.site_poi_id_start,
        route.site_poi_id_end,
        route.rec_st,
        route.scenario_main_id,
        route.optim_main_id,
        driver.id as driver_id,
        driver.firstname as driver_firstname,
        driver.lastname as driver_lastname,
        CAST(route.start_driver_dt as bigint)*1000 as start_driver_dt,
        CAST(route.end_driver_dt as bigint)*1000 as end_driver_dt,
        json_agg(json_build_object(
          'id',site_poi.id,
          'transport_demand_id',transport_demand.id,
          'transport_demand_institution_id',site_main_institution_transport_demand.id,
          'transport_demand_institution_label',site_main_institution_transport_demand.label,
          'transport_demand_institution_poi_id',site_poi_institution_transport_demand.id,
          'home_to_institution_acceptable_duration',home_to_institution.acceptable_duration*1000,
          'institution_to_home_acceptable_duration',institution_to_home.acceptable_duration*1000,
          'site_main_id',site_poi.site_main_id,
          'hr_id',hr_main.id,
          'hr_lastname',hr_main.lastname,
          'hr_firstname',hr_main.firstname,
          'hr_gender_label',th_gender.label,
          'hr_birthday_dt',CAST(hr_main.birthday_dt AS bigint)*1000,
          'hr_crisis_risk',hr_maindetail.crisis_risk,
          'hr_specific_arrangement',hr_maindetail.specific_arrangement,
          'hr_pickup_duration',hr_maindetail.pickup_duration*1000,
          'hr_delivery_duration',hr_maindetail.delivery_duration*1000,
          'site_type_code',site_main_type.code,
          'service_duration',site_poi.service_duration*1000,
          'waiting_duration',poi.waiting_duration*1000,
          'transport_mode_code',transport_mode.code,
          'label',site_main.label,
          'addr1',site_poi.addr1,
          'addr2',site_poi.addr2,
          'postcode',site_poi.postcode,
          'city',site_poi.city,
          'geom',ST_AsGeoJSON(site_poi.geom),
          'institutions',hr_institutions.list,
          'opening_hours',opening_hours.list,
          'target_hr',CAST(poi.target_hr AS bigint)*1000,
          'target_hr_auto',CAST(poi.target_hr_auto AS bigint)*1000,
          'target_hr_manual',CAST(poi.target_hr_manual AS bigint)*1000,
          'arrival_dt',CAST(poi.arrival_dt AS bigint)*1000,
          'notified_yn',poi.notified_yn,
          'visited_yn',poi.visited_yn,
          'visited_dt',CAST(poi.visited_dt AS bigint)*1000,
          'visit_missing_yn',poi.visit_missing_yn,
          'visit_comments',poi.visit_comments
        ) ORDER BY poi.orderroute) as pois
      FROM transport_route route
INNER JOIN transport_routesitepoi as poi ON poi.transport_route_id=route.id AND poi.rec_st <> 'D'
 LEFT JOIN transport_demand ON poi.transport_demand_id=transport_demand.id AND transport_demand.rec_st<>'D'
INNER JOIN site_poi ON poi.site_poi_id=site_poi.id AND site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st<>'D'
$sHRAccessRestrictionClause
 LEFT JOIN ( $sHoursByInstitutionSQL) as opening_hours ON opening_hours.site_main_id=site_main.id
INNER JOIN util_thesaurus AS site_main_type ON site_main.type_th=site_main_type.id
 LEFT JOIN hr_main ON poi.hr_main_id=hr_main.id AND hr_main.rec_st <> 'D'
 LEFT JOIN ( $sInstitutionsByHomePOISQL ) AS hr_institutions ON hr_institutions.id=site_poi.id
 LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
 LEFT JOIN hr_maindetail ON hr_main.id=hr_maindetail.hr_main_id AND hr_maindetail.rec_st <> 'D'
 LEFT JOIN util_thesaurus AS transport_mode ON transport_mode.id=hr_maindetail.transportmode_th
 LEFT JOIN util_thesaurus AS time_slot ON time_slot.id=route.timeslot_th
 LEFT JOIN vehicle_category ON vehicle_category.id=route.vehicle_category_id AND vehicle_category.rec_st <> 'D'
 LEFT JOIN site_poi AS site_poi_institution_transport_demand
            ON transport_demand.site_poi_id_institution = site_poi_institution_transport_demand.id
            AND site_poi_institution_transport_demand.rec_st<>'D'
            AND site_poi_institution_transport_demand.geom IS NOT NULL
 LEFT JOIN site_main AS site_main_institution_transport_demand
            ON site_poi_institution_transport_demand.site_main_id = site_main_institution_transport_demand.id
            AND site_main_institution_transport_demand.rec_st<>'D'
 $sInstitutionAccessRestrictionClause
 LEFT JOIN site_poisitepoi AS home_to_institution
            ON home_to_institution.site_poi_id_start = site_poi.id
            AND home_to_institution.site_poi_id_end = site_poi_institution_transport_demand.id
            AND home_to_institution.rec_st<>'D'
            AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
 LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi.id
                   AND institution_to_home.site_poi_id_start = site_poi_institution_transport_demand.id
                   AND institution_to_home.rec_st<>'D'
                   AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
 LEFT JOIN hr_main as driver ON route.hr_main_id_driver = driver.id AND driver.rec_st <> 'D'
      WHERE route.rec_st <> 'D' AND
            (route.date_dt = $sCalendarDtQuoted OR $sCalendarDtQuoted = '0') AND
            route.hr_main_id_driver = $sHRIdQuoted
   GROUP BY route.id,
            route.label,
            route.date_dt,
            route.timeslot_th,
            route.vehicle_category_id,
            route.site_poi_id_start,
            route.site_poi_id_end,
            route.start_hr,
            route.end_hr,
            route.distance,
            route.duration,
            route.rec_st,
            route.scenario_main_id,
            route.optim_main_id,
            time_slot.code,
            vehicle_category.code,
            vehicle_category.label,
            vehicle_category.daily_cost,
            vehicle_category.hourly_cost,
            vehicle_category.kilometric_cost,
            vehicle_category.co2_quantity,
            driver.id,
            driver.firstname,
            driver.lastname,
            route.start_driver_dt,
            route.end_driver_dt";
      $result = $this->db()->query($sSQL);
      $aResult = $result->fetchAll(PDO::FETCH_ASSOC);
      // Data postprocessing
      foreach($aResult as &$aRoute){
        $aRoute['POIs']=json_decode($aRoute['pois'],true);
        unset($aRoute['pois']);
        $aRoute['driver'] = array(
          'id'=>$aRoute['driver_id'],
          'firstname'=>$aRoute['driver_firstname'],
          'lastname'=>$aRoute['driver_lastname']
        );
        unset($aRoute['driver_id']);
        unset($aRoute['driver_firstname']);
        unset($aRoute['driver_lastname']);
        // Cast every geojson to an array structures
        foreach($aRoute['POIs'] as &$aPOI){
          $aPOI["geom"]=json_decode($aPOI["geom"],true);
        }
      }
    }
    return $aResult;
  }

  /**
  * Read the asked hr
  * @param string $hrId : HR Reference
  * @return array hr data
  **/
  public function get($hrId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$hrId]]);
    $sHRIdQuoted = $this->db()->quote($hrId);
    $sAccessRestrictionClause = $this->getHRAccessRestrictionClause();
    $sql = "SELECT hr_main.id,
                   hr_main.lastname,
                   hr_main.firstname,
                   hr_main.gender_th,
                   hr_firstcontact.content AS phonenumber,
                   hr_firstcontact.id AS hr_contact_id,
                   hr_main.notify_yn,
                   CAST(hr_main.notice_delay AS bigint)*1000 as notice_delay,
                   th_gender.code AS gender_code,
                   th_gender.label AS gender_label,
                   CAST(hr_main.birthday_dt AS bigint)*1000 as birthday_dt,
                   hr_main.status_th,
                   th_status.code AS status_code,
                   th_status.label AS status_label,
                   hr_main.type_th,
                   th_type.code AS type_code,
                   th_type.label AS type_label,
                   hr_maindetail.crisis_risk,
                   hr_maindetail.specific_arrangement,
                   hr_maindetail.transportmode_th,
                   hr_maindetail.pickup_duration*1000 as pickup_duration,
                   hr_maindetail.delivery_duration*1000 as delivery_duration,
                   th_transport_mode.code as transport_mode_code
              FROM hr_main
        LEFT JOIN (
          SELECT id,hr_main_id,content
          FROM hr_contact
          WHERE type_th = (SELECT id FROM util_thesaurus WHERE CAT='HR_CONTACT_TYPE' AND CODE='MOBILE_PHONE')
            AND hr_main_id = $sHRIdQuoted
          ORDER BY priority
          LIMIT 1
        ) AS hr_firstcontact ON hr_firstcontact.hr_main_id=hr_main.id
        LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
        INNER JOIN util_thesaurus th_status ON th_status.id=hr_main.status_th
        INNER JOIN util_thesaurus th_type ON th_type.id=hr_main.type_th
        LEFT JOIN hr_maindetail ON hr_maindetail.hr_main_id=hr_main.id
        LEFT JOIN util_thesaurus th_transport_mode ON th_transport_mode.id=hr_maindetail.transportmode_th
        -- check access to the hr data --
        LEFT JOIN hr_mainsite ON hr_mainsite.hr_main_id = hr_main.id
        LEFT JOIN util_thesaurus th_hr_mainsite ON th_hr_mainsite.id=hr_mainsite.type_th AND th_hr_mainsite.code='HOME'
        LEFT JOIN site_main ON hr_mainsite.site_main_id = site_main.id
        $sAccessRestrictionClause
             WHERE hr_main.id = $sHRIdQuoted";
    $result = $this->db()->query($sql);
    return $result->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Get a list of site corresponding to a specific hr.
  * @param string $sHRId : the concerned hr
  * @param string $sTypeCode : the concerned type code (indicating the role of the site for the hr)
  * @return array({object}) : array of Site object
  **/
  public function listSites($sHRId,$sTypeCode=""){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sHRId,$sTypeCode]]);

    $sHRIdQuoted = $this->db()->quote($sHRId);

    $sTypeCodeClause = "";
    if($sTypeCode!= ""){
      $sTypeCodeString = $this->db()->quote($sTypeCode);
      $sTypeCodeClause = " AND th_hr_mainsite_type.code = $sTypeCodeString ";
    }
    $sAccessRestrictionClause = $this->getAccessRestrictionClause();
    $sSQL = "SELECT
                    site_main.id,
                    site_main.code,
                    site_main.label,
                    site_main.site_main_id_entity,
                    entity.code AS site_main_code_entity,
                    entity.label AS site_main_label_entity,
                    site_main.status_th,
                    th_status.code AS status_code,
                    th_status.label AS status_label,
                    site_main.type_th,
                    th_type.code AS type_code,
                    th_type.label AS type_label,
                    site_poi.addr1,
                    site_poi.addr2,
                    site_poi.postcode,
                    site_poi.city,
                    site_poi.id AS poi_id,
                    ST_X(geom) AS lng,
                    ST_Y(geom) AS lat,
                    hr_mainsite.type_th AS hr_mainsite_type_th,
                    th_hr_mainsite_type.code AS hr_mainsite_type_code
              FROM hr_mainsite
        INNER JOIN site_main ON site_main.id=hr_mainsite.site_main_id
        $sAccessRestrictionClause
         LEFT JOIN site_main entity ON entity.id=site_main.site_main_id_entity
        INNER JOIN util_thesaurus th_hr_mainsite_type ON th_hr_mainsite_type.id=hr_mainsite.type_th
        INNER JOIN util_thesaurus th_status ON th_status.id=site_main.status_th
        INNER JOIN util_thesaurus th_type ON th_type.id=site_main.type_th
         LEFT JOIN site_poi ON site_poi.id = (
                  SELECT id
                    FROM site_poi
                   WHERE site_poi.site_main_id = site_main.id AND
                         geom IS NOT NULL AND
                         site_poi.rec_st<>'D'
                ORDER BY position
                   LIMIT 1 )
             WHERE hr_mainsite.rec_st<>'D' AND
                   site_main.rec_st <> 'D' AND
                   hr_mainsite.hr_main_id = $sHRIdQuoted
                   $sTypeCodeClause
          ORDER BY hr_mainsite.site_main_id ";
    $result = $this->db()->query($sSQL);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Add a hr
  * @param array $aData : data of the hr to be inserted.
  * @return array created hr with an id field
  */
  public function add($aData){

    $this->db()->beginTransaction();

    $sSQL = "INSERT INTO hr_main (lastname,firstname,gender_th,birthday_dt,status_th,type_th,notify_yn,notice_delay,rec_st)
                VALUES (:lastname,:firstname,:gender_th,:birthday_dt,:status_th,:type_th,:notify_yn,:notice_delay,:rec_st)
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute(array(
        ':lastname'=>$aData['lastname'],
        ':firstname'=>$aData['firstname'],
        ':gender_th'=>$aData['gender_th'],
        ':birthday_dt'=>round($aData['birthday_dt']/1000),
        ':status_th'=>$aData['status_th'],
        ':type_th'=>$aData['type_th'],
        ':notify_yn'=>$aData['notify_yn'],
        ':notice_delay'=>round($aData['notice_delay']/1000),
        ':rec_st'=>$aData['rec_st']
      ));
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "HR with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    $result = $oQuery->fetch(PDO::FETCH_ASSOC);

    $id = $result['id'];

    // Insert hr details
    $sSQL = "INSERT INTO hr_maindetail(hr_main_id,transportmode_th,crisis_risk,specific_arrangement,pickup_duration,delivery_duration)
                 VALUES(:id,:transportmode_th,:crisis_risk,:specific_arrangement,:pickup_duration,:delivery_duration)";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':id'=>$id,
      ':transportmode_th'=>$aData['transportmode_th'],
      ':crisis_risk'=>$aData['crisis_risk'],
      ':specific_arrangement'=>$aData['specific_arrangement'],
      ':pickup_duration'=>round($aData['pickup_duration']/1000),
      ':delivery_duration'=>round($aData['delivery_duration']/1000)
    ));

    // Insert hr contact (assuming a mobile phone)
    if(isset($aData['phonenumber']) && $aData['phonenumber']!=''){
      $sSQL = "INSERT INTO hr_contact(hr_main_id,content,type_th)
                   VALUES(
                     :id,
                     :content,
                     (SELECT id FROM util_thesaurus WHERE CAT='HR_CONTACT_TYPE' AND CODE='MOBILE_PHONE')
                   )";
      $oQuery = $this->db()->prepare($sSQL);
      $oQuery->execute(array(
        ':id'=>$id,
        ':content'=>$aData['phonenumber']
      ));
    }

    $this->db()->commit();

    return $result;

  }

  /**
   * Add a site to a hr's site list.
   * @param $sHRId string : hr identifier
   * @param $sSiteId string : site identifier
   * @param $sTypeCode string : site type code
   * @return array with a id of the hr/site association in case of a successfull site association
   */
  public function addSite($sHRId,$sSiteId,$sTypeCode){
    $aResult=array();    
    $sSQL ="INSERT INTO hr_mainsite (hr_main_id,site_main_id,type_th)
                  VALUES (:hr_main_id,:site_main_id,(SELECT id FROM util_thesaurus WHERE code=:code and cat=:cat))
                  RETURNING id ";
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute(array(
        ':hr_main_id'=>$sHRId,
        ':site_main_id'=>$sSiteId,
        ':code'=>$sTypeCode,
        ':cat'=>'HR_MAINSITE_TYPE'
      ));
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Relation between hr " . $sHRId . " and site " . $sSiteId . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    $aResult = $oQuery->fetch(PDO::FETCH_ASSOC);
    return $aResult;
  }

  /**
  * Mark an association between a hr and a site as removed
  * @param string $sHRId : id of the hr in the association to be removed.
  * @param string $sSiteId : id of the site in the association to be removed.
  * @return array : marked association with id
  */
  public function removeSite($sHRId,$sSiteId){
    $aResult=array();    
    if($this->hasAccess($sHRId)){  
      $sHRIdQuoted = $this->db()->quote($sHRId);
      $sSiteIdQuoted = $this->db()->quote($sSiteId);
      $sSQL = "UPDATE hr_mainsite SET rec_st='D'
                WHERE hr_main_id=$sHRIdQuoted AND site_main_id=$sSiteIdQuoted
            RETURNING id";
      $result = $this->db()->query($sSQL);
      $aResult = $result->fetch(PDO::FETCH_ASSOC);
    }
    return $aResult;
  }

  /**
  * Update durations for a hr
  * @param array $aData : data of the hr to be updated.
  * @return boolean : true in case of success
  */
  public function updateDurations($aData){
    $bResult=false;    
    if($this->hasAccess($aData['id'])){    
      // Check whether hr_maindetail raw already exists
      // Normally, hr main details should be created at hr creation
      $sSQL = "SELECT id FROM hr_maindetail WHERE hr_main_id=".$this->db()->quote($aData['id']);
      $aResult = $this->db()->query($sSQL);
      $aHRMainDetail = $aResult->fetch(PDO::FETCH_ASSOC);
      if(isset($aHRMainDetail["id"])){
        // Update hr details
        $sSQL = "UPDATE hr_maindetail SET
                    pickup_duration=:pickup_duration,
                    delivery_duration=:delivery_duration
                 WHERE hr_main_id=:id";
      }
      else{
        // Insert hr details
        $sSQL = "INSERT INTO hr_maindetail(hr_main_id,pickup_duration,delivery_duration)
                     VALUES(:id,:pickup_duration,:delivery_duration)";
      }
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute(array(
        ':id'=>$aData['id'],
        ':pickup_duration'=>isset($aData['pickup_duration'])?round($aData['pickup_duration']/1000):NULL,
        ':delivery_duration'=>isset($aData['delivery_duration'])?round($aData['delivery_duration']/1000):NULL,
      ));
    }
    return $bResult;
  }

  /**
  * Update a hr
  * @param array $aData : data of the hr to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $bResult=false;    
    if($this->hasAccess($aData['id'])){
      $this->db()->beginTransaction();

      $sSQL = "UPDATE hr_main SET
                  lastname=:lastname,
                  firstname=:firstname,
                  gender_th=:gender_th,
                  birthday_dt=:birthday_dt,
                  status_th=:status_th,
                  type_th=:type_th,
                  notify_yn=:notify_yn,
                  notice_delay=:notice_delay,
                  rec_st=:rec_st
                WHERE id=:id";
      $oQuery = $this->db()->prepare($sSQL);

      $bResult = $oQuery->execute(array(
        ':id'=>$aData['id'],
        ':lastname'=>$aData['lastname'],
        ':firstname'=>$aData['firstname'],
        ':gender_th'=>$aData['gender_th'],
        ':birthday_dt'=>round($aData['birthday_dt']/1000),
        ':status_th'=>$aData['status_th'],
        ':type_th'=>$aData['type_th'],
        ':notify_yn'=>$aData['notify_yn'],
        ':notice_delay'=>round($aData['notice_delay']/1000),
        ':rec_st'=>$aData['rec_st']
      ));
      // Check whether hr_maindetail raw already exists
      // Normally, hr main details should be created at hr creation
      $sSQL = "SELECT id FROM hr_maindetail WHERE hr_main_id=".$this->db()->quote($aData['id']);
      $aResult = $this->db()->query($sSQL);
      $aHRMainDetail = $aResult->fetch(PDO::FETCH_ASSOC);
      if(isset($aHRMainDetail["id"])){
        // Update hr details
        $sSQL = "UPDATE hr_maindetail SET
                    transportmode_th=:transportmode_th,
                    specific_arrangement=:specific_arrangement,
                    crisis_risk=:crisis_risk,
                    pickup_duration=:pickup_duration,
                    delivery_duration=:delivery_duration
                 WHERE hr_main_id=:id";
        $oQuery = $this->db()->prepare($sSQL);
        $oQuery->execute(array(
          ':id'=>$aData['id'],
          ':transportmode_th'=>$aData['transportmode_th'],
          ':crisis_risk'=>$aData['crisis_risk'],
          ':specific_arrangement'=>$aData['specific_arrangement'],
          ':pickup_duration'=>round($aData['pickup_duration']/1000),
          ':delivery_duration'=>round($aData['delivery_duration']/1000)
        ));
      }
      else{
        // Insert hr details
        $sSQL = "INSERT INTO hr_maindetail(hr_main_id,transportmode_th,crisis_risk,specific_arrangement,pickup_duration,delivery_duration)
                     VALUES(:id,:transportmode_th,:crisis_risk,:specific_arrangement,:pickup_duration,:delivery_duration)";
        $oQuery = $this->db()->prepare($sSQL);
        $oQuery->execute(array(
          ':id'=>$aData['id'],
          ':transportmode_th'=>$aData['transportmode_th'],
          ':crisis_risk'=>$aData['crisis_risk'],
          ':specific_arrangement'=>$aData['specific_arrangement'],
          ':pickup_duration'=>round($aData['pickup_duration']/1000),
          ':delivery_duration'=>round($aData['delivery_duration']/1000)
        ));
      }

      // Check whether hr_contact raw already exists
      // Normally, hr main contact should be created at hr creation
      // If the phoneumber is not set, do nothing (which means we can not unset a phone number
      //   through the interface in the current version)
      if(isset($aData['phonenumber']) && $aData['phonenumber']!=''){    
        if(isset($aData["hr_contact_id"]) && $aData["hr_contact_id"]!=''){
          // Update hr contact
          $sSQL = "UPDATE hr_contact SET
                      content=:content
                   WHERE id=:id";
          $oQuery = $this->db()->prepare($sSQL);
          $oQuery->execute(array(
            ':id'=>$aData['hr_contact_id'],
            ':content'=>$aData['phonenumber']
          ));
        }
        else{
          // Insert hr contact
          $sSQL = "INSERT INTO hr_contact(hr_main_id,content,type_th)
                       VALUES(
                               :id,
                               :content,
                               (SELECT id FROM util_thesaurus WHERE CAT='HR_CONTACT_TYPE' AND CODE='MOBILE_PHONE')
                             )";
          $oQuery = $this->db()->prepare($sSQL);
          $oQuery->execute(array(
            ':id'=>$aData['id'],
            ':content'=>$aData['phonenumber']
          ));
        }
      }

      $this->db()->commit();
    }

    return $bResult;
  }

  /**
  * Mark a hr as removed
  * @param string $sHRID : id of the hr to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sHRID){
    $bResult=false;    
    if($this->hasAccess($sHRID)){
      $query = "UPDATE hr_main SET rec_st='D' WHERE id=" . $this->db()->quote($sHRID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a hr.
  * @param string $sHRID : id of the hr to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sHRID){
    $this->db()->beginTransaction();
    $query = "DELETE FROM datachecker_detail WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM hr_mainsite WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM hr_contact WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM transport_demandtime WHERE transport_demand_id IN (SELECT id
                       FROM transport_demand
                       WHERE hr_main_id=" . $this->db()->quote($sHRID).')';
    $this->db()->exec($query);
    $query = "DELETE FROM transport_demand WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM transport_calendar WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM transport_routesitepoi WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM user_mainhr WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM hr_maindetail WHERE hr_main_id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    $query = "DELETE FROM hr_main WHERE id=" . $this->db()->quote($sHRID);
    $this->db()->exec($query);
    return $this->db()->commit();
  }



}