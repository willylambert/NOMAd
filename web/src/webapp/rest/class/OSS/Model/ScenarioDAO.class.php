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
 *  Class for scenario handling in database
 *  @creationdate 2019-15-01
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class ScenarioDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * Get the scenarios list
   * The input data array is expected to contain the following fields :
   *   search (optional) : search pattern for scenario codes and labels
   * @param array $aData : filtering data
   * @param boolean $bWithAccessRestriction : enable to request a scenario with or without access restriction
   * @return array({object}) : array of Scenario objects
   */
  public function list($aData,$bWithAccessRestriction=true){
    $sInstitutionAccessRestrictionClause = "";
    $sHRAccessRestrictionClause = "";
    if($bWithAccessRestriction){
      $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
      $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');
    }
    $sSearchClause = $this->db()->getSearchClause($aData,array("scenario_main.code","scenario_main.label"));

    $sStatusClause = "";
    if(isset($aData["status_code"])){
      $sStatusClause = " AND th_status.code = " .  $this->db()->quote($aData["status_code"]);
    }

    $query = "SELECT scenario_main.id,
                     scenario_main.code,
                     scenario_main.label,
                     scenario_main.rec_st,
                     scenario_main.need_calendar_update_yn,
                     scenario_main.status_th,
                     th_status.code AS status_code,
                     th_status.label AS status_label,
                     CAST(scenario_main.start_dt AS bigint)*1000 as start_dt,
                     CAST(scenario_main.end_dt AS bigint)*1000 as end_dt,                     
                     json_agg(json_build_object(
                       'id',transport_demand.id,
                       'hr_id',hr_main.id,
                       'transport_mode_code',transport_mode.code
                     )) as demands
                FROM scenario_main
          INNER JOIN util_thesaurus th_status ON th_status.id=scenario_main.status_th
           LEFT JOIN scenario_transportgroup ON scenario_transportgroup.scenario_main_id = scenario_main.id
           LEFT JOIN transport_group ON scenario_transportgroup.transport_group_id = transport_group.id
                                    AND transport_group.rec_st <> 'D'
           LEFT JOIN transport_groupdemand ON transport_group.id = transport_groupdemand.transport_group_id
                                          AND transport_groupdemand.rec_st <> 'D'
           LEFT JOIN transport_demand ON transport_demand.id = transport_groupdemand.transport_demand_id
                                     AND transport_demand.rec_st<>'D'
           LEFT JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                           AND site_poi_institution.rec_st<>'D'
                                           AND site_poi_institution.geom IS NOT NULL
           $sInstitutionAccessRestrictionClause
           LEFT JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                  AND site_poi_hr.rec_st<>'D'
                                  AND site_poi_hr.geom IS NOT NULL
           $sHRAccessRestrictionClause
           LEFT JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
           LEFT JOIN hr_maindetail ON hr_main.id = hr_maindetail.hr_main_id AND hr_maindetail.rec_st<>'D'
           LEFT JOIN util_thesaurus AS transport_mode ON transport_mode.id=hr_maindetail.transportmode_th
               WHERE scenario_main.rec_st<>'D'
                     $sSearchClause
                     $sStatusClause
            GROUP BY scenario_main.id,
                     scenario_main.code,
                     scenario_main.label,
                     scenario_main.rec_st,
                     scenario_main.status_th,
                     th_status.code,
                     th_status.label,
                     scenario_main.start_dt,
                     scenario_main.end_dt
            ORDER BY scenario_main.label";
    $result = $this->db()->query($query);
    $this->log()->info(["message"=>"scenarios","data"=>$query]);
    $aScenarios = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach($aScenarios as &$aScenario){
      $aScenario["demands"]=json_decode($aScenario["demands"],true);
    }
    return $aScenarios;
  }

  /**
  * Read the asked scenario
  * @param string $sScenarioMainId : Scenario Reference
  * @param boolean $bWithAccessRestriction : enable to request a group with or without access restriction
  * @return array scenario data
  **/
  public function get($sScenarioMainId,$bWithAccessRestriction=true){
    $sInstitutionAccessRestrictionClause = "";
    $sHRAccessRestrictionClause = "";
    if($bWithAccessRestriction){
      $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
      $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');
    }
    $sScenarioMainIdQuoted = $this->db()->quote($sScenarioMainId);
    $query = "SELECT scenario_main.id,
                     scenario_main.code,
                     scenario_main.label,
                     scenario_main.rec_st,
                     scenario_main.status_th,
                     scenario_main.need_calendar_update_yn,
                     CAST(scenario_main.start_dt AS bigint)*1000 as start_dt,
                     CAST(scenario_main.end_dt AS bigint)*1000 as end_dt,
                     th_status.code AS status_code,
                     th_status.label AS status_label,
                     COUNT(transport_demand.id) as demands_count
                FROM scenario_main
          INNER JOIN util_thesaurus th_status ON th_status.id=scenario_main.status_th
           LEFT JOIN scenario_transportgroup ON scenario_transportgroup.scenario_main_id = scenario_main.id
           LEFT JOIN transport_group ON scenario_transportgroup.transport_group_id = transport_group.id
                                    AND transport_group.rec_st <> 'D'          
           LEFT JOIN transport_groupdemand ON transport_group.id = transport_groupdemand.transport_group_id
                                          AND transport_groupdemand.rec_st <> 'D'
           LEFT JOIN transport_demand ON transport_demand.id = transport_groupdemand.transport_demand_id
                                     AND transport_demand.rec_st<>'D'
           LEFT JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                     AND site_poi_institution.rec_st<>'D'
                                                     AND site_poi_institution.geom IS NOT NULL
           $sInstitutionAccessRestrictionClause
           LEFT JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                  AND site_poi_hr.rec_st<>'D'
                                  AND site_poi_hr.geom IS NOT NULL
           $sHRAccessRestrictionClause          
               WHERE scenario_main.id = $sScenarioMainIdQuoted
               GROUP BY scenario_main.id,
                     scenario_main.code,
                     scenario_main.label,
                     scenario_main.rec_st,
                     scenario_main.status_th,
                     scenario_main.start_dt,
                     scenario_main.end_dt,
                     th_status.code,
                     th_status.label";
    $result = $this->db()->query($query);
    $aResult = $result->fetch(PDO::FETCH_ASSOC);
    // Make sure conversions from timestamp to date are done on server side
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aResult['startDt']=$oCalendarCtrl->fromTimestamp($aResult['start_dt']);
    $aResult['endDt']=$oCalendarCtrl->fromTimestamp($aResult['end_dt']);
    return $aResult;
  }

  /**
  * Add a scenario
  * @param array $aData : data of the scenario to be inserted.
  * @return array created scenario with an id field
  */
  public function add($aData){
    if(isset($aData['startDt']) && $aData['endDt']){
      // Make sure the received dates are converted into timestamps (expressed at 0h server time)
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aData['start_dt']=$oCalendarCtrl->toTimestamp($aData['startDt']);
      $aData['end_dt']=$oCalendarCtrl->toTimestamp($aData['endDt']);
    }
    $aReplacement = array(
      ':label'=>$aData['label'],
      ':status_th'=>$aData['status_th'],
      ':start_dt'=>round($aData['start_dt']/1000),
      ':end_dt'=>round($aData['end_dt']/1000),
      ':rec_st'=>$aData['rec_st']
    );
    if(isset($aData['code'])){
      // Case where a scenario label and scneario a code are provided
      $aReplacement[':code']=$aData['code'];
      $sSQL = "INSERT INTO scenario_main (code,label,start_dt,end_dt,status_th,rec_st,need_calendar_update_yn)
      VALUES (
        :code,
        :label,
        :start_dt,
        :end_dt,
        :status_th,
        :rec_st,
        'Y')
      RETURNING id";
    }
    else{
      // Case where only the scenario label is provided
      $sSQL = "INSERT INTO scenario_main (code,label,start_dt,end_dt,status_th,rec_st)
      VALUES (
        uuid_generate_v1(),
        :label,
        :start_dt,
        :end_dt,
        :status_th,
        :rec_st)
      RETURNING id";
    }
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute($aReplacement);
    }catch(Exception $e)
    {
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Scenario with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }     
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a scenario
  * @param array $aData : data of the scenario to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    if(isset($aData['startDt']) && $aData['endDt']){
      // Make sure the received dates are converted into timestamps (expressed at 0h server time)
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aData['start_dt']=$oCalendarCtrl->toTimestamp($aData['startDt']);
      $aData['end_dt']=$oCalendarCtrl->toTimestamp($aData['endDt']);
    }
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':status_th'=>$aData['status_th'],
      ':start_dt'=>round($aData['start_dt']/1000),
      ':end_dt'=>round($aData['end_dt']/1000),
      ':rec_st'=>$aData['rec_st']      
    );
    $sSQL = "UPDATE scenario_main
                SET
                    code=:code,
                    label=:label,
                    start_dt=:start_dt,
                    end_dt=:end_dt,
                    status_th=:status_th,
                    rec_st=:rec_st,
                    need_calendar_update_yn='Y'
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);
  }

  /**
   * @param $bNeedUpdate boolean : true to set need_calendar_update_yn field to 'Y' 
   */
  function setNeedCalendarUpdate($scenarioId,$bNeedUpdate){
    $sSQL = "UPDATE scenario_main
                SET need_calendar_update_yn='" . ($bNeedUpdate?'Y':'N') .  "'
              WHERE id=" . $this->db()->quote($scenarioId);
    return $this->db()->query($sSQL);
  }

  /**
  * Mark a scenario as removed
  * @param string $sScenarioMainId : id of the scenario to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sScenarioMainId){
    $query = "UPDATE scenario_main SET rec_st='D' WHERE id=" . $this->db()->quote($sScenarioMainId);
    return $this->db()->exec($query);
  }

  /**
  * Delete a scenario.
  * @param string $sScenarioMainId : id of the scenario to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sScenarioMainId){
    $bResult = false;
    if($this->isAdmin()){    
      $query = "DELETE FROM datachecker_detail WHERE scenario_main_id=" . $this->db()->quote($sScenarioMainId);
      $bResult = $this->db()->exec($query); 
      $query = "DELETE FROM scenario_main WHERE id=" . $this->db()->quote($sScenarioMainId);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
   * List the routes associated to a scenario
   * @param string $sScenarioMainId : the scenario id for which we need the list of routes
   * @param boolean $bAdditionalWithInfo : whether we need additionnal information about the routes
   * @return array : list of routes, each route with an id field
   */
  public function listRoutes($sScenarioMainId,$bAdditionalWithInfo=false){
    $sScenarioMainIdQuoted = $this->db()->quote($sScenarioMainId);
    $aRoutes = array();

    if(!$bAdditionalWithInfo){
      $sSQL = "SELECT id FROM transport_route WHERE scenario_main_id=$sScenarioMainIdQuoted";
      $result = $this->db()->query($sSQL);
      $aRoutes = $result->fetchAll(PDO::FETCH_ASSOC);
    }
    else{
      // The additionnal information is
      //   - the list of concerned institutions,
      //   - whether this route is based on demands or not
      //   - the concerned timeslot
      $sSQL = "SELECT
                      transport_route.id,
                      institutions.sites,
                      with_demands.with_demand,
                      util_thesaurus.code as timeslot_code
                 FROM
                      transport_route
           INNER JOIN util_thesaurus on transport_route.timeslot_th = util_thesaurus.id
           INNER JOIN (
                        SELECT
                               transport_route.id,
                               json_agg(json_build_object(
                                 'id',site_main.id,
                                 'label',site_main.label
                                 )) AS sites
                          FROM transport_route
                    INNER JOIN transport_routesitepoi on transport_routesitepoi.transport_route_id = transport_route.id
                    INNER JOIN site_poi on transport_routesitepoi.site_poi_id = site_poi.id
                    INNER JOIN site_main on site_poi.site_main_id = site_main.id
                    INNER JOIN util_thesaurus on site_main.type_th = util_thesaurus.id AND util_thesaurus.code='INSTITUTION'
                         WHERE transport_route.rec_st <>'D' AND transport_route.scenario_main_id = $sScenarioMainIdQuoted
                      GROUP BY transport_route.id
                      ) as institutions on institutions.id = transport_route.id
           INNER JOIN (
                        SELECT
                               transport_route.id,
                               CASE
                                 WHEN SUM(CASE WHEN transport_routesitepoi.transport_demand_id IS NULL THEN 0 ELSE 1 END)>0
                                 THEN true ELSE false
                               END AS with_demand
                          FROM transport_route
                    INNER JOIN transport_routesitepoi on transport_routesitepoi.transport_route_id = transport_route.id
                    INNER JOIN site_poi on transport_routesitepoi.site_poi_id = site_poi.id
                    INNER JOIN site_main on site_poi.site_main_id = site_main.id
                    INNER JOIN util_thesaurus on site_main.type_th = util_thesaurus.id AND util_thesaurus.code='HOME'
                         WHERE transport_route.rec_st <>'D' AND transport_route.scenario_main_id = $sScenarioMainIdQuoted
                      GROUP BY transport_route.id
                      ) as with_demands on with_demands.id = transport_route.id
                WHERE transport_route.rec_st <>'D' AND transport_route.scenario_main_id = $sScenarioMainIdQuoted";
      $result = $this->db()->query($sSQL);
      $aRoutes = $result->fetchAll(PDO::FETCH_ASSOC);
      foreach($aRoutes as &$aRoute){
        $aRoute["sites"]=json_decode($aRoute["sites"],true);
      }
    }
    return $aRoutes;
  }

  // ----------------- SCENARIO_TRANSPORTGROUP HANDLING ------------------------------

  /**
  * Get a list of scenario_transportgroup items (link between a scenario and a transport group) based on search criteria
  * The input data array is expected to contain the following fields : scenarioMainId
  * If some details are requested, more fields will be added to the output
  *   data : (array) data about the transport group
  * When no details are requested, all items are returned, even those marked as deleted
  * @param array $aData : filtering data
  * @param boolean $bWithAccessRestriction : enable to request a group with or without access restriction
  * @return array({object}) : array of scenario_transportgroup object
  **/
  public function listScenarioTransportGroups($aData,$bWithAccessRestriction=true){
    $sScenarioMainIdClause = "";
    if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!= null && $aData['scenarioMainId']!= ""){
      $sScenarioMainIdQuoted = $this->db()->quote($aData['scenarioMainId']);
      $sScenarioMainIdClause = " AND (scenario_main_id = $sScenarioMainIdQuoted ) ";
    }
    $sSQL="";
    if(!$aData['bWithDetails']){
      // In the returned list, we look for groups even when scenario_transportgroup is marked
      //   as deleted. We do so because one objective for this function is to list all the scenario_transportgroup
      //   linked to a scenario id, in order to delete them and then to delete the scenario. Another objective
      //   is to list the item from scenario_transportgroup to look for some change in a list of groups. Even though
      //   an item from scenario_transportgroup mark as deleted is returned, it will just result in an attempt to
      //   mark it as deleted again.
      $sSql = "SELECT id,transport_group_id FROM scenario_transportgroup WHERE true $sScenarioMainIdClause";
    }
    else{
      $sInstitutionAccessRestrictionClause = "";
      $sHRAccessRestrictionClause = "";
      if($bWithAccessRestriction){
        $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_institution','id');
        $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_hr','id');
      }      
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

      $sSql = "SELECT
                      scenario_transportgroup.id,
                      transport_group.id as transport_group_id,
                      transport_group.label as transport_group_label,
                      count(transport_demand) as transport_group_demands_count,
                      json_agg(json_build_object(
                       'id',transport_demand.id,
                       'site_poi_id_institution',transport_demand.site_poi_id_institution,
                       'site_poi_label_institution',site_poi_institution.label,
                       'institution_id',site_main_institution.id,
                       'institution_label',site_main_institution.label,
                       'site_poi_type_code_institution',site_poi_type_institution.code,
                       'site_poi_addr1_institution',site_poi_institution.addr1,
                       'site_poi_addr2_institution',site_poi_institution.addr2,
                       'site_poi_postcode_institution',site_poi_institution.postcode,
                       'site_poi_city_institution',site_poi_institution.city,
                       'site_poi_geom_institution',ST_AsGeoJSON(site_poi_institution.geom),
                       'site_poi_service_duration_institution',site_poi_institution.service_duration*1000,
                       'site_poi_id_hr',transport_demand.site_poi_id_hr,
                       'site_poi_label_hr',site_poi_hr.label,
                       'hr_firstname',hr_main.firstname,
                       'hr_lastname',hr_main.lastname,
                       'hr_main_id',transport_demand.hr_main_id,
                       'site_poi_type_code_hr',site_poi_type_hr.code,
                       'site_poi_addr1_hr',site_poi_hr.addr1,
                       'site_poi_addr2_hr',site_poi_hr.addr2,
                       'site_poi_postcode_hr',site_poi_hr.postcode,
                       'site_poi_city_hr',site_poi_hr.city,
                       'site_poi_geom_hr',ST_AsGeoJSON(site_poi_hr.geom),
                       'site_poi_service_duration_hr',site_poi_hr.service_duration*1000,
                       'site_poi_transport_mode_code_hr',transportmode_type_hr.code,
                       'hr_pickup_duration',hr_maindetail.pickup_duration*1000,
                       'hr_delivery_duration',hr_maindetail.delivery_duration*1000,
                       'home_to_institution_acceptable_duration',home_to_institution.acceptable_duration*1000,
                       'institution_to_home_acceptable_duration',institution_to_home.acceptable_duration*1000,
                       'home_to_institution_duration',home_to_institution.duration*1000,
                       'institution_to_home_duration',institution_to_home.duration*1000,
                       'home_to_institution_id',home_to_institution.id,
                       'institution_to_home_id',institution_to_home.id,
                       'timeslots',timeslots.list,
                       'start_dt',CAST(transport_demand.start_dt as bigint)*1000,
                       'end_dt',CAST(transport_demand.end_dt as bigint)*1000
                     )) as demands
                 FROM scenario_transportgroup
           INNER JOIN transport_group ON scenario_transportgroup.transport_group_id = transport_group.id
                                      AND transport_group.rec_st <> 'D'
            LEFT JOIN transport_groupdemand ON transport_group.id = transport_groupdemand.transport_group_id
                                            AND transport_groupdemand.rec_st <> 'D'
           INNER JOIN transport_demand ON transport_demand.id = transport_groupdemand.transport_demand_id
                                       AND transport_demand.rec_st<>'D'
            LEFT JOIN ( $sTimeslotsByDemandSQL ) AS timeslots ON timeslots.transport_demand_id=transport_demand.id
            LEFT JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                      AND site_poi_institution.rec_st<>'D' AND site_poi_institution.geom IS NOT NULL
            LEFT JOIN site_main as site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                        AND site_main_institution.rec_st<>'D'
            $sInstitutionAccessRestrictionClause
            LEFT JOIN util_thesaurus as site_poi_type_institution ON site_main_institution.type_th = site_poi_type_institution.id
            LEFT JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                             AND site_poi_hr.rec_st<>'D' AND site_poi_hr.geom IS NOT NULL
            LEFT JOIN site_main as site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id AND site_main_hr.rec_st<>'D'
            $sHRAccessRestrictionClause
            LEFT JOIN util_thesaurus as site_poi_type_hr ON site_main_hr.type_th = site_poi_type_hr.id
            LEFT JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
            LEFT JOIN hr_maindetail ON hr_main.id = hr_maindetail.hr_main_id AND hr_maindetail.rec_st<>'D'
            LEFT JOIN util_thesaurus as transportmode_type_hr ON transportmode_type_hr.id = hr_maindetail.transportmode_th
            LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi_hr.id
                                      AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                      AND home_to_institution.rec_st<>'D'
                                      AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
            LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                                      AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                      AND institution_to_home.rec_st<>'D'
                                      AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
                WHERE scenario_transportgroup.rec_st<>'D' $sScenarioMainIdClause
             GROUP BY scenario_transportgroup.id,
                      transport_group.id,
                      transport_group.label";
    }
    $result = $this->db()->query($sSql);
    $aScenarioTransportGroups = $result->fetchAll(PDO::FETCH_ASSOC);
    if($aData['bWithDetails']){
      foreach($aScenarioTransportGroups as &$aScenarioTransportGroup){
        // Postreatement to format demands in objects
        $aScenarioTransportGroup['demands']=json_decode($aScenarioTransportGroup['demands'],true);
        foreach($aScenarioTransportGroup['demands'] as &$aDemand){
          $aDemand["institutionPOI"]=array(
            "id"=>$aDemand["site_poi_id_institution"],
            "label"=>$aDemand["site_poi_label_institution"],
            "site_main_id"=>$aDemand["institution_id"],
            "site_main_label"=>$aDemand["institution_label"],
            "site_type_code"=>$aDemand["site_poi_type_code_institution"],
            "addr1"=>$aDemand["site_poi_addr1_institution"],
            "addr2"=>$aDemand["site_poi_addr2_institution"],
            "postcode"=>$aDemand["site_poi_postcode_institution"],
            "city"=>$aDemand["site_poi_city_institution"],
            "geom"=>json_decode($aDemand["site_poi_geom_institution"],true),
            "service_duration"=>$aDemand["site_poi_service_duration_institution"]
          );
          unset($aDemand["site_poi_id_institution"]);
          unset($aDemand["site_poi_label_institution"]);
          unset($aDemand["institution_id"]);
          unset($aDemand["institution_label"]);
          unset($aDemand["site_poi_type_code_institution"]);
          unset($aDemand["site_poi_addr1_institution"]);
          unset($aDemand["site_poi_addr2_institution"]);
          unset($aDemand["site_poi_postcode_institution"]);
          unset($aDemand["site_poi_city_institution"]);
          unset($aDemand["site_poi_geom_institution"]);
          unset($aDemand["site_poi_service_duration_institution"]);
          $aDemand["HRPOI"]=array(
            "id"=>$aDemand["site_poi_id_hr"],
            "label"=>$aDemand["site_poi_label_hr"],
            "hr_firstname"=>$aDemand["hr_firstname"],
            "hr_lastname"=>$aDemand["hr_lastname"],
            "hr_id"=>$aDemand["hr_main_id"],
            "site_type_code"=>$aDemand["site_poi_type_code_hr"],
            "addr1"=>$aDemand["site_poi_addr1_hr"],
            "addr2"=>$aDemand["site_poi_addr2_hr"],
            "postcode"=>$aDemand["site_poi_postcode_hr"],
            "city"=>$aDemand["site_poi_city_hr"],
            "geom"=>json_decode($aDemand["site_poi_geom_hr"],true),
            "service_duration"=>$aDemand["site_poi_service_duration_hr"],
            "transport_mode_code"=>$aDemand["site_poi_transport_mode_code_hr"],
            "hr_pickup_duration"=>$aDemand["hr_pickup_duration"],
            "hr_delivery_duration"=>$aDemand["hr_delivery_duration"],
            "home_to_institution_acceptable_duration"=>$aDemand["home_to_institution_acceptable_duration"],
            "institution_to_home_acceptable_duration"=>$aDemand["institution_to_home_acceptable_duration"],
            "home_to_institution_duration"=>$aDemand["home_to_institution_duration"],
            "institution_to_home_duration"=>$aDemand["institution_to_home_duration"],
            "home_to_institution_id"=>$aDemand["home_to_institution_id"],
            "institution_to_home_id"=>$aDemand["institution_to_home_id"]
          );
          unset($aDemand["site_poi_id_hr"]);
          unset($aDemand["site_poi_label_hr"]);
          unset($aDemand["hr_firstname"]);
          unset($aDemand["hr_lastname"]);
          unset($aDemand["hr_main_id"]);
          unset($aDemand["site_poi_type_code_hr"]);
          unset($aDemand["site_poi_addr1_hr"]);
          unset($aDemand["site_poi_addr2_hr"]);
          unset($aDemand["site_poi_postcode_hr"]);
          unset($aDemand["site_poi_city_hr"]);
          unset($aDemand["site_poi_geom_hr"]);
          unset($aDemand["site_poi_service_duration_hr"]);
          unset($aDemand["site_poi_transport_mode_code_hr"]);
          unset($aDemand["hr_pickup_duration"]);
          unset($aDemand["hr_delivery_duration"]);
          unset($aDemand["home_to_institution_acceptable_duration"]);
          unset($aDemand["institution_to_home_acceptable_duration"]);
          unset($aDemand["home_to_institution_duration"]);
          unset($aDemand["institution_to_home_duration"]);
          unset($aDemand["home_to_institution_id"]);
          unset($aDemand["institution_to_home_id"]);
        }
        // Post treatment to create a data field
        $aScenarioTransportGroup['data']=array(
          'id'=>$aScenarioTransportGroup['transport_group_id'],
          'label'=>$aScenarioTransportGroup['transport_group_label'],
          'demands_count'=>$aScenarioTransportGroup['transport_group_demands_count'],
          'demands'=>$aScenarioTransportGroup['demands']
        );
        unset($aScenarioTransportGroup['transport_group_id']);
        unset($aScenarioTransportGroup['transport_group_label']);
        unset($aScenarioTransportGroup['transport_group_demands_count']);
        unset($aScenarioTransportGroup['demands']);
      }
    }
    return $aScenarioTransportGroups;
  }

    /**
   * Duplicate an item from scenario_transportgroup table.
   * The input array should contain the following fields :
   *  - scenarioTransportGroupId : id of the scenario_transportgroup item to duplicate
   *  - newScenarioMainId : id of the new scenario
   * @param array $aData : scenarioTransportGroupId and newScenarioMainId fields
   * @return array : new scenario_transportgroup item with id field
   */
  public function duplicateScenarioTransportGroups($aData){
    $aReplacement = array(
      ':old_scenario_transportgroup_id'=>$aData['scenarioTransportGroupId'],
      ':new_scenario_main_id'=>$aData['newScenarioMainId']
    );
    $sSQL = "INSERT INTO scenario_transportgroup (
                           scenario_main_id,
                           transport_group_id,
                           rec_st )
                  SELECT
                           :new_scenario_main_id,
                           transport_group_id,
                           rec_st
                    FROM scenario_transportgroup
                   WHERE scenario_transportgroup.id=:old_scenario_transportgroup_id
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Add a new scenario_transportgroup item (add a new link between a scenario and a transport group)
  * @param array $aData : data of the scenario_transportgroup item to be added.
  * @return array : new scenario_transportgroup item with id field
  */
  public function addScenarioTransportGroup($aData){
    $aReplacement = array(
      ':transport_group_id'=>$aData['transport_group_id'],
      ':scenario_main_id'=>$aData['scenario_main_id'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "INSERT INTO scenario_transportgroup (
                           scenario_main_id,
                           transport_group_id,
                           rec_st )
                  VALUES (
                           :scenario_main_id,
                           :transport_group_id,
                           :rec_st )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update an existing scenario_transportgroup item (update a link between a scenario and a transport group)
  * @param array $aData : data of the scenario_transportgroup item to be updated.
  * @return boolean : true in case of success
  */
  public function updateScenarioTransportGroup($aData){
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "UPDATE scenario_transportgroup
                SET rec_st=:rec_st
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);
  }

  /**
  * Mark a scenario_transportgroup item as removed (mark the link between a scenario and a transport group as removed)
  * @param string $sScenarioTransportGroupID : id of the scenario_transportgroup item to be removed.
  * @return boolean : true in case of success
  */
  public function markScenarioTransportGroupAsRemoved($sScenarioTransportGroupID){
    $query = "UPDATE scenario_transportgroup SET rec_st='D' WHERE id=" . $this->db()->quote($sScenarioTransportGroupID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a scenario_transportgroup item (delete the link between a scenario and a transport group)
  * @param string $sScenarioTransportGroupID : id of the group to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteScenarioTransportGroup($sScenarioTransportGroupID){
    $bResult = false;
    if($this->isAdmin()){  
      $query = "DELETE FROM scenario_transportgroup WHERE id=" . $this->db()->quote($sScenarioTransportGroupID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  // ----------------- SCENARIO_VEHICLECATEGORY HANDLING ------------------------------

  /**
  * Get a list of scenario_vehiclecategory items based on search criteria
  * The input data array is expected to contain the following fields : scenarioMainId
  * If some details are requested, more fields will be added to the output
  *   quantity : (integer) the quantity of vehicles for the category
  *   unlimited : (boolean) whether the quantity of vehicles is limited or not for the category
  *   data : (array) data about the vehicle category
  * When no details are requested, all items are returned, even those marked as deleted
  * @param array $aData : filtering data
  * @param boolean $bWithDetails : if set to true, more details are returned
  * @return array({object}) : array of scenario_vehiclecategory object
  **/
  public function listScenarioVehicleCategories($aData,$bWithDetails){
    $sScenarioMainIdClause = "";
    if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!= null && $aData['scenarioMainId']!= ""){
      $sScenarioMainIdQuoted = $this->db()->quote($aData['scenarioMainId']);
      $sScenarioMainIdClause = " AND (scenario_main_id = $sScenarioMainIdQuoted ) ";
    }
    $sSQL="";
    if(!$bWithDetails){
      // In the returned list, we look for vehicle categories even when scenario_vehiclecategory is marked
      //   as deleted. We do so because one objective for this function is to list all the scenario_vehiclecategory
      //   linked to a scenario id, in order to delete them and then to delete the scenario.
      // Another objective is to list the item from scenario_vehiclecategory to look for some change in a list of
      //   vehicle categories.
      // Even though an item from scenario_vehiclecategory mark as deleted is returned, it will just result in an
      //   attempt to mark it as deleted again.
      $sSql = "SELECT id,vehicle_category_id FROM scenario_vehiclecategory WHERE true $sScenarioMainIdClause";
    }
    else{
      $sSql = "SELECT
              scenario_vehiclecategory.id,
              scenario_vehiclecategory.quantity,
              scenario_vehiclecategory.unlimited_yn,
              vehicle_category.id as vehicle_category_id,
              vehicle_category.code as vehicle_category_code,
              vehicle_category.label as vehicle_category_label,
              vehicle_category.axles_count as vehicle_category_axles_count,
              vehicle_category.fuel_consumption as vehicle_category_fuel_consumption,
              vehicle_category.daily_cost as vehicle_category_daily_cost,
              vehicle_category.hourly_cost as vehicle_category_hourly_cost,
              vehicle_category.kilometric_cost as vehicle_category_kilometric_cost,
              vehicle_category.co2_quantity as vehicle_category_co2_quantity,
              json_agg(json_build_object(
                'id',configuration.id,
                'code',configuration.code,
                'label',configuration.label,
                'capacities',configuration.capacities
              )) as vehicle_category_configurations,
              json_agg(json_build_object('quantities',site_quantity.quantities)) as vehicle_category_site_quantity
            FROM scenario_vehiclecategory
          INNER JOIN vehicle_category ON vehicle_category.id = scenario_vehiclecategory.vehicle_category_id
                                      AND vehicle_category.rec_st<>'D'
           LEFT JOIN (
                SELECT
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id,
                  json_agg(json_build_object(
                    'id',vehicle_capacity.id,
                    'quantity',vehicle_capacity.quantity,
                    'unit_th',vehicle_capacity.unit_th,
                    'unit_code',th_unit.code,
                    'unit_label',th_unit.label,
                    'transported_label',th_transported.label,
                    'transported_code',th_transported.code,
                    'transported_th',vehicle_capacity.transported_th
                  )) as capacities
                FROM vehicle_configuration
                INNER JOIN vehicle_capacity on vehicle_capacity.vehicle_configuration_id = vehicle_configuration.id
                INNER JOIN util_thesaurus as th_transported on vehicle_capacity.transported_th = th_transported.id
                INNER JOIN util_thesaurus as th_unit on vehicle_capacity.unit_th = th_unit.id
                GROUP BY
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id
            ) as configuration on configuration.vehicle_category_id = vehicle_category.id
           LEFT JOIN 
            (
              SELECT scenario_vehiclecategory_id,
                     json_agg(json_build_object(
                        'id',id,
                        'site_main_id',site_main_id,
                        'unlimited_yn',unlimited_yn,
                        'quantity',quantity
                     )) as quantities
              FROM scenario_vehiclecategory_site
              GROUP BY scenario_vehiclecategory_id
            ) as site_quantity on site_quantity.scenario_vehiclecategory_id = scenario_vehiclecategory.id
            WHERE scenario_vehiclecategory.rec_st<>'D'
            $sScenarioMainIdClause
            GROUP BY scenario_vehiclecategory.id,
                     scenario_vehiclecategory.quantity,
                     scenario_vehiclecategory.unlimited_yn,
                     vehicle_category.id,
                     vehicle_category.code,
                     vehicle_category.label,
                     vehicle_category.axles_count,
                     vehicle_category.fuel_consumption,
                     vehicle_category.daily_cost,
                     vehicle_category.hourly_cost,
                     vehicle_category.kilometric_cost,
                     vehicle_category.co2_quantity
            ORDER BY id";
    }
    $result = $this->db()->query($sSql);
    $aScenarioVehicleCategories = $result->fetchAll(PDO::FETCH_ASSOC);
    if($bWithDetails){
      foreach($aScenarioVehicleCategories as &$aScenarioVehicleCategory){

        $vehicleCategoriesSiteQuantity = json_decode($aScenarioVehicleCategory['vehicle_category_site_quantity'],true);
        foreach($vehicleCategoriesSiteQuantity[0]["quantities"] as &$depotQuantity){
          $depotQuantity['unlimited']=$depotQuantity['unlimited_yn']=="Y";
          unset($depotQuantity['unlimited_yn']);
        }

        // Post treatment to create a data field
        $aScenarioVehicleCategory['data']=array(
          "id"=>$aScenarioVehicleCategory['vehicle_category_id'],
          "code"=>$aScenarioVehicleCategory['vehicle_category_code'],
          "label"=>$aScenarioVehicleCategory['vehicle_category_label'],
          "axles_count"=>$aScenarioVehicleCategory['vehicle_category_axles_count'],
          "fuel_consumption"=>$aScenarioVehicleCategory['vehicle_category_fuel_consumption'],
          "daily_cost"=>$aScenarioVehicleCategory['vehicle_category_daily_cost'],
          "hourly_cost"=>$aScenarioVehicleCategory['vehicle_category_hourly_cost'],
          "kilometric_cost"=>$aScenarioVehicleCategory['vehicle_category_kilometric_cost'],
          "co2_quantity"=>$aScenarioVehicleCategory['vehicle_category_co2_quantity'],
          "configurations"=>json_decode($aScenarioVehicleCategory['vehicle_category_configurations'],true),
          'vehicle_category_site_quantity' => $vehicleCategoriesSiteQuantity[0]["quantities"]
        );


        unset($aScenarioVehicleCategory['vehicle_category_id']);
        unset($aScenarioVehicleCategory['vehicle_category_code']);
        unset($aScenarioVehicleCategory['vehicle_category_label']);
        unset($aScenarioVehicleCategory['vehicle_category_axles_count']);
        unset($aScenarioVehicleCategory['vehicle_category_fuel_consumption']);
        unset($aScenarioVehicleCategory['vehicle_category_daily_cost']);
        unset($aScenarioVehicleCategory['vehicle_category_hourly_cost']);
        unset($aScenarioVehicleCategory['vehicle_category_kilometric_cost']);
        unset($aScenarioVehicleCategory['vehicle_category_co2_quantity']);
        unset($aScenarioVehicleCategory['vehicle_category_configurations']);
        unset($aScenarioVehicleCategory['vehicle_category_site_quantity']);
        // Post treatment to create a unlimited (boolean) field
        $aScenarioVehicleCategory['unlimited']=$aScenarioVehicleCategory['unlimited_yn']=="Y";
        unset($aScenarioVehicleCategory['unlimited_yn']);
      }
    }
    return $aScenarioVehicleCategories;
  }

  /**
   * Duplicate an item from scenario_vehiclecategory table.
   * The input array should contain the following fields :
   *  - scenarioVehicleCategoryId : id of the scenario_vehiclecategory item to duplicate
   *  - newScenarioMainId : id of the new scenario
   * @param array $aData : scenarioVehicleCategoryId and newScenarioMainId fields
   * @return array : new scenario_vehiclecategory item with id field
   */
  public function duplicateScenarioVehicleCategories($aData){
    $aReplacement = array(
      ':old_scenario_vehiclecategory_id'=>$aData['scenarioVehicleCategoryId'],
      ':new_scenario_main_id'=>$aData['newScenarioMainId']
    );
    $sSQL = "INSERT INTO scenario_vehiclecategory (
                           scenario_main_id,
                           vehicle_category_id,
                           quantity,
                           unlimited_yn,
                           rec_st )
                  SELECT
                           :new_scenario_main_id,
                           vehicle_category_id,
                           quantity,
                           unlimited_yn,
                           rec_st
                    FROM scenario_vehiclecategory
                   WHERE scenario_vehiclecategory.id=:old_scenario_vehiclecategory_id
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Add a new item in scenario_vehiclecategory table (add a new vehicle category to a scenario)
  * @param array $aData : data of the scenario_vehiclecategory item to be added.
  * @return array : new scenario_vehiclecategory object with id field
  */
  public function addScenarioVehicleCategory($aData){
    $aReplacement = array(
      ':vehicle_category_id'=>$aData['vehicle_category_id'],
      ':scenario_main_id'=>$aData['scenario_main_id'],
      ':quantity'=>$aData['quantity'],
      ':unlimited_yn'=>$aData['unlimited']?'Y':'N',
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "INSERT INTO scenario_vehiclecategory (
                           scenario_main_id,
                           vehicle_category_id,
                           quantity,
                           unlimited_yn,
                           rec_st )
                  VALUES (
                           :scenario_main_id,
                           :vehicle_category_id,
                           :quantity,
                           :unlimited_yn,
                           :rec_st )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update an existing item from scenario_vehiclecategory table (update a link between a vehicle category and a scenario)
  * 
  * @param array $aData : data of the scenario_vehiclecategory item to be updated.
  * @return boolean : true in case of success
  */
  public function updateScenarioVehicleCategory($aData){
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':quantity'=>$aData['quantity'],
      ':unlimited_yn'=>$aData['unlimited']?'Y':'N',
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "UPDATE scenario_vehiclecategory
                SET rec_st=:rec_st, quantity=:quantity, unlimited_yn=:unlimited_yn
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);
  }

  /*
  * Return array("quantity","unlimited_yn") or [] if record not found
  **/
  public function getVehicleQuantityByDepot($siteMainId,$scenarioVehicleCategoryId){
    $siteMainIdQuoted = $this->db()->quote($siteMainId);
    $scenarioVehicleCategoryIdQuoted = $this->db()->quote($scenarioVehicleCategoryId);

    $sSQL = "SELECT quantity,unlimited_yn 
              FROM scenario_vehiclecategory_site
              WHERE site_main_id=$siteMainIdQuoted AND
                    scenario_vehiclecategory_id=$scenarioVehicleCategoryIdQuoted";
    $result = $this->db()->query($sSql);
    $aScenarioVehicleCategories = $result->fetchAll(PDO::FETCH_ASSOC);                    
  }

  /**
  * Add a vehicle category quantity to a depot
  * @param $quantity integer : number of vehicle of vehicleCategory on depot
  * @param $unlimited string : 'Y' or 'N'
  **/
  public function addVehicleQuantityToDepot($siteMainId,$scenarioVehicleCategoryId,$quantity,$unlimited){
    $aReplacement = array(
      ':scenario_vehiclecategory_id'=>$scenarioVehicleCategoryId,
      ':site_main_id'=>$siteMainId,
      ':quantity'=>$quantity,
      ':unlimited_yn'=>$unlimited?'Y':'N'
    );
    $sSQL = "INSERT INTO scenario_vehiclecategory_site (
                           scenario_vehiclecategory_id,
                           site_main_id,
                           quantity,
                           unlimited_yn)
                  VALUES (
                           :scenario_vehiclecategory_id,
                           :site_main_id,
                           :quantity,
                           :unlimited_yn )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);                  
  }

  /**
  * Update a vehicle category quantity to a depot
  * @param $quantity integer : number of vehicle of vehicleCategory on depot
  * @param $unlimited string : 'Y' or 'N'
  **/
  public function updateVehicleQuantityToDepot($id,$quantity,$unlimited){
    $siteMainIdQuoted = $this->db()->quote($siteMainId);
    $scenarioVehicleCategoryIdQuoted = $this->db()->quote($scenarioVehicleCategoryId);

    $aReplacement = array(
      ':id'=>$id,
      ':quantity'=>$quantity,
      ':unlimited_yn'=>$unlimited?'Y':'N'
    );
    $sSQL = "UPDATE scenario_vehiclecategory_site
                SET quantity=:quantity, unlimited_yn=:unlimited_yn
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);                
  }

  /**
  * Mark a scenario_vehiclecategory item as removed (mark the link between a scenario and a vehicle category as removed)
  * @param string $sScenarioVehicleCategoryID : id of the scenario_vehiclecategory item to be removed.
  * @return boolean : true in case of success
  */
  public function markScenarioVehicleCategoryAsRemoved($sScenarioVehicleCategoryID){
    $query = "UPDATE scenario_vehiclecategory SET rec_st='D' WHERE id=" . $this->db()->quote($sScenarioVehicleCategoryID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a scenario_vehiclecategory item (delete link between a scenario and a vehicle category)
  * @param string $sScenarioVehicleCategoryID : id of the scenario_vehiclecategory item to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteScenarioVehicleCategory($sScenarioVehicleCategoryID){
    $bResult = false;
    if($this->isAdmin()){  
      $query = "DELETE FROM scenario_vehiclecategory WHERE id=" . $this->db()->quote($sScenarioVehicleCategoryID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
   * List the routes for a scenario at a given calendar date OR for a given time range
   * @param $aData array : should contain a scenarioMainId field and a calendarDt field in ms and a timeSlotId field
   *                       or startDt / endDt
   * @param boolean $bWithAccessRestriction : whether to apply access restriction or not
   * @return array : array of routes
   */
  public function listRoutesByCalendarDt($aData,$bWithAccessRestriction=true){
    $aResult=array();
    if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!=null && $aData['scenarioMainId']!=""){
      // In order to query the transport_calendar table, let us make sure the queried date is expressed
      //   a midnight server time

      $sCalendarDtClause="";
      if(isset($aData['calendarDt'])){
        $sCalendarDtQuoted = $this->db()->quote(strtotime(date('Y-m-d',round($aData['calendarDt']/1000))));
        $sCalendarDtClause = " AND route.date_dt = $sCalendarDtQuoted ";
      }
      
      $sTimeSlotIdClause="";
      if(isset($aData['timeSlotId'])){
        $sTimeSlotIdQuoted = $this->db()->quote($aData['timeSlotId']);
        $sTimeSlotIdClause = " AND route.timeslot_th = $sTimeSlotIdQuoted ";
      }

      if(isset($aData['startDt']) && isset($aData['endDt'])){
        $sStartDtQuoted = $this->db()->quote(strtotime(date('Y-m-d',round($aData['startDt']/1000))));
        $sEndDtQuoted = $this->db()->quote(strtotime(date('Y-m-d',round($aData['endDt']/1000))));
        $sCalendarDtClause = " AND route.date_dt BETWEEN $sStartDtQuoted AND $sEndDtQuoted ";
      }

      $sScenarioMainIdQuoted = $this->db()->quote($aData['scenarioMainId']);

      // We will request opening hours only if the timeSlotId input parameter is provided
      $sOpeningHoursSelect ="";
      $sWithOpeningHoursClause="";
      if(isset($aData['timeSlotId'])){
        $sTimeSlotIdQuoted = $this->db()->quote($aData['timeSlotId']);        
        // SQL query that collects the opening hours for some institutions sites
        $sHoursByInstitutionSQL =
" SELECT site_main.id as site_main_id, json_agg(json_build_object(
          'start_hr',site_hour.start_hr*1000,
          'end_hr',site_hour.end_hr*1000
        )) AS list
  FROM site_main
  INNER JOIN site_hour ON site_hour.site_main_id=site_main.id
                      AND site_hour.timeslot_th = $sTimeSlotIdQuoted
                      AND site_hour.rec_st <> 'D'
  INNER JOIN util_thesaurus ON site_main.type_th=util_thesaurus.id AND util_thesaurus.code = 'INSTITUTION'
       WHERE site_main.rec_st <> 'D'
       GROUP BY site_main.id";
        $sOpeningHoursSelect = " 'opening_hours',opening_hours.list, ";
        $sWithOpeningHoursClause=" LEFT JOIN ( $sHoursByInstitutionSQL) as opening_hours ON opening_hours.site_main_id=site_main.id ";       
      }

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
      $sAccessRestrictionClause="";
      if($bWithAccessRestriction){
        $sAccessRestrictionClause = $this->getAccessRestrictionClause('site_main','id');
      }

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
        CAST(route.cost as bigint) as  cost,
        CAST(route.co2 as bigint) as  co2,
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
        scenario_main.label as scenario_label,
        json_agg(json_build_object(
          'id',site_poi.id,
          'transport_demand_id',transport_demand.id,
          'transport_demand_start_hr',transport_demandtime.start_hr*1000,
          'transport_demand_end_hr',transport_demandtime.end_hr*1000,
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
          $sOpeningHoursSelect
          'target_hr',CAST(poi.target_hr AS bigint)*1000,
          'target_hr_manual',CAST(poi.target_hr_manual AS bigint)*1000,
          'target_hr_auto',CAST(poi.target_hr_auto AS bigint)*1000,
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
 LEFT JOIN transport_demandtime ON transport_demandtime.transport_demand_id=transport_demand.id AND
                                   transport_demandtime.rec_st<>'D' AND
                                   transport_demandtime.timeslot_th=route.timeslot_th
INNER JOIN site_poi ON poi.site_poi_id=site_poi.id AND site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
INNER JOIN site_main ON site_poi.site_main_id=site_main.id AND site_main.rec_st<>'D'
INNER JOIN scenario_main ON route.scenario_main_id=scenario_main.id
$sAccessRestrictionClause
$sWithOpeningHoursClause
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
      WHERE route.rec_st <> 'D'
            $sCalendarDtClause
            $sTimeSlotIdClause AND
            route.scenario_main_id = $sScenarioMainIdQuoted
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
            scenario_main.label
   ORDER BY route.date_dt,route.label";
      $result = $this->db()->query($sSQL);
      $this->log()->info($sSQL);
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
   * List the POIs for a scenario at a given calendar date and timeslot id.
   * @param $aData array : should contain a scenarioMainId field and a calendarDt field in ms and a timeSlotId field
   * @return array : array of POIs
   */
  public function listPOIs($aData){
    $aResult=array();
    if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!=null && $aData['scenarioMainId']!=""){
      $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_institution','id');
      $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_hr','id');    
      // In order to query the trnasport_calendar table, let us make sure the queried date is expressed
      //   a midnight server time
      $sCalendarDtQuoted = $this->db()->quote(strtotime(date('Y-m-d',round($aData['calendarDt']/1000))));
      $sTimeslotIdQuoted = $this->db()->quote($aData['timeSlotId']);
      $sScenarioMainIdQuoted = $this->db()->quote($aData['scenarioMainId']);
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
            INNER JOIN transport_calendar ON transport_calendar.transport_demand_id=transport_demand.id
                                          AND transport_calendar.rec_st<>'D'
                                          AND transport_calendar.date_dt=$sCalendarDtQuoted
                                          AND transport_calendar.timeslot_th=$sTimeslotIdQuoted
            INNER JOIN hr_main ON transport_demand.hr_main_id = hr_main.id AND hr_main.rec_st<>'D'
            INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
                                               AND hr_main_status.code<>'DISABLED'
             LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
             LEFT JOIN hr_maindetail on hr_main.id=hr_maindetail.hr_main_id AND hr_maindetail.rec_st<>'D'
             LEFT JOIN util_thesaurus as transport_mode on transport_mode.id=hr_maindetail.transportmode_th
            INNER JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                               AND site_poi_hr.rec_st<>'D' AND site_poi_hr.geom IS NOT NULL
            INNER JOIN ( $sInstitutionsByHomePOISQL ) AS institutions ON institutions.id=site_poi_hr.id
            INNER JOIN site_main as site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id AND site_main_hr.rec_st<>'D'
            $sHRAccessRestrictionClause
            INNER JOIN util_thesaurus as site_main_hr_type on site_main_hr.type_th=site_main_hr_type.id
            INNER JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                        AND site_poi_institution.rec_st<>'D'
                                                        AND site_poi_institution.geom IS NOT NULL
            INNER JOIN site_main as site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                          AND site_main_institution.rec_st<>'D'
            $sInstitutionAccessRestrictionClause
            LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi_hr.id
                                                          AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                                          AND home_to_institution.rec_st<>'D'
                                                          AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
            LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                                                          AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                                          AND institution_to_home.rec_st<>'D'
                                                          AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
            -- attention aux demandes qui font partie de plusieurs groupes rattachés aux scenarios
            INNER JOIN transport_groupdemand ON transport_groupdemand.transport_demand_id = transport_demand.id
                                            AND transport_groupdemand.rec_st<>'D'
            INNER JOIN transport_group ON transport_groupdemand.transport_group_id = transport_group.id
                                            AND transport_group.rec_st<>'D'
            INNER JOIN scenario_transportgroup ON scenario_transportgroup.transport_group_id = transport_group.id
                                            AND scenario_transportgroup.rec_st<>'D'
                                            AND scenario_transportgroup.scenario_main_id = $sScenarioMainIdQuoted
                 WHERE transport_demand.rec_st<>'D'";
      $result = $this->db()->query($sQuery);
      $aDemands = $result->fetchAll(PDO::FETCH_ASSOC);
      // Cast every geojson to an array structures
      foreach($aDemands as &$aDemand){
        $aDemand["geom"]=json_decode($aDemand["geom"],true);
        $aDemand["institutions"]=json_decode($aDemand["institutions"],true);
      }
    }
    return $aDemands;
  }

}