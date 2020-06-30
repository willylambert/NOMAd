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
 *  Class for checks handling in database
 *  @creationdate 2020-01-15
 *  @by @willylambert
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class DataCheckerDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * Get the checks list
   * The input data array is expected to contain some filters
   * @param array $aData : filtering data []
   * @return array({object}) : array of Check objects
   */
  public function list($aData){
    $sQuery = "SELECT datachecker_main.id,
                      datachecker_main.label,
                      datachecker_main.label_tpl,
                      datachecker_main.hookname,
                      datachecker_main_scope.label AS scope_label,
                      datachecker_main_scope.code AS scope_code,
                      datachecker_main_status.label AS status_label,
                      datachecker_main_status.code AS status_code
                FROM datachecker_main
          INNER JOIN util_thesaurus AS datachecker_main_scope ON datachecker_main_scope.id = datachecker_main.scope_th
          INNER JOIN util_thesaurus AS datachecker_main_status ON datachecker_main_status.id = datachecker_main.status_th
          WHERE datachecker_main.rec_st<>'D'";

    $result = $this->db()->query($sQuery);
    $aResults = $result->fetchAll(PDO::FETCH_ASSOC);
    return $aResults;
  }

  /**
  * Read the asked check
  * @param string $checkId : Check Reference
  * @return array check data
  **/
  public function get($checkId){
    $sCheckIdQuoted = $this->db()->quote($checkId);
    $sQuery = "SELECT datachecker_main.id,
                      datachecker_main.label,
                      datachecker_main.label_tpl,
                      datachecker_main.hookname,
                      datachecker_main.scope_th AS scope_th,
                      datachecker_main_scope.label AS scope_label,
                      datachecker_main_scope.code AS scope_code,
                      datachecker_main.status_th AS status_th,
                      datachecker_main_status.label AS status_label,
                      datachecker_main_status.code AS status_code,
                      datachecker_main.level_th AS level_th,
                      datachecker_main_level.label AS level_label,
                      datachecker_main_level.code AS level_code

                FROM datachecker_main
                INNER JOIN util_thesaurus AS datachecker_main_scope ON datachecker_main_scope.id = datachecker_main.scope_th
                INNER JOIN util_thesaurus AS datachecker_main_status ON datachecker_main_status.id = datachecker_main.status_th
                INNER JOIN util_thesaurus AS datachecker_main_level ON datachecker_main_level.id = datachecker_main.level_th
                WHERE datachecker_main.id=$sCheckIdQuoted";
    $result = $this->db()->query($sQuery);
    $aResult = $result->fetch(PDO::FETCH_ASSOC);
    return $aResult;
  }

   /**
  * Add a check
  * @param array $aData : data of the check to be inserted.
  * @return array created check with an id field
  */
  public function add($aData){
    $sSQL = "INSERT INTO datachecker_main (
                           label,
                           status_th,
                           scope_th,
                           level_th,
                           label_tpl,
                           hookname,
                           rec_st)
                VALUES ( :label, 
                         :status_th,
                         :scope_th,
                         :level_th,
                         :label_tpl,
                         :hookname,
                         :rec_st)
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':label'=>$aData['label'],
      ':status_th'=>$aData['status_th'],
      ':scope_th'=>$aData['scope_th'],
      ':level_th'=>$aData['level_th'],
      ':label_tpl'=>$aData['label_tpl'],
      ':hookname'=>$aData['hookname'],
      ':rec_st'=>$aData['rec_st']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a check
  * @param array $aData : data of the check to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $sSQL = "UPDATE datachecker_main
                SET
                  label=:label,
                  status_th=:status_th,
                  scope_th=:scope_th,
                  level_th=:level_th,
                  label_tpl=:label_tpl,
                  hookname=:hookname,
                  rec_st=:rec_st
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    $bResult= $oQuery->execute(array(
      ':id'=>$aData['id'],
      ':label'=>$aData['label'],
      ':status_th'=>$aData['status_th'],
      ':scope_th'=>$aData['scope_th'],
      ':level_th'=>$aData['level_th'],
      ':label_tpl'=>$aData['label_tpl'],
      ':hookname'=>$aData['hookname'],
      ':rec_st'=>$aData['rec_st']
    ));
    return $bResult;
  }

  /**
   * List checker details
   * @param $aData array of filters : ["datachecker_main_id","scenario_main_id" ,"transport_demand_id" ,"transport_calendar_id" ,"transport_route_id" ,"vehicle_category_id" ,"site_poi_id" ,"hr_main_id"]
   */
  public function listDetails($aData){

    $dataCheckerMainId = $this->db()->quote($aData['datachecker_main_id']);
    $scenarioMainId = $this->db()->quote($aData['scenario_main_id']);
    $transportDemandId = $this->db()->quote($aData['transport_demand_id']);
    $transportCalendarId = $this->db()->quote($aData['transport_calendar_id']);
    $transportRouteId = $this->db()->quote($aData['transport_route_id']);
    $vehicleCategoryId = $this->db()->quote($aData['vehicle_category_id']);
    $sitePoiId = $this->db()->quote($aData['site_poi_id']);
    $hrMainId = $this->db()->quote($aData['hr_main_id']);
    $iTransportCalendarClause ="";
    if(isset($aData['transport_calendar_dt']) && is_integer($aData['transport_calendar_dt'])){
      $iTransportCalendarClause = " transport_calendar.date_dt = ".$aData['transport_calendar_dt']." AND ";
    }


    $sQuery = "SELECT datachecker_detail.id,
                      CAST(transport_calendar.date_dt AS bigint)*1000 as transport_calendar_dt,
                      transport_calendar.timeslot_th as transport_calendar_timeslot_th,
                      datachecker_detail.transport_route_id,
                      datachecker_detail.transport_demand_id,
                      transport_demand.site_poi_id_institution,
                      transport_demand.site_poi_id_hr,
                      datachecker_detail.site_poi_id,
                      site_poi.label,
                      datachecker_detail.hr_main_id,
                      hr_main.firstname,
                      hr_main.lastname,
                      datachecker_detail.label,
                      CAST(datachecker_detail.dt AS bigint)*1000 as dt,
                      th_scope.id as scope_th,
                      th_scope.code as scope_code,
                      th_level.id as level_th,
                      th_level.code as level_code
                FROM datachecker_detail
          INNER JOIN datachecker_main ON datachecker_detail.datachecker_main_id = datachecker_main.id 
          INNER JOIN util_thesaurus AS th_scope ON th_scope.id = datachecker_main.scope_th
          INNER JOIN util_thesaurus AS th_level ON th_level.id = datachecker_main.level_th
           LEFT JOIN transport_calendar ON transport_calendar.id=datachecker_detail.transport_calendar_id
           LEFT JOIN transport_demand ON transport_demand.id=datachecker_detail.transport_demand_id
           LEFT JOIN site_poi ON site_poi.id=datachecker_detail.site_poi_id
           LEFT JOIN hr_main ON hr_main.id=datachecker_detail.hr_main_id
               WHERE datachecker_detail.rec_st<>'D' AND "
                     . ($dataCheckerMainId!=="''" ? "  datachecker_detail.datachecker_main_id = $dataCheckerMainId AND " : "") 
                     . ($scenarioMainId!=="''" ? "  datachecker_detail.scenario_main_id = $scenarioMainId AND " : "") 
                     . ($transportDemandId!=="''" ? "  datachecker_detail.transport_demand_id = $transportDemandId AND " : "") 
                     . ($transportCalendarId!=="''" ? "  datachecker_detail.transport_calendar_id = $transportCalendarId AND " : "") 
                     . ($transportRouteId!=="''" ? "  datachecker_detail.transport_route_id = $transportRouteId AND " : "") 
                     . ($vehicleCategoryId!=="''" ? "  datachecker_detail.vehicle_category_id = $vehicleCategoryId AND " : "") 
                     . ($sitePoiId!=="''" ? "  datachecker_detail.site_poi_id = $sitePoiId AND " : "") 
                     . ($hrMainId!=="''" ? "  datachecker_detail.hr_main_id = $hrMainId AND " :"")
                     . $iTransportCalendarClause .
                     " TRUE";

    $result = $this->db()->query($sQuery);
    $aResults = $result->fetchAll(PDO::FETCH_ASSOC);
    return $aResults;
  }

  /**
   * Save (add or update) a checkerDetail
   *@param $aData ["datachecker_main_id","label", "dt" ,"scenario_main_id" ,"transport_demand_id" ,"transport_calendar_id" ,"transport_route_id" ,"vehicle_category_id" ,"site_poi_id" ,"hr_main_id"]
   */
  public function saveDetail($aData){

    // Do we already have an existing checker entry for these keys ?
    // If yes, nothing to do
    $aCheckers = $this->listDetails($aData);
    if(count($aCheckers)==0){
      // Prepare a JSON for the extra data
      $aExtraData = array();
      if(isset($aData['calendarDt'])){
        // Dates are stored in database in seconds
        $aExtraData['calendarDt']=$aData['calendarDt']/1000;
      }
      if(isset($aData['timeSlotId'])){
        $aExtraData['timeSlotId']=$aData['timeSlotId'];
      }
      // Insert new checker_detail
      $sSQL = "INSERT INTO datachecker_detail(
                                             datachecker_main_id,
                                             label,
                                             dt,
                                             scenario_main_id,
                                             transport_demand_id,
                                             transport_calendar_id,
                                             transport_route_id,
                                             vehicle_category_id,
                                             site_poi_id,
                                             hr_main_id,
                                             extra_data)
                                      
                                      VALUES(:datachecker_main_id,
                                             :label,
                                             :dt,
                                             :scenario_main_id,
                                             :transport_demand_id,
                                             :transport_calendar_id,
                                             :transport_route_id,
                                             :vehicle_category_id,
                                             :site_poi_id,
                                             :hr_main_id,
                                             :extra_data)";

      $oQuery = $this->db()->prepare($sSQL);
      $bResult= $oQuery->execute(array(
        ':datachecker_main_id'=>$aData['datachecker_main_id'],
        ':label'=>$aData['label'],
        ':dt'=>$aData['dt'],
        ':scenario_main_id'=>$aData['scenario_main_id'],
        ':transport_demand_id'=>$aData['transport_demand_id'],
        ':transport_calendar_id'=>$aData['transport_calendar_id'],
        ':transport_route_id'=>$aData['transport_route_id'],
        ':vehicle_category_id'=>$aData['vehicle_category_id'],
        ':site_poi_id'=>$aData['site_poi_id'],
        ':hr_main_id'=>$aData['hr_main_id'],
        ':extra_data'=>json_encode($aExtraData)
      ));

      return $bResult;

    }

  }

  /**
  * Mark a check as removed
  * @param string $sDataCheckerId : id of the check to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sDataCheckerId){
    $query = "UPDATE datachecker_main SET rec_st='D' WHERE id=" . $this->db()->quote($sDataCheckerId);
    return $this->db()->exec($query);
  }

  /**
  * Delete a check.
  * @param string $sDataCheckerId : id of the check to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sDataCheckerId){
    $query = "DELETE FROM datachecker_main WHERE id=" . $this->db()->quote($sDataCheckerId);
    return $this->db()->exec($query);
  }

    /**
  * Delete a checkdetail.
  * @param string $sDataCheckerId : id of the check to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteDetail($sDataCheckerDetailId){
    $query = "DELETE FROM datachecker_detail WHERE id=" . $this->db()->quote($sDataCheckerDetailId);
    return $this->db()->exec($query);
  }

}