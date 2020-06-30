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
 *  REST service to retrieve checks
 *  @creationdate 2020-01-15
 *  @by @willylambert
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class DataCheckerCtrl extends BaseObject{

  /**
  * Get the checks list
  * The input data array is expected to contain the some filters
  * @param array $aData : filtering data []
  * @return array({object}) : array of Demand object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $aDemands = $oDataCheckerDAO->list($aData);
    $this->setResult($aDemands);
    return $aDemands;
  }

  /**
  * Get the checks details (result of run) list
  * The input data array is expected to contain the some filters
  * @param array $aData : filters ["datachecker_main_id","scenario_main_id" ,"transport_demand_id" ,"transport_calendar_id" ,"transport_route_id" ,"vehicle_category_id" ,"site_poi_id" ,"hr_main_id"]
  * @return array({object}) : array of Demand object
  **/
  function listDetails($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $aDemands = $oDataCheckerDAO->listDetails($aData);
    $this->setResult($aDemands);
    return $aDemands;
  }

  /**
  * Read the asked check
  * @param string $sDataCheckerId : Demand Reference
  * @return array with check data.
  **/
  function get($sDataCheckerId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sDataCheckerId]);
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $aCheck = $oDataCheckerDAO->get($sDataCheckerId);
    $this->setResult($aCheck);
    return  $aCheck;
  }

  /**
  * Save a check (creation or update)
  * @param array $aData : data of the check to be saved.
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
  * Add a check
  * @param array $aData : data of the check to be added.
  * @return array : with an id field containing the id of the created check
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $aNewData = $oDataCheckerDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'checker_main');
    }else{
      throw new \OSS\AppException(
        "Demand insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a check
  * @param array $aData : data of the check to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'datachecker_main');
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $bResult = $oDataCheckerDAO->update($aData);
    $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'datachecker_main');
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a check as removed
  * @param string $dataCheckerId : id of the check to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($dataCheckerId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$dataCheckerId]);
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $bResult = $oDataCheckerDAO->markAsRemoved($dataCheckerId);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->afterMarkAsRemoved($dataCheckerId,'datachecker_main');
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a check
  * @param string $sDataCheckerId : id of the check to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($dataCheckerId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$dataCheckerId]);
    // Delete the check itself
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($dataCheckerId,'datachecker_main');
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $bResult = $oDataCheckerDAO->delete($dataCheckerId);
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a check result
  * @param string $sDataCheckerId : id of the check to be deleted.
  * @return boolean : true in case of success
  */
  public function deleteDetail($dataCheckerDetailId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$dataCheckerDetailId]);
    // Delete the check itself
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($dataCheckerDetailId,'datachecker_detail');
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();
    $bResult = $oDataCheckerDAO->deleteDetail($dataCheckerDetailId);
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Run a set of checks on the data
   * The input array contains :
   *  - a datacheckerId field (when ommitted, all available checks will be run)
   *  - a context field (will be passed to the hook, in order to limit the number of checks to be run)
   * @param $aData array : datacheckerId, context:['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
   */
  public function run($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aData)]);
    $oDataCheckerDAO = new \OSS\Model\DataCheckerDAO();

    // Get the list of checks to be peformed.
    // If datacheckerId input field is present, only one check will be performed.
    // Otherwise, all checks will be peformed
    $aChecks= array();
    if(isset($aData["datacheckerId"])){
      $aChecks[] = $oDataCheckerDAO->get($aData["datacheckerId"]);
    }
    else{
      $aChecks = $oDataCheckerDAO->list(array());
    }
    foreach($aChecks as $aCheck){
      // Do not run disabled checks
      if(isset($aCheck["status_code"]) && $aCheck["status_code"]=="ENABLED"){
        $aFailedChecks = $this->callHook(__FUNCTION__,$aCheck["hookname"],isset($aData["context"])?array($aData["context"]):array());

        $this->log()->info(["method"=>__METHOD__,"message"=>"Failed checks for {$aCheck["hookname"]} : " . count($aFailedChecks)]);
        $tplVars = [];
        if($aFailedChecks!==false){
          foreach($aFailedChecks as $aFailedCheck){
    
            // Get Object for each key, to be used in label template
            if(isset($aFailedCheck['scenarioMainId'])){
              $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
              $tplVars["scenario"] = $oScenarioCtrl->get($aFailedCheck['scenarioMainId']);
            }
            if(isset($aFailedCheck['transportDemandId'])){
              $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
              $tplVars["transportDemand"] = $oDemandCtrl->get($aFailedCheck['transportDemandId']);
            }
            if(isset($aFailedCheck['transportCalendarId'])){
              $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
              $tplVars["calendar"] = $oCalendarCtrl->get($aFailedCheck['transportCalendarId']);
            }
            if(isset($aFailedCheck['transportRouteId'])){
              $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
              $tplVars["route"] = $oRouteCtrl->get($aFailedCheck['transportRouteId']);
            }
            if(isset($aFailedCheck['vehicleCategoryId'])){
              $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
              $tplVars["vehicleCategory"] = $oVehicleCategoryCtrl->get($aFailedCheck['vehicleCategoryId']);
            }
            if(isset($aFailedCheck['sitePoiId'])){
              $oPOICtrl = new \OSS\Ctrl\POICtrl();
              $tplVars["sitePoi"] = $oPOICtrl->get($aFailedCheck['sitePoiId']);
            }
            if(isset($aFailedCheck['hrMainId'])){
              $oHRCtrl = new \OSS\Ctrl\HRCtrl();
              $tplVars["hr"] = $oHRCtrl->get($aFailedCheck['hrMainId']);
            }
            if(isset($aFailedCheck['calendarDt'])){
              // In case the check is associated to no transport_route or no transport_calendar but the issue occurs 
              //   on a specific date, we can keep some information about that date
              $tplVars["calendarDt"] = $aFailedCheck['calendarDt'];
            }
            if(isset($aFailedCheck['timeSlotId'])){
              // In case the check is associated to no transport_route or no transport_calendar but the issue occurs 
              //   on a specific timeslot, we can keep some information about that timeslot          
              $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
              $tplVars["timeSlot"] = $oThesaurusCtrl->get($aFailedCheck['timeSlotId']);
            }        
    
            $checkDetail = ["datachecker_main_id" => $aCheck["id"],
                                             "dt" => time(),
                               "scenario_main_id" => (isset($aFailedCheck['scenarioMainId'])?$aFailedCheck['scenarioMainId']:null),
                            "transport_demand_id" => (isset($aFailedCheck['transportDemandId'])?$aFailedCheck['transportDemandId']:null),
                          "transport_calendar_id" => (isset($aFailedCheck['transportCalendarId'])?$aFailedCheck['transportCalendarId']:null),
                             "transport_route_id" => (isset($aFailedCheck['transportRouteId'])?$aFailedCheck['transportRouteId']:null),
                            "vehicle_category_id" => (isset($aFailedCheck['vehicleCategoryId'])?$aFailedCheck['vehicleCategoryId']:null),
                                    "site_poi_id" => (isset($aFailedCheck['sitePoiId'])?$aFailedCheck['sitePoiId']:null),
                                     "hr_main_id" => (isset($aFailedCheck['hrMainId'])?$aFailedCheck['hrMainId']:null),
                                     "calendarDt" => (isset($aFailedCheck['calendarDt'])?$aFailedCheck['calendarDt']:null),
                                     "timeSlotId" => (isset($aFailedCheck['timeSlotId'])?$aFailedCheck['timeSlotId']:null)
                           ];
      
            $loader = new \Twig\Loader\ArrayLoader([
                'checker' => $aCheck['label_tpl'],
            ]);
      
            $twig = new \Twig\Environment($loader);
            $checkDetail['label'] = $twig->render('checker', $tplVars);       
            $this->log()->info(["method"=>__METHOD__,"message"=>$checkDetail['label']]);
            $oDataCheckerDAO->saveDetail($checkDetail);
          }      
        }
      }
    }
    $this->setResult(true);
  }


}