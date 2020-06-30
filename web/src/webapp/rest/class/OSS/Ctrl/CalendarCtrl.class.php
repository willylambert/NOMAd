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
 *  REST service to handle transport calendars
 *  @creationdate 2019-09-03
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class CalendarCtrl extends BaseObject{

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
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->list($aData);
  }

  /**
   * Get calendar
   */
  public function get($calendarId){
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->get($calendarId);
  }

  /**
   * Set Calendar status
   * @param $aData[id=>transport_calendar id, "status_code" : new status]
   */
  function setStatus($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->setStatus($aData);
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
    $this->log()->info(["method"=>__METHOD__,"data"=>count($aCalendarsToInsert)]);
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->add($aCalendarsToInsert);
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
    $this->log()->info(["method"=>__METHOD__,"data"=>count($aCalendarsToUpdate)]);
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->update($aCalendarsToUpdate);
  }

  /**
   * Delete the transport demand calendar for one demand
   * Warning : Deleting items from transport_calendar with this function will not keep audit trail up-to-date.
   * @param array $aCalendarsToDelete the transport calendars to be deleted (each one with an id field)
   * @return boolean : true if the delete succeeded
   */
  public function delete($aCalendarsToDelete){
    $this->log()->info(["method"=>__METHOD__,"data"=>count($aCalendarsToDelete)]);
    $oCalendarDAO = new \OSS\Model\CalendarDAO();
    return $oCalendarDAO->delete($aCalendarsToDelete);
  }

  /**
   * Considering a date expressed as a number of ms, change the time to midnight but keep the same
   *   date (using server timezone).
   * For instance if the input time stamp is 1546855200000 (Monday 7 January 2019 at 10:00 GMT) then the
   *   output time stamp will be 154681920‬0000 (Monday 7 January 2019 at 00:00 GMT) if the server timezone
   *   is GMT.
   * Using this function before inserting into transport_calendar will help compare dates.
   * @param integer $iDateMs : input date expressed in ms
   * @return integer midnight of the same date expressed in ms (server time)
   */
  function setToMidnight($iDateMs){
    return strtotime(date('Y-m-d',$iDateMs/1000))*1000;
  }

  /**
   * Convert a date received from client side as as year/month/day object into a unix timestamp
   *   expressed at midnight server time; in ms.
   * @param array $aDate : with the following fields : year (4 digits), month (from 1 to 12) and day (starting from 1)
   * @return integer : unix time stamp in ms
   */
  function toTimestamp($aDate){
    return strtotime($aDate["day"].'-'.$aDate["month"].'-'.$aDate["year"])*1000;
  }

  /**
   * Convert a date to be sent to client side as as year/month/day object
   * @param integer $iDateMs : input date in ms
   * @return with : with the following fields : year (4 digits), month (from 1 to 12) and day (starting from 1)
   */
  function fromTimestamp($iDateMs){
    return array(
      "year"=>floatval(date('Y',$iDateMs/1000)),
      "month"=>floatval(date('n',$iDateMs/1000)),
      "day"=>floatval(date('j',$iDateMs/1000))
    );
  }

  /**
   * Get a timeslot id from a timestamp and a direction (AM or PM)
   * The set of existing timeslots is provided as an input to avoid having to many SQL queries
   * @param array $iDateMs : a timestamp in ms
   * @param string $sDirection : AM or PM
   * @param array $aExistingTimeslots : list of existing timeslot
   * @return string : a timeslot id
   */
  function getTimeslotId($iDateMs,$sDirection,$aExistingTimeslots){
    $sTimeslotCode = $this->getTimeslotCode($iDateMs,$sDirection);
    return $this->getTimeslotIdFromTimeslotCode($sTimeslotCode,$aExistingTimeslots);
  }

  /**
   * Create a timeslot code from a timestamp (expressed in ms ) and a direction ("AM" or "PM")
   * @param $iDataMs integer : timestamp in ms
   * @param $sDirection string : AM or PM
   */
  function getTimeslotCode($iDateMs,$sDirection){
    // Get the week day as a number between 1 (for monday) and 7 (for sunday)
    $iWeekday1to7 = date('N', $iDateMs/1000);
    // Get the week day as a string (english label, as used in database)
    $aDays = array("MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY");
    $sDay = $aDays[$iWeekday1to7-1];
    // Create the timeslot code
    return $sDay."_".$sDirection;
  }

  /**
   * Knowing a timeslot code, get the corresponding database id.
   * The list of existing timeslots can be passed as an input in order to avoid SQL queries.
   * @param $sTimeslotCode string : a timeslot code
   * @param $aExistingTimeslots array : list of existing timeslot
   * @return string : a timeslot id
   */
  function getTimeslotIdFromTimeslotCode($sTimeslotCode,$aExistingTimeslots){
    $sResult = "";
    // Search the timeslots to get the timeslot id
    foreach($aExistingTimeslots as $aExistingTimeslot){
      if($aExistingTimeslot["code"]==$sTimeslotCode){
        $sResult = $aExistingTimeslot["id"];
        break;
      }
    }
    return $sResult;
  }

  /**
   * Compute the set of calendar dates and timeslots that spans over a whole scenario
   * @param array $aScenario : a scenario for which we need to compute the involved calendar dates and timeslots
   * @return array set of calendars, each calendar with a dt field and a timeslotIDs field (containing 2 timeslot IDs)
   */
  public function computeScenarioCalendarDts($aScenario){
    $aResult = array();
    $iScenarioStartMs = $this->setToMidnight($aScenario['start_dt']);
    $iScenarioEndMs = $this->setToMidnight($aScenario['end_dt']);
    // Sort existing calendars by timeslot id in an associative, for a shorter access
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $aExistingTimeslots = $oThesaurusCtrl->list(array("cat"=>'TIMESLOT'));  
    for($iCalendarDt = $iScenarioStartMs; $iCalendarDt<=$iScenarioEndMs; $iCalendarDt+=86400*1000){
      $aTimeslots = array();
      foreach(array("AM","PM") as $sDirection){
        // There is exaclty 1 possible timeslots for the current $iCalendarDt+$sDirection
        $sTimeSlotId = $this->getTimeslotId($iCalendarDt,$sDirection,$aExistingTimeslots);
        $aTimeslots[]=$sTimeSlotId;
      }
      $aResult[]=array("dt"=>$iCalendarDt,"timeslotIDs"=>$aTimeslots);
    }
    return $aResult;
  }

  /**
   * Tells whether a transport demand matches a given calendarDt (expressed at midnight server time in ms)
   * TODO : We should take into account the repetition rules of the demand during this check
   * @param array $aDemand : a transport demand with start_dt, end_dt and timeslots fields
   * @param integer $iCalendarDt : a calendar date expressed in ms at midnight server time
   * @return boolean : true if demand matches the provided calendar dt
   */
  public function demandMatchesCalendarDt($aDemand,$iCalendarDt){
    // Express demand time bounds as timestamps expressed in ms at midnight (server time)
    $iDemandStartMs = $this->setToMidnight($aDemand['start_dt']);
    $iDemandEndMs = $this->setToMidnight($aDemand['end_dt']);
    // The input $iCalendarDt must belong to the demand time range
    return ($iCalendarDt>=$iDemandStartMs && $iCalendarDt<=$iDemandEndMs);
  }

   /**
   * Tells whether a transport demand matches a given timeslot.
   * @param array $aDemand : a transport demand with a timeslots fields, each timeslot field with an timeslot_th subfield
   * @param string $sTimeSlotId : a time slot id
   * @return array : the timeslot information if demand matches the provided timeslot, empty array otherwise
   */
  public function getDemandTimeslot($aDemand,$sTimeSlotId){
    $aResult = array();
    foreach($aDemand["timeslots"] as $aTimeslot){
      if($aTimeslot['timeslot_th'] == $sTimeSlotId){
        $aResult=$aTimeslot;
        break;
      }
    }
    return $aResult;
  }

  /**
   * Turn an input collection of transport calendar items into 3-level associative array of transport calendar items.
   * First level : indexed by a calendar dt, expressed in ms and at midnight server time
   * Second level : indexed by a timeslot id
   * Third level : indexed by a transport demand id
   * @param array $aTransportCalendars, each transport calendar item with a date_dt, timeslot_th and transport_demand_id field
   * @return array : corresponding associative array on a 3-level indexing
   */
  public function toAssociativeArray($aTransportCalendars){
    $aAssociativeTransportCalendars = array();
    foreach($aTransportCalendars as $aTransportCalendar){
      // Make sure all the dates are expressed at midnight server time
      $iDateDt=$this->setToMidnight($aTransportCalendar["date_dt"]);
      $sTimeSlotTh=$aTransportCalendar["timeslot_th"];
      $sTransportDemandId=$aTransportCalendar["transport_demand_id"];
      if(!array_key_exists($iDateDt,$aAssociativeTransportCalendars)){
        $aAssociativeTransportCalendars[$iDateDt]=array();
      }
      if(!array_key_exists($sTimeSlotTh,$aAssociativeTransportCalendars[$iDateDt])){
        $aAssociativeTransportCalendars[$iDateDt][$sTimeSlotTh]=array();
      }
      if(!array_key_exists($sTransportDemandId,$aAssociativeTransportCalendars[$iDateDt][$sTimeSlotTh])){
        $aAssociativeTransportCalendars[$iDateDt][$sTimeSlotTh][$sTransportDemandId]=$aTransportCalendar;
      }
    }
    return $aAssociativeTransportCalendars;
  }

  /**
   * Update the calendars for a scenario
   * The function accepts some input filters in $aData array, with the following fields:
   *   scenarioMainId : mandatory : the target scenario id
   *   calendarDt : optional, must be provided if timeSlotId is provided : target calendar date, expressed at midnight server time
   *   timeSlotId : optional, must be provided if calendarDt is provided : target timeslot ID
   * This function returns a boolean indicating whether the update succeeded or not
   * @param array $aData : the input filters
   * @return array true if the update succeeded
   */
  public function updateByScenario($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $bResult = false;  
    // Check whether the current user has access to the scenario
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    if($oScenarioCtrl->hasAccess($aData["scenarioMainId"])){   
      $aScenario = $oScenarioCtrl->get($aData["scenarioMainId"]);
      // Compute the list of calendars and timeslot ids, and the filters to retrieve the list of existing transport_calendar items
      $aCalendars = array();
      $aExistingTransportCalendarFilters = array();
      if(!isset($aData["calendarDt"]) && !isset($aData["timeSlotId"])){
        // If no filters are provided, the calendars list will span over the whole scenario time range
        $aCalendars = $this->computeScenarioCalendarDts($aScenario);
        $aExistingTransportCalendarFilters = array("scenarioMainId"=>$aData["scenarioMainId"]);
      }
      else{
        // Make sure the input date is expressed at midnight, server time
        $iCalendarDt = $this->setToMidnight($aData["calendarDt"]);
        // If some filters are provided, the calendars list will be restricted to one calendar date and one timeslot
        $aCalendars = array(array("dt"=>$iCalendarDt,"timeslotIDs"=>array($aData["timeSlotId"])));
        $aExistingTransportCalendarFilters = array(
          "scenarioMainId"=>$aData["scenarioMainId"],
          "startDt"=>$iCalendarDt,
          "endDt"=>$iCalendarDt+86400*1000,
          "timeSlotId"=>$aData["timeSlotId"]
        );        
      }
      // Get the list of all existing transport calendars for the scenario (ignore those marked as removed)
      $aExistingTransportCalendars=$this->list($aExistingTransportCalendarFilters);
      $aAssociativeExistingTransportCalendars = $this->toAssociativeArray($aExistingTransportCalendars);
      // Look for transport_calendar items to update or insert
      $aToInsert=array();
      $aToUpdate=array();
      $aToDelete=array();

      // The list of calendar dates for which we will check the transport_calendar items
      set_time_limit(60);
      foreach($aCalendars as $aCalendar){
        
        // The list of timeslots (only those matching the current calendar date) for which we will check the transport_calendar items
        foreach($aCalendar["timeslotIDs"] as $sTimeSlotId){
          // The list of transport_demand groups for which we will check the transport_calendar items
          foreach($aScenario["groups"] as $aGroup){
            // The list of transport demands for which we will check the transport_calendar items
            foreach($aGroup["data"]["demands"] as $aDemand){
              // If the transport demand matches the current calendar and timeslot, we have to update or insert 
              //   the corresponding transport_calendar items
              $aTimeslot = $this->getDemandTimeslot($aDemand,$sTimeSlotId);
              if(isset($aTimeslot['timeslot_th']) && $this->demandMatchesCalendarDt($aDemand,$aCalendar['dt'])){
                // Retrieve the corresponding trnasport_calendar item
                if(array_key_exists($aCalendar['dt'],$aAssociativeExistingTransportCalendars) &&
                   array_key_exists($sTimeSlotId,$aAssociativeExistingTransportCalendars[$aCalendar['dt']]) &&
                   array_key_exists($aDemand["id"],$aAssociativeExistingTransportCalendars[$aCalendar['dt']][$sTimeSlotId])){
                  $aExistingTransportCalendar = $aAssociativeExistingTransportCalendars[$aCalendar['dt']][$sTimeSlotId][$aDemand["id"]];
                  // Here, we can only update transport_calendar items that were not manually updated
                  if($aExistingTransportCalendar["manually_updated_yn"]!='Y'){
                    $aExistingTransportCalendar["start_hr"]=$aTimeslot["start_hr"];
                    $aExistingTransportCalendar["end_hr"]=$aTimeslot["end_hr"];
                    $aToUpdate[]=$aExistingTransportCalendar;
                  }
                }
                else{
                  $aToInsert[]=array_merge($aTimeslot,array(
                    'date_dt'=>$aCalendar['dt'], 
                    'transport_demand_id'=>$aDemand["id"],
                    'site_poi_id_institution'=>$aDemand["institutionPOI"]["id"],
                    'site_poi_id_hr'=>$aDemand["HRPOI"]["id"],
                    'hr_main_id'=>$aDemand["HRPOI"]["hr_id"]
                  ));                  
                }
              }else{
                $this->log()->info(["method"=>__METHOD__,"message"=>"Demand does not match date and slot","data"=>[$aDemand["id"],$aDemand["HRPOI"]['hr_firstname'],$aCalendar['dt']]]);
              }
            }
          }
        }
      }
      unset($aAssociativeExistingTransportCalendars);
      // Look for existing transport calendars to delete
      set_time_limit(120);
      // TODO : need to be verified / optimised
      foreach($aExistingTransportCalendars as $aExistingTransportCalendar){
        // Here, we can not delete items that were not manually updated
        $bFoundInCalendarsToUpdate = false;
        if($aExistingTransportCalendar['manually_updated_yn']!='Y'){          
          foreach($aToUpdate as $aToUpdateItem){
            if($aToUpdateItem['id']==$aExistingTransportCalendar['id']){
              $bFoundInCalendarsToUpdate = true;
              break;
            }
          }
          foreach($aToInsert as $aToUpdateItem){
            if($aToInsert['id']==$aExistingTransportCalendar['id']){
              $bFoundInCalendarsToUpdate = true;
              break;
            }
          }          
          if(!$bFoundInCalendarsToUpdate){
            $aToDelete[]=$aExistingTransportCalendar;
          }
        }
      }
      set_time_limit(120);
      $this->update($aToUpdate);
      $this->add($aToInsert);
      $this->delete($aToDelete);
      $aScenario = $oScenarioCtrl->setNeedCalendarUpdate($aData["scenarioMainId"],false);

      $bResult = true;
    }
    return $bResult;        
  }

}