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
 *  Class to handle Routes
 *  @creationdate 2018-10-31
 **/

namespace OSS\Model;

use PDO;
use Exception;
use OSS\BaseObject;

/**
* Class for handling Routes
*/
class RouteDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
   * Get a list of POIs that can be displayed as selectable POIs in the route computation menu
   * @param $aData array : contains an institutions filter
   * @return array : set of POIs that can be used to build routes
   */
  public function listPOIForTransport($aData){
    $sInstitutionIDClause = "";
    if(isset($aData['institutions']) && $aData['institutions']!= null && $aData['institutions']!= ""){
      $aInstitutions = explode(";",$aData['institutions']);
      $sInstitutionsQuoted = "";
      foreach($aInstitutions as $sInstitution){
        if($sInstitutionsQuoted != ""){
          $sInstitutionsQuoted.=',';
        }
        $sInstitutionsQuoted .= $this->db()->quote($sInstitution);
      }
      // Enables filtering with an aggregator : we want to keep all POIs for which the associated list of institutions
      //   intersects the provided list of institutions
      $sInstitutionIDClause = " HAVING array_agg(site_main_institution.id) && ARRAY[$sInstitutionsQuoted]::uuid[] ";
    }
    $sAccessRestrictionClause = $this->getAccessRestrictionClause();    
    $sql = "SELECT
                   site_poi.id,
                   site_poi.site_main_id,
                   site_poi.label,
                   site_poi.position,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.country_th,
                   site_poi.type_th,
                   site_poi.service_duration*1000 as service_duration,
                   ST_AsGeoJSON(site_poi.geom) AS geom,
                   site_poi.rec_st,
                   home.type_th as site_type_th,
                   home_type.code as site_type_code,
                   home_type.label as site_type_label,
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
                   json_agg(json_build_object(
                     'id',site_main_institution.id,
                     'label',site_main_institution.label,
                     'poi_id',site_poi_institution.id,
                     'home_to_institution_acceptable_duration',home_to_institution.acceptable_duration*1000,
                     'institution_to_home_acceptable_duration',institution_to_home.acceptable_duration*1000
                   )) as institutions
              FROM site_poi
        INNER JOIN site_main as home on home.id=site_poi.site_main_id AND home.rec_st<>'D'
        $sAccessRestrictionClause
        INNER JOIN util_thesaurus as home_type on home.type_th=home_type.id AND home_type.code = 'HOME'
         LEFT JOIN hr_mainsite as hr_home on home.id=hr_home.site_main_id AND hr_home.rec_st<>'D'
         LEFT JOIN hr_main on hr_main.id=hr_home.hr_main_id AND hr_main.rec_st<>'D'
        INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
                                                   AND hr_main_status.code<>'DISABLED'
         LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
         LEFT JOIN hr_maindetail on hr_main.id=hr_maindetail.hr_main_id AND hr_main.rec_st<>'D'
         LEFT JOIN util_thesaurus as transport_mode on transport_mode.id=hr_maindetail.transportmode_th
        INNER JOIN hr_mainsite as hr_mainsite_institution on hr_mainsite_institution.hr_main_id=hr_main.id AND hr_mainsite_institution.rec_st<>'D'
        INNER JOIN site_main as site_main_institution ON site_main_institution.id=hr_mainsite_institution.site_main_id AND site_main_institution.rec_st<>'D'
         LEFT JOIN site_poi as site_poi_institution ON site_poi_institution.id = (
                  SELECT id
                    FROM site_poi
                   WHERE site_poi.site_main_id = site_main_institution.id AND
                         geom IS NOT NULL AND
                         site_poi.rec_st<>'D'
                ORDER BY position
                   LIMIT 1 )
         LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi.id
                                                        AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                                        AND home_to_institution.rec_st<>'D'
                                                        AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
         LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi.id
                                                        AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                                        AND institution_to_home.rec_st<>'D'
                                                        AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
        INNER JOIN util_thesaurus as th_institution ON site_main_institution.type_th=th_institution.id AND th_institution.code = 'INSTITUTION'
             WHERE site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
          GROUP BY site_poi.id,
                   site_poi.site_main_id,
                   site_poi.label,
                   site_poi.position,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.country_th,
                   site_poi.type_th,
                   site_poi.service_duration,
                   site_poi.geom,
                   site_poi.rec_st,
                   home.type_th,
                   home_type.code,
                   home_type.label,
                   hr_main.firstname,
                   hr_main.lastname,
                   th_gender.label,
                   hr_main.birthday_dt,
                   hr_maindetail.crisis_risk,
                   hr_maindetail.specific_arrangement,
                   hr_maindetail.pickup_duration,
                   hr_maindetail.delivery_duration,
                   hr_main.id,
                   transport_mode.code
                   $sInstitutionIDClause
          ORDER BY site_poi.site_main_id,site_poi.position";
    $result = $this->db()->query($sql);
    $aPOIs = $result->fetchAll(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    foreach($aPOIs as &$aPOI){
      $aPOI["geom"]=json_decode($aPOI["geom"],true);
      $aPOI["institutions"]=json_decode($aPOI["institutions"],true);
    }
    return $aPOIs;
  }

  /**
   * List started routes (ongoing or terminated) for a given timerange
   * ListStarted function is aimed to replace old list function
   * @param $Data : array(
   *  onGoingStatus => 'S': Started, 'E': Ended
   * )
   */
  public function listStarted($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);

    $sWhereClause = "";
    if(isset($aData['onGoingStatus']) && $aData['onGoingStatus']=="S"){
      $sWhereClause = " AND start_driver_dt IS NOT NULL AND end_driver_dt IS NULL";
    }else{
      if($aData['onGoingStatus']=="E"){
        $sWhereClause = " AND start_driver_dt IS NOT NULL AND end_driver_dt IS NOT NULL";
      }
    }

    $sSQL = "SELECT
    route.id,
    route.label,
    route.date_dt,
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
    route.cost,
    route.co2,
    route.site_poi_id_start,
    route.site_poi_id_end,
    route.rec_st,
    route.scenario_main_id,
    route.optim_main_id,
    driver.id as driver_id,
    driver.firstname as driver_firstname,
    driver.lastname as driver_lastname,
    CAST(route.start_driver_dt AS bigint)*1000 as start_driver_dt,
    CAST(route.end_driver_dt AS bigint)*1000 as end_driver_dt,
    ST_AsGeoJSON(gis_transportroute_current.geom) as vehicle_current_location,
    json_agg(json_build_object(
        'id',site_poi.id,
 --       'transport_demand_id',transport_demand.id,
        'hr_id',hr_main.id,
        'hr_lastname',hr_main.lastname,
        'hr_firstname',hr_main.firstname,
        'hr_birthday_dt',CAST(hr_main.birthday_dt AS bigint)*1000,
        'hr_crisis_risk',hr_maindetail.crisis_risk,
        'hr_specific_arrangement',hr_maindetail.specific_arrangement,
        'hr_pickup_duration',hr_maindetail.pickup_duration*1000,
        'hr_delivery_duration',hr_maindetail.delivery_duration*1000,
        'site_type_code',site_main_type.code,
        'waiting_duration',poi.waiting_duration*1000,
        'transport_mode_code',transport_mode.code,
        'label',site_main.label,
        'home_poi_label',site_poi.label,
        'institution_label',site_main_institution.label,
        'geom',ST_AsGeoJSON(site_poi.geom),
        'target_hr',CAST(poi.target_hr AS bigint)*1000,
        'target_hr_auto',CAST(poi.target_hr_auto AS bigint)*1000,
        'target_hr_manual',CAST(poi.target_hr_manual AS bigint)*1000,        
        'arrival_dt',CAST(poi.arrival_dt AS bigint)*1000,
        'notified_yn',poi.notified_yn,
        'visited_yn',poi.visited_yn,
        'visited_dt',CAST(poi.visited_dt AS bigint)*1000,
        'visit_missing_yn',poi.visit_missing_yn,
        'visit_comments',poi.visit_comments,
        'addr1',site_poi.addr1,
        'city',site_poi.city        
      ) ORDER BY poi.orderroute) as pois    
    FROM transport_route route
    LEFT JOIN vehicle_category ON vehicle_category.id=route.vehicle_category_id AND vehicle_category.rec_st <> 'D'
    LEFT JOIN hr_main as driver ON route.hr_main_id_driver = driver.id AND driver.rec_st <> 'D'

    -- Get POIs and details for each one
    INNER JOIN transport_routesitepoi as poi ON poi.transport_route_id=route.id AND poi.rec_st <> 'D'
    INNER JOIN site_poi ON poi.site_poi_id=site_poi.id AND site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
    INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st<>'D'
    LEFT JOIN hr_main ON poi.hr_main_id=hr_main.id AND hr_main.rec_st <> 'D'
    LEFT JOIN hr_maindetail ON hr_main.id=hr_maindetail.hr_main_id AND hr_maindetail.rec_st <> 'D'
    LEFT JOIN transport_demand ON transport_demand.id=poi.transport_demand_id AND transport_demand.rec_st <>'D'
    LEFT JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution=site_poi_institution.id
                                              AND site_poi_institution.rec_st<>'D'
                                              AND site_poi_institution.geom IS NOT NULL
    LEFT JOIN site_main as site_main_institution ON site_main_institution.id=site_poi_institution.site_main_id
                                              AND site_main_institution.rec_st<>'D'
    LEFT JOIN gis_transportroute_current ON gis_transportroute_current.transport_route_id=route.id
                                        AND gis_transportroute_current.geom IS NOT NULL
    
    -- Thesaurus
    INNER JOIN util_thesaurus AS time_slot ON time_slot.id=route.timeslot_th
    LEFT JOIN util_thesaurus AS transport_mode ON transport_mode.id=hr_maindetail.transportmode_th
    INNER JOIN util_thesaurus AS site_main_type ON site_main.type_th=site_main_type.id
    
    WHERE true
          $sWhereClause
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
             route.cost,
             route.co2,
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
             route.end_driver_dt,
             gis_transportroute_current.geom";

    $result = $this->db()->query($sSQL);
    $aResult = $result->fetchAll(PDO::FETCH_ASSOC);

    foreach($aResult as &$aRoute){

      $aRoute['driver'] = array(
        'id'=>$aRoute['driver_id'],
        'firstname'=>$aRoute['driver_firstname'],
        'lastname'=>$aRoute['driver_lastname']
      );
      $aRoute['POIs']=json_decode($aRoute['pois'],true);
      $aRoute['vehicle_current_location']=json_decode($aRoute['vehicle_current_location'],true);

      // Cast every geojson to an array structures
      foreach($aRoute['POIs'] as &$aPOI){
        $aPOI["geom"]=json_decode($aPOI["geom"],true);
      }

      unset($aRoute['pois']);
      unset($aRoute['driver_id']);
      unset($aRoute['driver_firstname']);
      unset($aRoute['driver_lastname']);     
    }

    return $aResult;
  }

  /**
   * Given a hrMainId, returns all pickup/delivery events
   */
  public function listRoutesByUserMainId($hrMainId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$hrMainId]);

    $hrMainIdQuoted = $this->db()->quote($hrMainId);

    $sql = "SELECT site_poi.label, site_poi.addr1, site_poi.city,
                   poi_institution.label,
                   CAST(transport_route.date_dt AS bigint)*1000 as date_dt,
                   CAST(target_hr as bigint)*1000 as target_hr, visited_yn, visited_dt, arrival_dt,
                   transport_route.timeslot_th, time_slot.code as timeslot_code
            FROM transport_routesitepoi
            INNER JOIN site_poi ON transport_routesitepoi.site_poi_id = site_poi.id
            INNER JOIN transport_demand ON transport_routesitepoi.transport_demand_id=transport_demand.id
            INNER JOIN site_poi poi_institution ON transport_demand.site_poi_id_institution=poi_institution.id
            INNER JOIN transport_route ON transport_routesitepoi.transport_route_id=transport_route.id
            INNER JOIN util_thesaurus AS time_slot ON time_slot.id=transport_route.timeslot_th
            WHERE transport_routesitepoi.hr_main_id=$hrMainIdQuoted AND target_hr is not null
            ORDER BY transport_route.date_dt";
    $result = $this->db()->query($sql);
    $aResult = $result->fetchAll(PDO::FETCH_ASSOC);

    return $aResult;
  }

  /**
   * List existing routes
   * The list of input filters is the following
   *   timeSlotId : the target timeslot id,
   *   institutions : the target list of institution ids,
   *   demands : whether we work with demands or nod,
   *   scenarioMainId : target scenario (optional)
   * @param $aData array : some filters
   * @param boolean $bWithoutOptimizedRoutes : if true, will only use routes that do not result from optimization
   */
  public function list($aData,$bWithoutOptimizedRoutes=false){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=[];
    if(isset($aData['timeSlotId']) && $aData['timeSlotId']!=null && isset($aData['institutions']) && $aData['institutions']!=null){
      $sTimeSlotIdQuoted = $this->db()->quote($aData['timeSlotId']);
      $sInstitutionsIdsQuoted = "";
      $aInstitutionsIds = explode(";",$aData['institutions']);
      foreach($aInstitutionsIds as $sInstitutionId){
        if($sInstitutionsIdsQuoted!=''){
          $sInstitutionsIdsQuoted.=',';
        }
        $sInstitutionsIdsQuoted.=$this->db()->quote($sInstitutionId);
      }
      $sWithDemandsClause="";
      if(isset($aData['demands'])){
        $sComparator = ($aData['demands']=='true') ? ">" : "=";
        $sWithDemandsClause = " AND (demands_count.count $sComparator 0 OR demands_count.count IS NULL) ";
      }
      $sScenarioMainIdClause="";
      if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!=null && $aData['scenarioMainId']!=""){
        $sScenarioMainIdQuoted = $this->db()->quote($aData['scenarioMainId']);
        $sScenarioMainIdClause = " AND route.scenario_main_id = $sScenarioMainIdQuoted ";
      }
      else{
        // Explicitely target routes that were saved out of any scenario context
        $sScenarioMainIdClause = " AND route.scenario_main_id IS NULL ";
      }
      $sWithoutOptimizedRoutesClause = "";
      if($bWithoutOptimizedRoutes){
        $sWithoutOptimizedRoutesClause = " AND route.optim_main_id IS NULL ";
      }

      // SQL query that collects the number of transport demands involved per route
      $sDemandsCountbyRouteSQL =
      " SELECT
          transport_routesitepoi.transport_route_id,count(transport_demand.id)
      FROM transport_routesitepoi
 LEFT JOIN transport_demand ON transport_routesitepoi.transport_demand_id=transport_demand.id AND transport_demand.rec_st<>'D'
INNER JOIN site_poi ON transport_routesitepoi.site_poi_id=site_poi.id AND site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st<>'D'
INNER JOIN util_thesaurus on site_main.type_th=util_thesaurus.id AND util_thesaurus.code = 'HOME'
     WHERE transport_routesitepoi.rec_st<>'D'
  GROUP BY transport_routesitepoi.transport_route_id ";

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
     WHERE transport_demandtime.rec_st<>'D'
  GROUP BY transport_demand_id";

      // SQL query that collects the opening hours for some institutions sites
      $sHoursByInstitutionSQL =
      " SELECT site_main.id as site_main_id, json_agg(json_build_object(
          'start_hr',site_hour.start_hr*1000,
          'end_hr',site_hour.end_hr*1000
        )) AS list
        FROM site_main
  INNER JOIN site_hour ON site_hour.site_main_id=site_main.id AND site_hour.timeslot_th = $sTimeSlotIdQuoted
                      AND site_hour.rec_st <> 'D'
  INNER JOIN util_thesaurus ON site_main.type_th=util_thesaurus.id AND util_thesaurus.code = 'INSTITUTION'
       WHERE site_main.rec_st <> 'D'
       GROUP BY site_main.id";

      // SQL query that collects the institutions present in a route
      $sInstitutionsByRouteSQL =
      " SELECT transport_route.id as route_id, array_agg(site_poi.site_main_id) AS ids
        FROM transport_route
  INNER JOIN transport_routesitepoi ON transport_routesitepoi.transport_route_id=transport_route.id
                                    AND transport_routesitepoi.rec_st <> 'D'
  INNER JOIN site_poi ON transport_routesitepoi.site_poi_id=site_poi.id AND site_poi.rec_st <> 'D' AND site_poi.geom IS NOT NULL
  INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st <> 'D'
  INNER JOIN util_thesaurus ON site_main.type_th=util_thesaurus.id
       WHERE util_thesaurus.code = 'INSTITUTION' AND transport_route.rec_st <> 'D'
    GROUP BY transport_route.id ";

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

      $sSQL = "SELECT
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
      route.cost,
      route.co2,
      route.site_poi_id_start,
      route.site_poi_id_end,
      route.rec_st,
      route.scenario_main_id,
      route.optim_main_id,
      driver.id as driver_id,
      driver.firstname as driver_firstname,
      driver.lastname as driver_lastname,
      CAST(route.start_driver_dt AS bigint)*1000 as start_driver_dt,
      CAST(route.end_driver_dt AS bigint)*1000 as end_driver_dt,
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
        'timeslots',timeslots.list,
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
           LEFT JOIN ( $sDemandsCountbyRouteSQL ) AS demands_count ON demands_count.transport_route_id=route.id
          INNER JOIN transport_routesitepoi as poi ON poi.transport_route_id=route.id AND poi.rec_st <> 'D'
           LEFT JOIN transport_demand ON poi.transport_demand_id=transport_demand.id AND transport_demand.rec_st<>'D'
           LEFT JOIN ( $sTimeslotsByDemandSQL ) AS timeslots ON timeslots.transport_demand_id=transport_demand.id
          INNER JOIN site_poi ON poi.site_poi_id=site_poi.id AND site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
          INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st<>'D'
          LEFT JOIN ( $sHoursByInstitutionSQL) as opening_hours ON opening_hours.site_main_id=site_main.id
          INNER JOIN util_thesaurus AS site_main_type ON site_main.type_th=site_main_type.id
          INNER JOIN ( $sInstitutionsByRouteSQL ) AS institutions ON institutions.route_id=route.id AND
            -- join when the route institutions list matches the input list (regardless the list order) --
            institutions.ids && ARRAY[$sInstitutionsIdsQuoted]::uuid[]
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
          WHERE route.rec_st <> 'D' AND route.timeslot_th = $sTimeSlotIdQuoted
                AND route.date_dt IS NULL
                $sWithDemandsClause
                $sScenarioMainIdClause
                $sWithoutOptimizedRoutesClause
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
                 route.cost,
                 route.co2,
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
   * Return some information about a route
   * @param string $sRouteId : the route identifier
   * @return array : a route with id,hr_main_id_driver and scenario_main_id fields
   */
  public function get($sRouteId){
    $sRouteIdQuoted = $this->db()->quote($sRouteId);
    $sSQL = "SELECT 
               transport_route.id,
               transport_route.label,
               CAST(transport_route.date_dt AS bigint)*1000 as date_dt,
               time_slot.label as timeslot_label,
               transport_route.hr_main_id_driver,
               transport_route.scenario_main_id
             FROM transport_route
             LEFT JOIN util_thesaurus AS time_slot ON time_slot.id=transport_route.timeslot_th
             WHERE transport_route.id=$sRouteIdQuoted";
    $result = $this->db()->query($sSQL);
    return $result->fetch(PDO::FETCH_ASSOC);
  }


  /**
   * Update a route
   * @param $aData array : a route to update
   */
  public function update($aData){
    $aReplacementValues = array(
      ":id" => $aData['route']['id'],
      ":label" => $aData['route']['label'],
      ':start_hr' => isset($aData['route']['start_hr']) ? round($aData['route']['start_hr']/1000) : NULL,
      ':end_hr' => isset($aData['route']['end_hr']) ? round($aData['route']['end_hr']/1000) : NULL,
      ":duration" => round($aData['route']['duration']),
      ":distance" => round($aData['route']['distance']),
      ":cost" => round($aData['route']['cost']),
      ":co2" => round($aData['route']['co2']),
      ":vehicle_category_id" => $aData['route']['vehicleCategoryId'],
      ":scenario_main_id" => $aData['scenarioMainId'],
      ":optim_main_id" => $aData['route']['optimMainId'],
      ":hr_main_id_driver" => $aData['route']['driverId']
    );
    if(isset($aData['calendarDt'])){
      $aReplacementValues[":date_dt"]=round($aData['calendarDt']/1000);
      $sSQL = "UPDATE transport_route
                  SET label=:label,
                      vehicle_category_id=:vehicle_category_id,
                      start_hr=:start_hr,
                      end_hr=:end_hr,
                      duration=:duration,
                      distance=:distance,
                      cost=:cost,
                      co2=:co2,
                      scenario_main_id=:scenario_main_id,
                      optim_main_id=:optim_main_id,
                      date_dt=:date_dt,
                      hr_main_id_driver=:hr_main_id_driver
                WHERE id=:id";
    }
    else{
      $sSQL = "UPDATE transport_route
                  SET label=:label,
                      vehicle_category_id=:vehicle_category_id,
                      start_hr=:start_hr,
                      end_hr=:end_hr,
                      duration=:duration,
                      distance=:distance,
                      cost=:cost,
                      co2=:co2,
                      scenario_main_id=:scenario_main_id,
                      optim_main_id=:optim_main_id,
                      hr_main_id_driver=:hr_main_id_driver
                WHERE id=:id";
    }
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacementValues);
  }

  /**
   * Add a route
   * @param $aData array : a route to be added
   * @return array : added route
   */
  public function add($aData){
    $aReplacementValues = array(
      ':label' => $aData['route']['label'],
      ':start_hr' => isset($aData['route']['start_hr']) ? round($aData['route']['start_hr']/1000) : NULL,
      ':end_hr' => isset($aData['route']['end_hr']) ? round($aData['route']['end_hr']/1000) : NULL,
      ':duration' => round($aData['route']['duration']),
      ':distance' => round($aData['route']['distance']),
      ':cost' => $aData['route']['cost'],
      ':co2' => $aData['route']['co2'],
      ':timeslot_th' => $aData['timeSlotId'],
      ":vehicle_category_id" => $aData['route']['vehicleCategoryId'],
      ":scenario_main_id" => $aData['scenarioMainId'],
      ":optim_main_id" => $aData['route']['optimMainId']
    );
    if(isset($aData['calendarDt'])){
      $aReplacementValues[":date_dt"]=round($aData['calendarDt']/1000);
      $sSQL = "INSERT INTO transport_route(
                             code,
                             timeslot_th,
                             vehicle_category_id,
                             label,
                             start_hr,
                             end_hr,
                             distance,
                             duration,
                             cost,
                             co2,
                             scenario_main_id,
                             optim_main_id,
                             date_dt
                           )
                    VALUES (
                              uuid_generate_v1(),
                              :timeslot_th,
                              :vehicle_category_id,
                              :label,
                              :start_hr,
                              :end_hr,
                              :distance,
                              :duration,
                              :cost,
                              :co2,
                              :scenario_main_id,
                              :optim_main_id,
                              :date_dt
                            )
                 RETURNING id";
      }
      else{
        $sSQL = "INSERT INTO transport_route(
                             code,
                             timeslot_th,
                             vehicle_category_id,
                             label,
                             start_hr,
                             end_hr,
                             distance,
                             duration,
                             cost,
                             co2,
                             scenario_main_id,
                             optim_main_id
                           )
                     VALUES (
                              uuid_generate_v1(),
                              :timeslot_th,
                              :vehicle_category_id,
                              :label,
                              :start_hr,
                              :end_hr,
                              :distance,
                              :duration,
                              :cost,
                              :co2,
                              :scenario_main_id,
                              :optim_main_id
                            )
                     RETURNING id";
    }
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacementValues);
    $aData['route']['id'] = $oQuery->fetch(PDO::FETCH_ASSOC)['id'];
    return $aData['route'];
  }

  /**
   * Delete the POIs for a routes
   * @param $aData array : route for which we want delete the POIs
   */
  function deletePOIs($aRoute){
    $sSQL = "DELETE FROM transport_routesitepoi WHERE transport_route_id = :id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array("id"=>$aRoute['id']));
  }

  /**
   * Insert the POIs for a route
   * @param $aData array : route for which we want insert the POIs
   */
  function insertPOIs($aRoute){
    $sValues = "";
    $aReplacementValues = array();
    for($j=0;$j<count($aRoute['POIs']);$j++){
      if($sValues!=""){
        $sValues.=",";
      }
      $sValues .= "( :transport_route_id_$j, 
                     :site_poi_id_$j, 
                     :hr_main_id_$j, 
                     :target_hr_$j, 
                     :target_hr_manual_$j, 
                     :target_hr_auto_$j, 
                     :orderroute_$j, 
                     :transport_demand_id_$j, 
                     :waiting_duration_$j )";
      $aReplacementValues[":transport_route_id_$j"] = $aRoute['id'];
      $aReplacementValues[":site_poi_id_$j"] = $aRoute['POIs'][$j]['id'];
      $aReplacementValues[":hr_main_id_$j"] = $aRoute['POIs'][$j]['hr_id'];
      $aReplacementValues[":target_hr_$j"] = round($aRoute['POIs'][$j]['target_hr']/1000);
      $aReplacementValues[":target_hr_manual_$j"] = round($aRoute['POIs'][$j]['target_hr_manual']/1000);
      $aReplacementValues[":target_hr_auto_$j"] = round($aRoute['POIs'][$j]['target_hr_auto']/1000);
      $aReplacementValues[":transport_demand_id_$j"] = $aRoute['POIs'][$j]['transport_demand_id'];
      $aReplacementValues[":waiting_duration_$j"] = round($aRoute['POIs'][$j]['waiting_duration']/1000);
      $aReplacementValues[":orderroute_$j"] = $j;
    }
    $sSQL = "INSERT INTO transport_routesitepoi (
      transport_route_id,
      site_poi_id,
      hr_main_id,
      target_hr,
      target_hr_manual,
      target_hr_auto,
      orderroute,
      transport_demand_id,
      waiting_duration
      ) VALUES $sValues";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacementValues);
  }

  /**
  * Mark a route as removed
  * @param string $sRouteID : id of the route to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sRouteID){
    $query = "UPDATE transport_route SET rec_st='D' WHERE id=" . $this->db()->quote($sRouteID);
    return $this->db()->exec($query);
  }

  /**
   * List the POIs from transport_routesitepoi table that compose a route.
   * @param string $sRouteID : the route ID
   * @return array : the POIs from transport_routesitepoi (one id field per POI)
   */
  public function listSitePOIs($sRouteID){
    $sSQL = "SELECT id FROM transport_routesitepoi WHERE transport_route_id=" . $this->db()->quote($sRouteID);
    $result = $this->db()->query($sSQL);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Delete a route
  * @param string $sRouteID : id of the route to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sRouteID){
    $bResult = false;
    if($this->isAdmin()){
      $query = "DELETE FROM datachecker_detail WHERE transport_route_id=" . $this->db()->quote($sRouteID);
      $this->db()->exec($query);           
      $query = "DELETE FROM transport_routesitepoi WHERE transport_route_id=" . $this->db()->quote($sRouteID);
      $this->db()->exec($query);
      $query = "DELETE FROM transport_route WHERE id=" . $this->db()->quote($sRouteID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a route POI
  * @param string $sRoutePOIID : id of the route POI to be deleted.
  * @return boolean : true in case of success
  */
  public function deleteSitePOI($sRoutePOIID){
    $bResult = false;
    if($this->isAdmin()){
      $query = "DELETE FROM transport_routesitepoi WHERE id=" . $this->db()->quote($sRoutePOIID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
   * Copy an existing route into another existing route, changing some data
   *   id (auto-generated)
   *   code (auto-generated)
   *   newDateDt (provided as an input or copied if missing from the input)
   *   newTimeslotTh (provided as an input or copied if missing from the input)
   *   newScenarioMainId (provided as an input or copied if missing from the input)
   *   newOptimMainId (provided as an input or copied if missing from the input)
   * @param string $sOldRouteId : the id of the route that will be copied
   * @param string $aData : the data that will differ between the 2 routes
   * @param array : with the created route in an id field
   */
  public function copy($sOldRouteId,$aData){
    $aReplacement = array(':id'=>$sOldRouteId);
    $sDateDt = 'date_dt';
    if(isset($aData['newDateDt'])){
      $sDateDt = ':new_date_dt';
      $aReplacement[':new_date_dt'] = round($aData['newDateDt']/1000);
    }
    $sTimeSlot = 'timeslot_th';
    if(isset($aData['newTimeslotTh'])){
      $sTimeSlot = ':new_timeslot_th';
      $aReplacement[':new_timeslot_th'] = $aData['newTimeslotTh'];
    }
    $sScenarioMainId = 'scenario_main_id';
    if(isset($aData['newScenarioMainId'])){
      $sScenarioMainId = ':new_scenario_main_id';
      $aReplacement[':new_scenario_main_id'] = $aData['newScenarioMainId'];
    }
    $sOptimMainId = 'optim_main_id';
    if(isset($aData['newOptimMainId'])){
      $sOptimMainId = ':new_optim_main_id';
      $aReplacement[':new_optim_main_id'] = $aData['newOptimMainId'];
    }
    $sSQL = "INSERT INTO transport_route(
                           code,
                           label,
                           date_dt,
                           timeslot_th,
                           start_hr,
                           end_hr,
                           vehicle_category_id,
                           site_poi_id_start,
                           site_poi_id_end,
                           duration,
                           distance,
                           cost,
                           co2,
                           scenario_main_id,
                           optim_main_id,
                           transport_route_id_parent,
                           hr_main_id_driver,
                           rec_st
                         )
                         SELECT
                           uuid_generate_v1(),
                           label,
                           $sDateDt,
                           $sTimeSlot,
                           start_hr,
                           end_hr,
                           vehicle_category_id,
                           site_poi_id_start,
                           site_poi_id_end,
                           duration,
                           distance,
                           cost,
                           co2,
                           $sScenarioMainId,
                           $sOptimMainId,
                           :id,
                           hr_main_id_driver,
                           rec_st
                           FROM transport_route WHERE id=:id
                         RETURNING id";                    
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Copy all the POIs from a route into another route
   * @param string $sOldRouteId : the id of the route from which the route POIs will be copied
   * @param string $sNewRouteId : the id of the route into which the route POIs will be copied
   * @param array : list of inserted POIs (array with ids fields)
   */
  public function copyPOIs($sOldRouteId,$sNewRouteId){
    $aReplacement = array(':new_transport_route_id'=>$sNewRouteId,':old_transport_route_id'=>$sOldRouteId);
    $sSQL = "INSERT INTO transport_routesitepoi(
                           transport_route_id,
                           transport_demand_id,
                           site_poi_id,
                           hr_main_id,
                           target_hr,
                           target_hr_manual,
                           target_hr_auto,
                           orderroute,
                           waiting_duration,
                           rec_st
                         )
                         SELECT
                           :new_transport_route_id,
                           transport_demand_id,
                           site_poi_id,
                           hr_main_id,
                           target_hr,
                           target_hr_manual,
                           target_hr_auto,                           
                           orderroute,
                           waiting_duration,
                           rec_st
                       FROM transport_routesitepoi
                      WHERE transport_route_id=:old_transport_route_id
                      RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * List the routes, restricted to a scenario + a day of week + a direction
   * This function will list all the weeks within the scenario and for each week, the
   *    count of routes matching the given day of week and direction.
   * The day of week is provided through $aData["calendarDt"] parameter (this is a timestamp but only
   *    the "day of week" part of this timestamp will be used here)
   * The direction is provided through $aData["timeSlotId"] (this is a timeslot id, it enable to target
   *    either a travel forward or backward)
   * @param $aData : array with scenarioMainId,timeSlotId and calendarDt (ms) fields
   * @return : array with count and date_dt (ms) (one row per week)
   */
  function listForCalendar($aData){
    $sScenarioMainIdQuoted = $this->db()->quote($aData["scenarioMainId"]);
    $sTimeslotIdQuoted = $this->db()->quote($aData["timeSlotId"]);
    $iWeekday0to6 = date('w', round($aData["calendarDt"]/1000));
    // Normally, all dates should be the same in every group, but the use of MIN operator will make it sure
    // We add a inner join on the inner query to exclude routes with no POIs
    $sSQL = "SELECT 
               COUNT(*),
               CAST(MIN(date_dt) AS bigint)*1000 as date_dt
             FROM
             (SELECT 
               transport_route.id,
               EXTRACT(week FROM to_timestamp(transport_route.date_dt)) as week,
               EXTRACT(year FROM to_timestamp(transport_route.date_dt)) as year,
               transport_route.date_dt
             FROM
              transport_route
              INNER JOIN transport_routesitepoi as poi ON poi.transport_route_id=transport_route.id AND poi.rec_st <> 'D'
             WHERE
             transport_route.rec_st<>'D' AND
             transport_route.scenario_main_id = $sScenarioMainIdQuoted AND
             EXTRACT(DOW FROM to_timestamp(transport_route.date_dt)) = $iWeekday0to6 AND 
             timeslot_th = $sTimeslotIdQuoted
             GROUP BY transport_route.id,transport_route.date_dt
             ) as routes
             GROUP BY year,week";
    $result = $this->db()->query($sSQL);
    return $result->fetchAll(PDO::FETCH_ASSOC);    
  }

  /**
   * List some transport_routesitepoi items for a given route
   * @param string $sTransportRouteId : the transport route id
   * @return array : list of transport_routesitepoi items
   */
  function listRouteSitePOIs($sTransportRouteId){
    $sTransportRouteIdQuoted = $this->db()->quote($sTransportRouteId);
    $sSQL = "SELECT 
                   transport_routesitepoi.id as id,
                   transport_routesitepoi.notified_yn,
                   transport_routesitepoi.visited_yn,
                   CAST(transport_routesitepoi.visited_dt AS bigint)*1000 as visited_dt,
                   transport_routesitepoi.site_poi_id,
                   CAST(transport_routesitepoi.target_hr AS bigint)*1000 as target_hr,
                   CAST(transport_routesitepoi.target_hr_auto AS bigint)*1000 as target_hr_auto,
                   CAST(transport_routesitepoi.target_hr_manual AS bigint)*1000 as target_hr_manual,
                   hr_main.id as hr_main_id,
                   hr_firstcontact.content AS phonenumber,
                   hr_main.notify_yn,
                   hr_main.notice_delay*1000 as notice_delay
               FROM transport_routesitepoi
               LEFT JOIN hr_main on hr_main.id=transport_routesitepoi.hr_main_id
               -- select the content field of hr_contact table with the smallest value of priority for each hr_main
               LEFT JOIN (
                SELECT distinct on (hr_main_id) hr_main_id,content
                FROM hr_contact
                WHERE type_th = (SELECT id FROM util_thesaurus WHERE CAT='HR_CONTACT_TYPE' AND CODE='MOBILE_PHONE')
                ORDER BY hr_main_id,priority
               ) AS hr_firstcontact ON hr_firstcontact.hr_main_id=hr_main.id               
               WHERE transport_routesitepoi.transport_route_id = $sTransportRouteIdQuoted
               ORDER BY transport_routesitepoi.orderroute";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetchAll(PDO::FETCH_ASSOC);                
  }

  /**
   * Update the arrival date and the notified_yn field for a set of transport_routesitepoi items
   * @param array $aTransportRouteSitePOIs : items from transport_routesitepoi
   * @return boolean : true in case of success
   */
  function updateArrivalDt($aTransportRouteSitePOIs){
    $sValues = "";
    $aReplacement=array();
    for($i=0;$i<count($aTransportRouteSitePOIs);$i++){
      if($sValues!=''){
        $sValues.=',';
      }
      $sValues.="(:id_$i ::uuid,:arrival_dt_$i ::integer,:notified_yn_$i)";
      $aReplacement[":id_$i"]=$aTransportRouteSitePOIs[$i]['id'];
      $aReplacement[":arrival_dt_$i"]=round($aTransportRouteSitePOIs[$i]['arrival_dt']/1000);
      $aReplacement[":notified_yn_$i"]=$aTransportRouteSitePOIs[$i]['notified_yn'];
    }
    $bResult = true;
    if($sValues!=""){
      // In the query we make sure that points that were already marked as visited by the driver
      //   can not be updated by this function (service called by human preempts automatic service call)
      $sSQL = "UPDATE transport_routesitepoi as t
                  SET 
                      arrival_dt=c.arrival_dt,
                      notified_yn=c.notified_yn
                 FROM ( VALUES $sValues ) as c(id,arrival_dt,notified_yn)   
                WHERE c.id=t.id AND (t.visited_yn is null or t.visited_yn <> 'Y') ";
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute($aReplacement);                
    }
    return $bResult;
  }

  /**
   * Insert some location data from mobile device.
   * Input data should contain the following fields :
   *  - transport_route_id : the current route
   *  - user_main_id : the id of the connected user
   *  - next_pois : array containing the duration to the next pois : each field may contain the following subfields
   *     - site_poi_id : the id of a coming POI in the route
   *     - duration_to_poi : estimated duration before reaching the POI in ms
   *  - site_poi_id_next : the id of the next POI in the route
   *  - duration_to_next_poi : the estimation duration to the next POI in ms
   *  - dt : current timestamp in ms
   *  - lng : in degrees
   *  - lat : in degrees
   *  - h, s, e, a : heading (integer, degrees), speed (integer, m per s), events (json ), accuracy (integer)
   * @param array $aData : input location data
   * @return boolean : true in case of success
   */
  function insertTransportRouteLocation($aData){
    // test input geometry (lat and lng must be float).
    // Protection against SQL injection, as it seems prepared SQL request works bad on the geom field.
    if(!is_numeric($aData['lng'])){
      throw new \OSS\AppException(
        "Insertion of route progress data into database failed : invalid longitude",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );          
    }
    if(!is_numeric($aData['lat'])){
      throw new \OSS\AppException(
        "Insertion of route progress data into database failed : invalid latitude",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );          
    }
    // The geometry converted in well-known-text format    
    $sGeometryAsText = "'POINT(".$aData['lng']." ".$aData['lat'].")'";
    // Check whether the location we want to insert is not already present
    $sSQL = "SELECT id FROM gis_transportroute WHERE transport_route_id =:transport_route_id AND geom_dt =:geom_dt ";
    $aReplacement=array(':transport_route_id'=>$aData["transport_route_id"],':geom_dt'=>round($aData["dt"]/1000));
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    $aResults = $oQuery->fetchAll(PDO::FETCH_ASSOC);
    if(count($aResults)==0){
      // Insertion in gis_transportroute table (transport route progress)
      $sSQL1= "INSERT INTO gis_transportroute ( transport_route_id, geom_dt, geom, heading, speed, accuracy, event )
              VALUES ( 
                :transport_route_id,
                :geom_dt,
                public.ST_GeomFromText($sGeometryAsText,".$this->config('MAP')['SRID']['DEFAULT']."),
                :heading,
                :speed,
                :accuracy,
                :event
              )";
    }
    else{
      // Update of gis_transportroute table (transport route progress)
      $sSQL1= "UPDATE gis_transportroute
                  SET geom=public.ST_GeomFromText($sGeometryAsText,".$this->config('MAP')['SRID']['DEFAULT']."),
                      heading=:heading,
                      speed=:speed,
                      accuracy=:accuracy,
                      event=:event
                WHERE transport_route_id=:transport_route_id AND geom_dt=:geom_dt";      
    }
    $aReplacement1 = array(
      ':transport_route_id'=>$aData["transport_route_id"],
      ':geom_dt'=>round($aData["dt"]/1000),
      ':heading'=>$aData["h"],
      ':speed'=>$aData["s"],
      ':accuracy'=>$aData["a"],
      ':event'=>$aData["e"]
    );
    // Check whether the location we want to insert is not already present
    $sTransportRouteIdQuoted = $this->db()->quote($aData["transport_route_id"]);
    $sSQL = "SELECT id FROM gis_transportroute_current WHERE transport_route_id = $sTransportRouteIdQuoted ";
    $oQuery = $this->db()->query($sSQL);
    $aResults = $oQuery->fetchAll(PDO::FETCH_ASSOC);
    if(count($aResults)==0){
      // Insertion in gis_transportroute_current (last position in each route)
      $sSQL2= "INSERT INTO gis_transportroute_current ( transport_route_id, geom_dt, geom, site_poi_id_next, duration_to_next_poi )
              VALUES ( 
                :transport_route_id,
                :geom_dt,
                public.ST_GeomFromText($sGeometryAsText,".$this->config('MAP')['SRID']['DEFAULT']."),
                :site_poi_id_next,
                :duration_to_next_poi
              )";
    }
    else{
      // Update gis_transportroute_current (last position in each route)
      $sSQL2= "UPDATE gis_transportroute_current
                  SET geom_dt=:geom_dt,
                      geom=public.ST_GeomFromText($sGeometryAsText,".$this->config('MAP')['SRID']['DEFAULT']."),
                      site_poi_id_next=:site_poi_id_next,
                      duration_to_next_poi=:duration_to_next_poi
               WHERE transport_route_id= :transport_route_id ";   
    }
    $aReplacement2 = array(
      ':transport_route_id'=>$aData["transport_route_id"],
      ':geom_dt'=>round($aData["dt"]/1000),
      ':site_poi_id_next'=>$aData["site_poi_id_next"],
      ':duration_to_next_poi'=>round($aData["duration_to_next_poi"]/1000)
    );
    $this->db()->beginTransaction();
    $oQuery1 = $this->db()->prepare($sSQL1);
    $sResult1 = $oQuery1->execute($aReplacement1);
    $oQuery2 = $this->db()->prepare($sSQL2);
    $sResult2 = $oQuery2->execute($aReplacement2);
    if($sResult1 && $sResult2){
      $this->db()->commit();
    }
    else{
      throw new \OSS\AppException(
        "Insertion of route progress data into database failed",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );    
    }
    return true;
  }

  /**
   * Set the real start time for a route.
   * @param string $sTransportRouteId : the transport route id
   * @param integer $iTimestamp : the timestamp that corresponds to the route start
   * @return boolean : true if the start time is correcly set, false otherwise
   */
  function setStartHrDriver($sTransportRouteId,$iTimestamp){
    $sTransportRouteIdQuoted = $this->db()->quote($sTransportRouteId);
    $iTimestampQuoted = $this->db()->quote($iTimestamp);
    if($iTimestamp==null){
      $iTimestampQuoted = "null";
    }
    $sSQL = "UPDATE transport_route set start_driver_dt=$iTimestampQuoted WHERE id=$sTransportRouteIdQuoted ";
    return $this->db()->exec($sSQL);
  }

  /**
   * Set the real end time for a route.
   * @param string $sTransportRouteId : the transport route id
   * @param integer $iTimestamp : the timestamp that corresponds to the route end
   * @return boolean : true if the end time is correcly set, false otherwise
   */
  function setEndHrDriver($sTransportRouteId,$iTimestamp){
    $sTransportRouteIdQuoted = $this->db()->quote($sTransportRouteId);
    if($iTimestamp==null){
      $sSQL = "UPDATE transport_route set end_driver_dt=null WHERE id=$sTransportRouteIdQuoted ";
    }
    else{
      $iTimestampQuoted = $this->db()->quote($iTimestamp);
      $sSQL = "UPDATE transport_route set end_driver_dt=$iTimestampQuoted WHERE id=$sTransportRouteIdQuoted ";      
    }
    return $this->db()->exec($sSQL);
  }

  /**
   * Set the real end time for a route.
   * @param string $sTransportRouteId : the transport route id
   * @param integer $iTimestamp : the timestamp that corresponds to the route end
   * @return integer : the number of updated rows
   */
  function resetProgressData($sTransportRouteId){
    $sTransportRouteIdQuoted = $this->db()->quote($sTransportRouteId);
    $sSQL = "UPDATE transport_routesitepoi
                SET arrival_dt=null,notified_yn=null,visited_yn=null,visited_dt=null,visit_missing_yn=null,visit_comments=null
              WHERE transport_route_id=$sTransportRouteIdQuoted ";
    return $this->db()->exec($sSQL);
  }

  /**
   * Notify that a POI route was visited and update some informations as the HR absence or presence and some other comments.
   * The input array shall contain the following information :
   *   poiId : (string) id of the visited transport_routesitepoi
   *   transportRouteId : (string) id of the visited transport_routeId
   *   missing : (boolean) whether the visited HR was missing or not
   *   comments : (string) some free comments about the visit
   * @param array $aData : the visited POI + some data to insert about the visited POI
   * @return boolean : whether the update succeeded or not
   */
  function routePOIVisit($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $sSQL = "UPDATE transport_routesitepoi
                SET 
                    arrival_dt=:arrival_dt,
                    visited_yn=:visited_yn,
                    visited_dt=:visited_dt,
                    visit_missing_yn=:visit_missing_yn,
                    visit_comments=:visit_comments
              WHERE site_poi_id=:poi_id  
                AND transport_route_id=:transport_route_id";
    $aReplacement = array(
      ':arrival_dt'=>time(),
      ':visited_yn'=>'Y',
      ':visited_dt'=>round($aData["visited_dt"]/1000),
      ':visit_missing_yn'=>$aData["missing"]?'Y':'N',
      ':visit_comments'=>$aData["comments"],
      ':poi_id'=>$aData["poiId"],
      ':transport_route_id'=>$aData["transportRouteId"],
    );
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);
  }
}
