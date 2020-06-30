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
 *  Class for transport_calendars handling in database
 *  @creationdate 2019-09-03
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class CalendarDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * List calendars
   * The input data array is expected to contain some filters
   *   - transportDemandId : the target transport demand
   *   - scenarioMainId : the target scenario id
   *   - timeSlotId : a timeslot id
   *   - startDt : the start date (inclusive) to consider for the search (in ms)
   *   - endDt : the end date (exclusive) to consider for the search (in ms)
   *   - status_code : 'TO_BE_SERVED' or 'NOT_TO_SERVE'
   * @param array $aData : filtering data
   * @return array({object}) : array of transport calendar objects
   */
  public function list($aData){
    $sTransportDemandIDClause = "";
    if(isset($aData['transportDemandId']) && $aData['transportDemandId']!= null && $aData['transportDemandId']!= ""){
      $sTransportDemandIDQuoted = $this->db()->quote($aData['transportDemandId']);
      $sTransportDemandIDClause = " AND transport_calendar.transport_demand_id = $sTransportDemandIDQuoted ";
    }
    $sScenarioMainIDJoin = "";
    if(isset($aData['scenarioMainId']) && $aData['scenarioMainId']!= null && $aData['scenarioMainId']!= ""){
      $sScenarioMainIDQuoted = $this->db()->quote($aData['scenarioMainId']);
      $sScenarioMainIDJoin = "
        INNER JOIN transport_demand ON transport_demand.id = transport_calendar.transport_demand_id
                                    AND transport_demand.rec_st<>'D'
        INNER JOIN transport_groupdemand ON transport_demand.id = transport_groupdemand.transport_demand_id
                                         AND transport_groupdemand.rec_st <> 'D'
        INNER JOIN transport_group ON transport_groupdemand.transport_group_id = transport_group.id
                                   AND transport_group.rec_st <> 'D'
        INNER JOIN scenario_transportgroup ON scenario_transportgroup.transport_group_id = transport_group.id
                                           AND scenario_transportgroup.rec_st <> 'D'
                                           AND scenario_transportgroup.scenario_main_id = $sScenarioMainIDQuoted";
    }

    $sStartDtClause = "";
    if(isset($aData['startDt']) && $aData['startDt']!= null && $aData['startDt']!= ""){
      $sStartDtQuoted = $this->db()->quote(round($aData['startDt']/1000));
      $sStartDtClause = " AND transport_calendar.date_dt >= CAST($sStartDtQuoted as integer) ";
    }

    $sEndDtClause = "";
    if(isset($aData['endDt']) && $aData['endDt']!= null && $aData['endDt']!= ""){
      $sEndDtQuoted = $this->db()->quote(round($aData['endDt']/1000));
      $sEndDtClause = " AND transport_calendar.date_dt < CAST($sEndDtQuoted as integer) ";
    }

    $sTimeslotIDClause = "";
    if(isset($aData['timeSlotId']) && $aData['timeSlotId']!= null && $aData['timeSlotId']!= ""){
      $sTimeslotIDQuoted = $this->db()->quote($aData['timeSlotId']);
      $sTimeslotIDClause = " AND transport_calendar.timeslot_th = $sTimeslotIDQuoted ";
    }

    $sStatusCodeClause = "";
    if(isset($aData['status_code']) && $aData['status_code']!= null && $aData['status_code']!= ""){
      $sStatusCodeQuoted = $this->db()->quote($aData['status_code']);
      $sStatusCodeClause = " AND transport_calendar_status.code = $sStatusCodeQuoted ";
    }
    
    $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_institution','id');
    $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_hr','id');  
    $sql = "SELECT
                   transport_calendar.id,
                   transport_calendar.transport_demand_id,
                   transport_calendar.hr_main_id,
                   hr_main.firstname as hr_firstname,
                   hr_main.lastname as hr_lastname,
                   site_poi_institution.id as site_poi_id_institution,
                   site_poi_institution.label as site_poi_label_institution,
                   site_main_institution.id as institution_id,
                   site_main_institution.label as institution_label,
                   site_main_institution_type.code as site_poi_type_code_institution,
                   site_poi_institution.addr1 as site_poi_addr1_institution,
                   site_poi_institution.addr2 as site_poi_addr2_institution,
                   site_poi_institution.postcode as site_poi_postcode_institution,
                   site_poi_institution.city as site_poi_city_institution,
                   ST_AsGeoJSON(site_poi_institution.geom) as site_poi_geom_institution,
                   site_poi_institution.service_duration*1000 as site_poi_service_duration_institution,
                   site_poi_hr.id as site_poi_id_hr,
                   site_poi_hr.label as site_poi_label_hr,
                   site_main_hr_type.code as site_poi_type_code_hr,
                   ST_AsGeoJSON(site_poi_hr.geom) as site_poi_geom_hr,
                   site_poi_hr.addr1 as site_poi_addr1_hr,
                   site_poi_hr.addr2 as site_poi_addr2_hr,
                   site_poi_hr.postcode as site_poi_postcode_hr,
                   site_poi_hr.city as site_poi_city_hr,
                   site_poi_hr.service_duration*1000 as site_poi_service_duration_hr,
                   transportmode_type_hr.code as site_poi_transport_mode_code_hr,
                   hr_maindetail.pickup_duration*1000 as hr_pickup_duration,
                   hr_maindetail.delivery_duration*1000 as hr_delivery_duration,
                   home_to_institution.acceptable_duration*1000 as home_to_institution_acceptable_duration,
                   institution_to_home.acceptable_duration*1000 as institution_to_home_acceptable_duration,
                   transport_calendar.timeslot_th,
                   transport_calendar.status_th,
                   transport_calendar_status.code as transport_calendar_status_code,
                   transport_calendar.manually_updated_yn,
                   CAST(transport_calendar.date_dt AS bigint)*1000 as date_dt,
                   transport_calendar.start_hr,
                   transport_calendar.end_hr
              FROM transport_calendar
        INNER JOIN site_poi as site_poi_institution ON transport_calendar.site_poi_id_institution = site_poi_institution.id
                                                   AND site_poi_institution.rec_st<>'D'
                                                   AND site_poi_institution.geom IS NOT NULL
        INNER JOIN site_main AS site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                                     AND site_main_institution.rec_st<>'D'
        $sInstitutionAccessRestrictionClause
        INNER JOIN util_thesaurus AS transport_calendar_status ON transport_calendar.status_th = transport_calendar_status.id
        INNER JOIN util_thesaurus AS site_main_institution_type ON site_main_institution.type_th = site_main_institution_type.id
        INNER JOIN util_thesaurus AS site_main_institution_status ON site_main_institution_status.id = site_main_institution.status_th
                                                                 AND site_main_institution_status.code<>'DISABLED'
        INNER JOIN site_poi as site_poi_hr ON transport_calendar.site_poi_id_hr = site_poi_hr.id
                                          AND site_poi_hr.rec_st<>'D'
                                          AND site_poi_hr.geom IS NOT NULL
        INNER JOIN site_main AS site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id
                                            AND site_main_hr.rec_st<>'D'
        $sHRAccessRestrictionClause
        INNER JOIN util_thesaurus AS site_main_hr_type ON site_main_hr.type_th = site_main_hr_type.id
        INNER JOIN util_thesaurus AS site_main_hr_status ON site_main_hr_status.id = site_main_hr.status_th
                                                        AND site_main_hr_status.code<>'DISABLED'
        INNER JOIN hr_main ON hr_main.id = transport_calendar.hr_main_id
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
                   $sScenarioMainIDJoin
             WHERE transport_calendar.rec_st<>'D'
                   $sTransportDemandIDClause
                   $sStartDtClause
                   $sEndDtClause
                   $sTimeslotIDClause
                   $sStatusCodeClause";
    $result = $this->db()->query($sql);
    $aResults = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach($aResults as &$aResult){
    $aResult["institutionPOI"]=array(
      "id"=> $aResult["site_poi_id_institution"],
      "label"=>$aResult["site_poi_label_institution"],
      "site_main_id"=>$aResult["institution_id"],
      "site_main_label"=>$aResult["institution_label"],
      "site_type_code"=>$aResult["site_poi_type_code_institution"],
      "addr1"=>$aResult["site_poi_addr1_institution"],
      "addr2"=>$aResult["site_poi_addr2_institution"],
      "postcode"=>$aResult["site_poi_postcode_institution"],
      "city"=>$aResult["site_poi_city_institution"],
      "geom"=>json_decode($aResult["site_poi_geom_institution"],true),
      "service_duration"=>$aResult["site_poi_service_duration_institution"]
    );
    unset($aResult["site_poi_id_institution"]);
    unset($aResult["site_poi_label_institution"]);
    unset($aResult["institution_id"]);
    unset($aResult["institution_label"]);
    unset($aResult["site_poi_type_code_institution"]);
    unset($aResult["site_poi_addr1_institution"]);
    unset($aResult["site_poi_addr2_institution"]);
    unset($aResult["site_poi_postcode_institution"]);
    unset($aResult["site_poi_city_institution"]);
    unset($aResult["site_poi_geom_institution"]);
    unset($aResult["site_poi_service_duration_institution"]);
    $aResult["HRPOI"]=array(
      "id"=>$aResult["site_poi_id_hr"],
      "label"=>$aResult["site_poi_label_hr"],
      "hr_firstname"=>$aResult["hr_firstname"],
      "hr_lastname"=>$aResult["hr_lastname"],
      "hr_id"=>$aResult["hr_main_id"],
      "site_type_code"=>$aResult["site_poi_type_code_hr"],
      "addr1"=>$aResult["site_poi_addr1_hr"],
      "addr2"=>$aResult["site_poi_addr2_hr"],
      "postcode"=>$aResult["site_poi_postcode_hr"],
      "city"=>$aResult["site_poi_city_hr"],
      "geom"=>json_decode($aResult["site_poi_geom_hr"],true),
      "service_duration"=>$aResult["site_poi_service_duration_hr"],
      "transport_mode_code"=>$aResult["site_poi_transport_mode_code_hr"],
      "hr_pickup_duration"=>$aResult["hr_pickup_duration"],
      "hr_delivery_duration"=>$aResult["hr_delivery_duration"],
      "home_to_institution_acceptable_duration"=>$aResult["home_to_institution_acceptable_duration"],
      "institution_to_home_acceptable_duration"=>$aResult["institution_to_home_acceptable_duration"]
    );
          unset($aResult["site_poi_id_hr"]);
          unset($aResult["site_poi_label_hr"]);
          unset($aResult["hr_firstname"]);
          unset($aResult["hr_lastname"]);
          unset($aResult["hr_main_id"]);
          unset($aResult["site_poi_type_code_hr"]);
          unset($aResult["site_poi_addr1_hr"]);
          unset($aResult["site_poi_addr2_hr"]);
          unset($aResult["site_poi_postcode_hr"]);
          unset($aResult["site_poi_city_hr"]);
          unset($aResult["site_poi_geom_hr"]);
          unset($aResult["site_poi_service_duration_hr"]);
          unset($aResult["site_poi_transport_mode_code_hr"]);
          unset($aResult["hr_pickup_duration"]);
          unset($aResult["hr_delivery_duration"]);
          unset($aResult["home_to_institution_acceptable_duration"]);
          unset($aResult["institution_to_home_acceptable_duration"]);
    }
    return $aResults;
  }

  /**
   * Insert new transport calendars items for one transport demand
   * The input $aCalendarsToInsert array is expected to contain transport calendar items with the following fields :
   *   - start_hr : start hour for the delivery or pickup, expressed in ms
   *   - end_hr : end hour for the delivery or pickup, expressed in ms
   *   - timeslot_th : the concerned timeslot ID
   *   - date_dt : the concerned dt, expressed in ms at midnight (server time)
   *   - site_poi_id_institution : the concerned institution poi
   *   - site_poi_id_hr : the concerned home poi
   *   - hr_main_id : the concerned hr
   *   - transport_demand_id : the concerned transport demand id
   * Notice that in the provided date_dt, only the day is important, the hours, minutes, seconds and miliseconds
   *   are not relevant. In order to make easier the future searches in calendar table, all dates in the date_dt
   *   column of the transport_calendar table will be expressed at midnight (server time)
   * Warning : creating new items in transport_calendar with this function will not keep audit trail up-to-date.
   * @param array $aCalendarsToInsert the transport calendars to be inserted
   * @return boolean : true if the insert succeeded
   */
  public function add($aCalendarsToInsert){
    // Prepare a single SQL query with all the concerned calendars.
    $sValues= "";
    foreach($aCalendarsToInsert as $aCalendarToInsert){
      if($sValues!=""){
        $sValues.=",";
      }
      $sTransportDemandIdQuoted = $this->db()->quote($aCalendarToInsert["transport_demand_id"]);
      $sStartHourQuoted = $this->db()->quote(round($aCalendarToInsert["start_hr"]/1000));
      $sEndHourQuoted = $this->db()->quote(round($aCalendarToInsert["end_hr"]/1000));
      $sSitePOIIdInstitutionQuoted = $this->db()->quote($aCalendarToInsert["site_poi_id_institution"]);
      $sSitePOIIdHRQuoted = $this->db()->quote($aCalendarToInsert["site_poi_id_hr"]);
      $sHRMainIdQuoted = $this->db()->quote($aCalendarToInsert["hr_main_id"]);
      $sTimeslotThQuoted = $this->db()->quote($aCalendarToInsert["timeslot_th"]);
      $sCalendarDtQuoted = $this->db()->quote(round($aCalendarToInsert["date_dt"]/1000));
      $sValues .="(";
      $sValues .=  "$sTransportDemandIdQuoted, ";
      $sValues .=  "$sStartHourQuoted, ";
      $sValues .=  "$sEndHourQuoted, ";
      $sValues .=  "$sSitePOIIdInstitutionQuoted, ";
      $sValues .=  "$sSitePOIIdHRQuoted, ";
      $sValues .=  "$sHRMainIdQuoted, ";
      $sValues .= "(SELECT ID FROM util_thesaurus WHERE CAT='TRANSPORT_CALENDAR_STATUS' AND code='TO_BE_SERVED'),";
      $sValues .=  "$sTimeslotThQuoted, ";
      $sValues .=  "$sCalendarDtQuoted ";
      $sValues .=")";
    }
    $iResult = false;
    if($sValues!=""){
      $sSQL = "INSERT INTO transport_calendar
                (
                  transport_demand_id,
                  start_hr,
                  end_hr,
                  site_poi_id_institution,
                  site_poi_id_hr,
                  hr_main_id,
                  status_th,
                  timeslot_th,
                  date_dt
                )
               VALUES $sValues";
      $iResult = $this->db()->exec($sSQL);
    }
    return $iResult;
  }

  public function get($calendarId){
    $calendarIdQuoted = $this->db()->quote($calendarId);    

    $sSQL = "SELECT 
              transport_calendar.id,
              transport_calendar.transport_demand_id,
              transport_calendar.hr_main_id,
              transport_calendar.timeslot_th,
              transport_calendar_timeslot_th.label as timeslot_label,
              transport_calendar_status_th.label as status_label,
              transport_calendar_status_th.code as status_code,
              transport_calendar.manually_updated_yn,
              CAST(transport_calendar.date_dt AS bigint)*1000 as date_dt
             FROM transport_calendar
             INNER JOIN util_thesaurus AS transport_calendar_timeslot_th ON transport_calendar.timeslot_th = transport_calendar_timeslot_th.id
             INNER JOIN util_thesaurus AS transport_calendar_status_th ON transport_calendar.status_th = transport_calendar_status_th.id
             WHERE transport_calendar.id=$calendarIdQuoted";

    $result = $this->db()->query($sSQL);
    $aResult = $result->fetch(PDO::FETCH_ASSOC);

    return $aResult;
  }

  /**
   * Update transport calendars items for one transport demand
   * The input $aCalendarsToUpdate array is expected to contain transport calendar items with the following fields :
   *   - start_hr : start hour for the delivery or pickup, expressed in ms
   *   - end_hr : end hour for the delivery or pickup, expressed in ms
   *   - id : the transport calendar to update
   *   - institutionPOI : the concerned institution poi
   *   - HRPOI : the concerned home poi and hr
   * Notice that not all the fields from transport_calendar can be updated, only the following ones :
   *   start_hr, end_hr, site_poi_id_institution, site_poi_id_hr, hr_main_id
   * In order to update other fields, better delete the transport_calendar and create a new one.
   * Warning : updating items in transport_calendar with this function will not keep audit trail up-to-date.
   * @param array $aCalendarsToUpdate the transport calendars to be updated
   * @return boolean : true if the update succeeded
   */
  public function update($aCalendarsToUpdate){
    // Prepare a single SQL query with all the concerned calendars.
    $sValues= "";
    foreach($aCalendarsToUpdate as $aCalendarToUpdate){
      $this->log()->info(["method"=>__METHOD__,"message"=>"update " . $aCalendarToUpdate["HRPOI"]["hr_firstname"]]);
      if($sValues!=""){
        $sValues.=",";
      }
      $sIdQuoted = $this->db()->quote($aCalendarToUpdate["id"]);
      $sStartHourQuoted = $this->db()->quote(round($aCalendarToUpdate["start_hr"]/1000));
      $sEndHourQuoted = $this->db()->quote(round($aCalendarToUpdate["end_hr"]/1000));
      $sSitePOIIdInstitutionQuoted = $this->db()->quote($aCalendarToUpdate["institutionPOI"]["id"]);
      $sSitePOIIdHRQuoted = $this->db()->quote($aCalendarToUpdate["HRPOI"]["id"]);
      $sHRMainIdQuoted = $this->db()->quote($aCalendarToUpdate["HRPOI"]["hr_id"]);
      $sValues .="(";
      $sValues .=  "CAST( $sIdQuoted AS UUID), ";
      $sValues .=  "CAST($sStartHourQuoted AS integer), ";
      $sValues .=  "CAST($sEndHourQuoted AS integer), ";
      $sValues .=  "CAST( $sSitePOIIdInstitutionQuoted AS UUID), ";
      $sValues .=  "CAST( $sSitePOIIdHRQuoted AS UUID), ";
      $sValues .=  "CAST( $sHRMainIdQuoted AS UUID)";
      $sValues .=")";
    }
    $iResult = false;
    if($sValues!=""){
      $sSQL = "UPDATE transport_calendar AS t SET
                 start_hr = c.start_hr,
                 end_hr  = c.end_hr,
                 site_poi_id_institution  = c.site_poi_id_institution,
                 site_poi_id_hr = c.site_poi_id_hr,
                 hr_main_id =c.hr_main_id
               FROM ( VALUES $sValues ) AS c(id,start_hr,end_hr,site_poi_id_institution,site_poi_id_hr,hr_main_id)
               WHERE c.id = t.id";
      $iResult = $this->db()->exec($sSQL);
    }
    return $iResult;
  }

  /**
   * Set Calendar status
   * @param $aData[id=>transport_calendar id, "status_code" : new status]
   */
  function setStatus($aData){
    $sSQL = "UPDATE transport_calendar
             SET status_th=(SELECT ID FROM util_thesaurus WHERE CAT='TRANSPORT_CALENDAR_STATUS' AND code=:status_code)
             WHERE id = :id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute(array(
      ':id'=>$aData['id'],
      ':status_code'=>$aData['status_code']
    ));
  }

  /**
   * Delete the transport demand calendar for one demand
   * Warning : Deleting items from transport_calendar with this function will not keep audit trail up-to-date.
   * @param array $aCalendarsToDelete the transport calendars to be deleted (each one with an id field)
   * @return boolean : true if the delete succeeded
   */
  public function delete($aCalendarsToDelete){
    // Prepare a single SQL query with all the concerned calendars.
    $sValues= "";
    foreach($aCalendarsToDelete as $aCalendarToDelete){
      if($sValues!=""){
        $sValues.=",";
      }
      $sValues .= $this->db()->quote($aCalendarToDelete["id"]);
    }
    $iResult = false;
    if($sValues!=""){
      $sSQL = "DELETE FROM datachecker_detail WHERE transport_calendar_id IN ( $sValues )";
      $iResult = $this->db()->exec($sSQL);      
      $sSQL = "DELETE FROM transport_calendar WHERE id IN ( $sValues )";
      $iResult = $this->db()->exec($sSQL);

    }
    return $iResult;
  }
}