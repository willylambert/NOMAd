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
 *  REST service to retrieve demands
 *  @creationdate 2018-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class DemandCtrl extends BaseObject{

  /**
  * Get the demands list
  * The input data array is expected to contain the some filters
  * @param array $aData : filtering data ["hrMainId"=>'id of hr', "bOnlyActiveHRs" => boolean]
  * @return array({object}) : array of Demand object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $aDemands = $oDemandDAO->list($aData);
    $this->setResult($aDemands);
    return $aDemands;
  }

  /**
  * Read the asked demand
  * @param string $sDemandId : Demand Reference
  * @param boolean $bWithDetails : true to get related calendars
  * @return array with demand data.
  **/
  function get($sDemandId,$bWithDetails=true){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sDemandId]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $aDemand = $oDemandDAO->get($sDemandId);
    // if the home_to_institution_duration and insitution_to_home_duration fields are not set, compute them
    $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
    $oPOICtrl = new \OSS\Ctrl\POICtrl();
    if(!isset($aDemand['HRPOI']["home_to_institution_duration"])){
      // Create some coordinates in lon,lat;lon,lat format
      $sCoordinates = $aDemand['HRPOI']['geom']['coordinates'][0].','.$aDemand['HRPOI']['geom']['coordinates'][1].';';
      $sCoordinates.= $aDemand['institutionPOI']['geom']['coordinates'][0].','.$aDemand['institutionPOI']['geom']['coordinates'][1];
      $aRoutingResult = $oRoutingCtrl->directions($sCoordinates,array());
      if(isset($aRoutingResult['routes']) && count($aRoutingResult['routes'])>0 && isset($aRoutingResult['routes'][0]['duration'])){
        $aDemand['HRPOI']["home_to_institution_duration"] = $aRoutingResult['routes']['0']['duration']*1000;
        $oPOICtrl->saveSitePOISitePOI(array(
          'site_poi_id_start'=>$aDemand['HRPOI']['id'],
          'site_poi_id_end'=>$aDemand['institutionPOI']['id'],
          'duration'=>$aRoutingResult['routes']['0']['duration']*1000
        ));
      }
    }
    if(!isset($aDemand['HRPOI']["institution_to_home_duration"])){  
      // Create some coordinates in lon,lat;lon,lat format
      $sCoordinates = $aDemand['institutionPOI']['geom']['coordinates'][0].','.$aDemand['institutionPOI']['geom']['coordinates'][1].';';
      $sCoordinates.= $aDemand['HRPOI']['geom']['coordinates'][0].','.$aDemand['HRPOI']['geom']['coordinates'][1];
      $aRoutingResult = $oRoutingCtrl->directions($sCoordinates,array());
      if(isset($aRoutingResult['routes']) && count($aRoutingResult['routes'])>0 && isset($aRoutingResult['routes'][0]['duration'])){
        $aDemand['HRPOI']["institution_to_home_duration"] = $aRoutingResult['routes']['0']['duration']*1000;
        $oPOICtrl->saveSitePOISitePOI(array(
          'site_poi_id_end'=>$aDemand['HRPOI']['id'],
          'site_poi_id_start'=>$aDemand['institutionPOI']['id'],
          'duration'=>$aRoutingResult['routes']['0']['duration']*1000
        ));
      }
    }
    // Assuming all morning (respectively afternoon) timeslots for the same demand use the same start_hr/end_hr,
    //  we can set the pickup (respectively delivery) start/end hours for the whole transport demand.
    $aDemand['bPickupTimeWindow'] = false;
    $aDemand['bDeliveryTimeWindow'] = false;
    foreach($aDemand["timeslots"] as $aTimeslot){
      $sTimeslotCodeEnd = substr($aTimeslot["code"],strlen($aTimeslot["code"])-2,2);
      if($sTimeslotCodeEnd == 'AM'){
        $aDemand['pickupStartHour']=$aTimeslot['start_hr'];
        $aDemand['pickupEndHour']=$aTimeslot['end_hr'];
        $aDemand['bPickupTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
      }else{
        $aDemand['deliveryStartHour']=$aTimeslot['start_hr'];
        $aDemand['deliveryEndHour']=$aTimeslot['end_hr'];
        $aDemand['bDeliveryTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
      }
    }
    if($bWithDetails){
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aDemand['calendars'] = $oCalendarCtrl->list(array("transportDemandId"=>$sDemandId));
    }
    $this->setResult($aDemand);
    return $aDemand;
  }

  /**
   * List Transport demands with the information that is required to create routes
   * @param $aData array : filters for the search of transport demands
   * @return array : list of transport demands with the information that is required to create routes
   */
  function listForRoutes($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $aDemands = $oDemandDAO->listForRoutes($aData);
    // For all timeslots in the morning (respectively afternoon), the start_hr and end_hr are supposed to be the same
    foreach($aDemands as &$aDemand){
      foreach($aDemand['timeslots'] as &$aTimeslot){
        $sTimeslotCodeEnd = substr($aTimeslot["code"],strlen($aTimeslot["code"])-2,2);
        if($sTimeslotCodeEnd == 'AM'){
          $aDemand['pickupStartHour']=$aTimeslot['start_hr'];
          $aDemand['pickupEndHour']=$aTimeslot['end_hr'];
        }else{
          $aDemand['deliveryStartHour']=$aTimeslot['start_hr'];
          $aDemand['deliveryEndHour']=$aTimeslot['end_hr'];
        }
      }
    }
    unset($aDemand["timeslots"]);
    $this->setResult($aDemands);
    return $aDemands;
  }

  /**
  * Save a demand (creation or update)
  * @param array $aData : data of the demand to be saved.
  * @return array : with an id field (empty array in case of failure)
  */
  public function save($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=array();
    if(isset($aData['id'])){
      if($this->update($aData)){
        $aResult['id']=$aData['id'];
      }
    }
    else{
      $aResult = $this->add($aData);
    }
    $this->setResult($aResult);
    return $aResult;
  }

  /**
  * Add a demand
  * @param array $aData : data of the demand to be added.
  * @return array : with an id field containing the id of the created demand
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewData = array();
    $oPOICtrl = new \OSS\Ctrl\POICtrl();
    $oHRCtrl = new \OSS\Ctrl\HRCtrl();
    if($oPOICtrl->hasAccess($aData['institutionPOI']['id']) &&
       $oPOICtrl->hasAccess($aData['HRPOI']['id']) &&
       $oHRCtrl->hasAccess($aData['HRPOI']['hr_id'])){
      $aData['rec_st']='C';
      $oDemandDAO = new \OSS\Model\DemandDAO();
      $aNewData = $oDemandDAO->add($aData);
    }
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'transport_demand');
      // Handle the insertion for the new timeslots
      if(isset($aData['timeslots'])){
        foreach($aData['timeslots'] as &$aTimeslot){
          $aTimeslot['transport_demand_id']=$aNewData['id'];
          if($aTimeslot['bMorning']){
            $aTimeslot['start_hr'] = $aData['bPickupTimeWindow'] && isset($aData['pickupStartHour'])?$aData['pickupStartHour']:null;
            $aTimeslot['end_hr'] = $aData['bPickupTimeWindow'] && isset($aData['pickupEndHour'])?$aData['pickupEndHour']:null;
          }
          else{
            $aTimeslot['start_hr'] = $aData['bDeliveryTimeWindow'] && isset($aData['deliveryStartHour'])?$aData['deliveryStartHour']:null;
            $aTimeslot['end_hr'] = $aData['bDeliveryTimeWindow'] && isset($aData['deliveryEndHour'])?$aData['deliveryEndHour']:null;
          }
          $this->addTimeslot($aTimeslot);
        }
      }
    }
    else{
      throw new \OSS\AppException(
        "Demand insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a demand
  * @param array $aData : data of the demand to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'transport_demand');
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $bResult = $oDemandDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'transport_demand');
      // Handle the update for the list of existing timeslots
      if(isset($aData['timeslots'])){
        $aTimeSlots = array();
        foreach($aData['timeslots'] as &$aTimeslot){
          $aTimeslot['transport_demand_id']=$aData['id'];
          if($aTimeslot['bMorning']){
            $aTimeslot['start_hr'] = $aData['bPickupTimeWindow'] && isset($aData['pickupStartHour'])?$aData['pickupStartHour']:null;
            $aTimeslot['end_hr'] = $aData['bPickupTimeWindow'] && isset($aData['pickupEndHour'])?$aData['pickupEndHour']:null;
          }
          else{
            $aTimeslot['start_hr'] = $aData['bDeliveryTimeWindow'] && isset($aData['deliveryStartHour'])?$aData['deliveryStartHour']:null;
            $aTimeslot['end_hr'] = $aData['bDeliveryTimeWindow'] && isset($aData['deliveryEndHour'])?$aData['deliveryEndHour']:null;
          }
        }
        $bResult = $this->updateTimeslots($aData['timeslots'],$aData['id']);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a demand as removed
  * @param string $sDemandID : id of the demand to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sDemandID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sDemandID]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $bResult = $oDemandDAO->markAsRemoved($sDemandID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sDemandID,'transport_demand');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a demand
  * @param string $sDemandID : id of the demand to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sDemandID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sDemandID]);
    $bResult = false;
    if($this->isAdmin()){    
      // Delete timeslots associated to the demand
      $aTimeslotsToDelete = $this->listTimeslots(array("demandId"=>$sDemandID));
      foreach($aTimeslotsToDelete as $aTimeslotToDelete){
        $this->deleteTimeslot($aTimeslotToDelete['id']);
      }
      // Delete the demand itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sDemandID,'transport_demand');
      $oDemandDAO = new \OSS\Model\DemandDAO();
      $bResult = $oDemandDAO->delete($sDemandID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Get a list of timeslots based on search criteria
  * The input data array is expected to contain some filters
  * @param array $aData : filtering data
  * @return array({object}) : array of timeslots
  **/
  public function listTimeslots($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $aTimeslots = $oDemandDAO->listTimeslots($aData);
    $this->setResult($aTimeslots);
    return $aTimeslots;
  }

  /**
  * Add a timeslot
  * @param array $aData : data of the timeslot to be added.
  * @return array : new timeslot with id field
  */
  public function addTimeslot($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $aNewTimeslot = $oDemandDAO->addTimeslot($aData);
    if(isset($aNewTimeslot['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewTimeslot['id'],'transport_demandtime');
    }
    else{
      throw new \OSS\AppException(
        "Timeslot insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewTimeslot);
    return $aNewTimeslot;
  }

  /**
   * Update all the timeslots over a demand
   * @param array $aTimeslots : the updated Timeslots
   * @param string $sDemandID : the concerned demand id
   * @return boolean : true if the update succeeded
   */
  public function updateTimeslots($aTimeslots,$sDemandID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aTimeslots]);

    $oDemandDAO = new \OSS\Model\DemandDAO();

    $bResult = true;
    // Get the list of existing timeslots for the current demand, for comparison
    $aOldTimeslots = $this->listTimeslots(array('demandId'=>$sDemandID));
    foreach($aOldTimeslots as $aOldTimeslot){
      $bOldTimeslotFound = false;
      foreach($aTimeslots as $aTimeslot){
        if(isset($aTimeslot['id']) && $aTimeslot['id'] == $aOldTimeslot['id']){
          // Handle an updated Timeslot
          $bResult = $this->updateTimeslot($aTimeslot);
          $bOldTimeslotFound = true;
          break;
        }
      }
      if(!$bOldTimeslotFound){
        // Handle a deleted Timeslot
        $bResult = $oDemandDAO->deleteTimeslot($aOldTimeslot['id'],$sDemandID);
      }
    }
    // Now handle new Timeslots insertion
    foreach($aTimeslots as $aTimeslot){
      if(!isset($aTimeslot['id'])){
        $this->addTimeslot($aTimeslot);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Update a timeslot
  * @param array $aData : data of the timeslot to be updated.
  * @return boolean : true in case of success
  */
  public function updateTimeslot($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'transport_demandtime');
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $bResult = $oDemandDAO->updateTimeslot($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'transport_demandtime');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a timeslot as removed
  * @param string $sTimeslotID : id of the timeslot to be removed.
  * @param string $sDemandID : the corresponding transport demand, for access right checks
  * @return boolean : true in case of success
  */
  public function markTimeslotAsRemoved($sTimeslotID,$sDemandID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sTimeslotID]);
    $oDemandDAO = new \OSS\Model\DemandDAO();
    $bResult = $oDemandDAO->markTimeslotAsRemoved($sTimeslotID,$sDemandID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sTimeslotID,'transport_demandtime');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a timeslot.
  * @param string $sTimeslotID : id of the timeslot to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteTimeslot($sTimeslotID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sTimeslotID]);
    $bResult = false;
    if($this->isAdmin()){    
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sTimeslotID,'transport_demandtime');
      $oDemandDAO = new \OSS\Model\DemandDAO();
      $bResult = $oDemandDAO->deleteTimeslot($sTimeslotID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

}