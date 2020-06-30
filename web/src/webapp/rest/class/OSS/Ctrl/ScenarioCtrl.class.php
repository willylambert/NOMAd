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
 *  REST service to retrieve scenario
 *  @creationdate 2019-15-01
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class ScenarioCtrl extends BaseObject{

  /**
  * Get the scenarios lists
  * The input data array is expected to contain the following fields : ...
  * @param array $aData : filtering data
  * @return array({object}) : array of Scenario object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    return $this->listWithRestrictions($oScenarioDAO,"list",$aData);
  }

  /**
  * Read the asked scenario
  * @param string $sScenarioMainId : Scenario Reference
  * @param boolean $bWithDetails : whether to include details in the response (default true)
  * @return array with scenario data.
  **/
  function get($sScenarioMainId,$bWithDetails=true){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sScenarioMainId]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aScenario = $this->getWithRestrictions($oScenarioDAO,"get",$sScenarioMainId);
    if(isset($aScenario['id']) && $bWithDetails){
      $aScenario['groups']=$this->listScenarioTransportGroups(array("scenarioMainId"=>$sScenarioMainId),true);
      $aScenario['fleet']=$this->listScenarioVehicleCategories(array("scenarioMainId"=>$sScenarioMainId),true);
    }    
    return $aScenario;
  }

  /**
  * Save a scenario (creation or update)
  * @param array $aData : data of the scenario to be saved.
  * @return array : with an id field (empty array in case of failure)
  */
  public function save($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=array();
    if(!isset($aData['start_dt'])){
      // If not set, set the start_dt one week ago
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aData['start_dt']=$oCalendarCtrl->setToMidnight((time()-10*3600)*1000);
    }
    if(!isset($aData['end_dt'])){
      // If not set, set the end_dt one year minus one week in the future
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $aData['end_dt']=$oCalendarCtrl->setToMidnight((time()+355*3600)*1000);
    }
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
  * Add a scenario
  * @param array $aData : data of the scenario to be added.
  * @return array : with an id field containing the id of the created scenario
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aNewData = $oScenarioDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'scenario_main');
      // Handle the insertion for the new groups of transport demands
      // Data received from
      if(isset($aData['groups'])){
        foreach($aData['groups'] as $aScenarioTransportGroup){
          $aScenarioTransportGroup['scenario_main_id']=$aNewData['id'];
          $aScenarioTransportGroup['transport_group_id']=$aScenarioTransportGroup['data']['id'];
          $this->addScenarioTransportGroup($aScenarioTransportGroup);
        }
      }
      // Handle the insertion for the new vehicle categories
      if(isset($aData['fleet'])){
        foreach($aData['fleet'] as $aScenarioVehicleCategory){
          $aScenarioVehicleCategory['scenario_main_id']=$aNewData['id'];
          $aScenarioVehicleCategory['vehicle_category_id']=$aScenarioVehicleCategory['data']['id'];
          $this->addScenarioVehicleCategory($aScenarioVehicleCategory);
        }
      }
    }
    else{
      throw new \OSS\AppException(
        "Scenario insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a scenario
  * @param array $aData : data of the scenario to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $bResult = false;
    if($this->hasAccess($aData['id'])){
      $aData['rec_st']='U';
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'scenario_main');
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      $bResult = $oScenarioDAO->update($aData);  
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'scenario_main');
      // Handle the update for the list of exisiting groups
      if(isset($aData['groups'])){
        foreach($aData['groups'] as &$aScenarioTransportGroup){
          $aScenarioTransportGroup['scenario_main_id']=$aData['id'];
          $aScenarioTransportGroup['transport_group_id']=$aScenarioTransportGroup['data']['id'];
        }
        $bResult &= $this->updateScenarioTransportGroupsByScenario($aData['groups'],$aData['id']);
      }
      // Handle the update for the list of exisiting vehicle categories
      if(isset($aData['fleet'])){
        foreach($aData['fleet'] as &$aScenarioVehicleCategory){
          $aScenarioVehicleCategory['scenario_main_id']=$aData['id'];
          $aScenarioVehicleCategory['vehicle_category_id']=$aScenarioVehicleCategory['data']['id'];
        }
        $bResult &= $this->updateScenarioVehicleCategoriesByScenario($aData['fleet'],$aData['id']);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a scenario as removed
  * @param string $sScenarioMainId : id of the scenario to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sScenarioMainId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioMainId]);
    $bResult = false;
    if($this->hasAccess($sScenarioMainId)){
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      $bResult = $oScenarioDAO->markAsRemoved($sScenarioMainId);
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sScenarioMainId,'scenario_main');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a scenario
  * @param string $sScenarioMainId : id of the scenario to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sScenarioMainId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioMainId]);
    $bResult = false;
    if($this->isAdmin()){       
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      // Find the routes associated to the scenario and delete them one by one
      $aRoutes = $oScenarioDAO->listRoutes($sScenarioMainId);
      $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
      foreach($aRoutes as $aRoute){
        $oRouteCtrl->delete($aRoute['id']);
      }
      // Delete the groups associated to the scenario
      $aScenarioTransportGroupsToDelete = $this->listScenarioTransportGroups(array("scenarioMainId"=>$sScenarioMainId));
      foreach($aScenarioTransportGroupsToDelete as $aScenarioTransportGroupToDelete){
        $this->deleteScenarioTransportGroup($aScenarioTransportGroupToDelete['id']);
      }
      // Delete the vehicle categories associated to the scenario
      $aScenarioVehicleCategoriesToDelete = $this->listScenarioVehicleCategories(array("scenarioMainId"=>$sScenarioMainId));
      foreach($aScenarioVehicleCategoriesToDelete as $aScenarioVehicleCategoryToDelete){
        $this->deleteScenarioVehicleCategory($aScenarioVehicleCategoryToDelete['id']);
      }
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sScenarioMainId,'scenario_main');
      $bResult = $oScenarioDAO->delete($sScenarioMainId);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Copy a scenario into another scenario.
   * This function will create a new scenario with the data provided in $aData['newScenario'] and then
   *   copy the routes from $aData['scenarioMainId'] scenario into the newly created scenario
   * @param array $aData : contains scenarioMainId string field and newScenario object field
   * @return array : the new scenario
   */
  public function duplicate($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewScenario = array();
    if($this->hasAccess($aData['scenarioMainId'])){
      // Creation of the new scenario
      if(!isset($aData['start_dt'])){
        // If not set, set the start_dt one week ago
        $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
        $aData['start_dt']=$oCalendarCtrl->setToMidnight((time()-10*3600)*1000);
      }
      if(!isset($aData['end_dt'])){
        // If not set, set the end_dt one year minus one week in the future
        $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
        $aData['end_dt']=$oCalendarCtrl->setToMidnight((time()+355*3600)*1000);
      }
      $aNewScenario = $this->add($aData['newScenario']);
      // Duplication of the routes that belong to the transport scenario
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      // Listing of the routes to be duplicated. We have to duplicate route one by one because
      //   for each duplicated route, we need retrieve the new id. The new route ids are mandatory for the
      //   duplication of the route POIs
      $aRoutes = $oScenarioDAO->listRoutes($aData['scenarioMainId']);
      // For each route, duplicate the route, get the new route id and then duplicate the route POIs
      $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
      foreach($aRoutes as $aRoute){
        $aNewRoute = $oRouteCtrl->copy(array("routeId"=>$aRoute['id'],"newScenarioMainId"=>$aNewScenario['id']));
      }
      // Listing of the scenario transport groups to be duplicated.
      $aScenarioTransportGroups = $this->listScenarioTransportGroups(array('scenarioMainId'=>$aData['scenarioMainId']));
      foreach($aScenarioTransportGroups as $aScenarioTransportGroup){
        $aNewScenarioTransportGroup = $this->duplicateScenarioTransportGroups(array(
          "scenarioTransportGroupId"=>$aScenarioTransportGroup['id'],
          "newScenarioMainId"=>$aNewScenario['id']
        ));
      }
      // Listing of the scenario vehicle categories to be duplicated.
      $aScenarioVehicleCategories = $this->listScenarioVehicleCategories(array('scenarioMainId'=>$aData['scenarioMainId']));
      foreach($aScenarioVehicleCategories as $aScenarioVehicleCategory){
        $aNewScenarioVehicleCategory = $this->duplicateScenarioVehicleCategories(array(
          "scenarioVehicleCategoryId"=>$aScenarioVehicleCategory['id'],
          "newScenarioMainId"=>$aNewScenario['id']
        ));
      }
    }
    $this->setResult($aNewScenario);
    return $aNewScenario;
  }

  /**
   * Get a minimap of the scenario.
   * This minimap will tell whether there are routes associated to the scenario according to the following criteria
   *  - routes with or without demands
   *  - the institution POIs involved in the routes
   *  - the considered timeslots
   * The output structure is the following :
   * {
   *   withDemands: [ id,label (site), weekDays: [ id,label,code (week day), AM::boolean, PM::boolean ]],
   *   withoutDemands: [ id,label (site), weekDays: [ id,label,code (week day), AM::boolean, PM::boolean ]]
   * }
   * @param string $sScenarioMainId : the considered scenario
   * @return array : a structure that tell about the route presence according to search criteria
   */
  public function getMinimap($sScenarioMainId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sScenarioMainId]);
    $aMinimap = array();    
    if($this->hasAccess($sScenarioMainId)){    
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      $aRoutes = $oScenarioDAO->listRoutes($sScenarioMainId,true);
      // Aggregate information in an associative structure
      $aMinimapAssociative = array("withDemands"=>array(),"withoutDemands"=>array());
      foreach($aRoutes as $aRoute){
        // Get the day code and the half day code based on the timeslot code
        $sTimeSlotDayCode = substr($aRoute['timeslot_code'],0,strlen($aRoute['timeslot_code'])-3);
        $sTimeslotHalfDayCode = substr($aRoute['timeslot_code'],strlen($aRoute['timeslot_code'])-2,2);
        $sWithDemands = ($aRoute["with_demand"]) ? "withDemands" : "withoutDemands";
        foreach($aRoute["sites"] as $aSite){
          if(!array_key_exists($aSite['id'],$aMinimapAssociative[$sWithDemands])){
            $aMinimapAssociative[$sWithDemands][$aSite['id']]=array(
              "label"=>$aSite['label'],
              "id"=>$aSite['id'],
              "weekDays"=>array(
                // TODO : I think we should get these values from thesaurus
                "MONDAY"=>array("id"=>0,"label"=>'Lundi',"code"=>'MONDAY',"AM"=>false,"PM"=>false),
                "TUESDAY"=>array("id"=>1,"label"=>'Mardi',"code"=>'TUESDAY',"AM"=>false,"PM"=>false),
                "WEDNESDAY"=>array("id"=>2,"label"=>'Mercredi',"code"=>'WEDNESDAY',"AM"=>false,"PM"=>false),
                "THURSDAY"=>array("id"=>3,"label"=>'Jeudi',"code"=>'THURSDAY',"AM"=>false,"PM"=>false),
                "FRIDAY"=>array("id"=>4,"label"=>'Vendredi',"code"=>'FRIDAY',"AM"=>false,"PM"=>false)
              )
            );
          }
          $aMinimapAssociative[$sWithDemands][$aSite['id']]["weekDays"][$sTimeSlotDayCode][$sTimeslotHalfDayCode]=true;
        }
      }
      // Transfer information into a non-associative structure
      foreach(["withDemands","withoutDemands"] as $sWithDemand){
        $aMinimap[$sWithDemand]=array();
        foreach($aMinimapAssociative[$sWithDemand] as $aSiteAssociative){
          $aWeekDays = array();
          foreach($aSiteAssociative["weekDays"] as $aWeekDay){
            $aWeekDays[]=$aWeekDay;
          }
          $aMinimap[$sWithDemand][]=array("id"=>$aSiteAssociative['id'],"label"=>$aSiteAssociative['label'],"weekDays"=>$aWeekDays);
        }
      }
    }
    $this->setResult($aMinimap);
    return $aMinimap;
  }


  // ----------------- SCENARIO_TRANSPORTGROUP HANDLING ------------------------------

  /**
  * Get a list of scenario_transportgroup items (link between a scenario and a transport group) based on search criteria
  * The input data array is expected to contain the following fields : scenarioMainId
  * If some details are requested, more fields will be added to the output
  *   data : (array) data about the transport group
  * When no details are requested, all items are returned, even those marked as deleted
  * @param array $aData : filtering data ["scenarioMainId"=> <SCENARIO ID> ]
  * @param boolean $bWithDetails : if set to true, more details are returned (default value is false)
  * @return array({object}) : array of scenario_transportgroup object
  **/
  public function listScenarioTransportGroups($aData,$bWithDetails=false){
    $this->log()->debug(["method"=>__METHOD__,"data"=>array($aData,$bWithDetails)]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aData['bWithDetails']=$bWithDetails;
    return $this->listWithRestrictions($oScenarioDAO,"listScenarioTransportGroups",$aData);
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
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aData)]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aNewScenarioTransportGroup = $oScenarioDAO->duplicateScenarioTransportGroups($aData);
    if(isset($aNewScenarioTransportGroup['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewScenarioTransportGroup['id'],'scenario_transportgroup');
    }
    else{
      throw new \OSS\AppException(
        "Transport demand group insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewScenarioTransportGroup);
    return $aNewScenarioTransportGroup;
  }

  /**
  * Add a new scenario_transportgroup item (add a new link between a scenario and a transport group)
  * @param array $aData : data of the scenario_transportgroup item to be added.
  * @return array : new scenario_transportgroup item with id field
  */
  public function addScenarioTransportGroup($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewScenarioTransportGroup = array();
    $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
    if($oGroupCtrl->hasAccess($aData['transport_group_id'])){
      $aData['rec_st']='C';
      $oScenarioDAO = new \OSS\Model\ScenarioDAO();
      $aNewScenarioTransportGroup = $oScenarioDAO->addScenarioTransportGroup($aData);
    }
    if(isset($aNewScenarioTransportGroup['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewScenarioTransportGroup['id'],'scenario_transportgroup');
    }
    else{
      throw new \OSS\AppException(
        "Transport demand group insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewScenarioTransportGroup);
    return $aNewScenarioTransportGroup;
  }

  /**
  * Update an existing scenario_transportgroup item (update a link between a scenario and a transport group)
  * @param array $aData : data of the scenario_transportgroup item to be updated.
  * @return boolean : true in case of success
  */
  public function updateScenarioTransportGroup($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'scenario_transportgroup');
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->updateScenarioTransportGroup($aData);
    $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'scenario_transportgroup');
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Update all the scenario_transportgroup items over a scenario (update all links between the scenario and a transport group)
   * @param array $aScenarioTransportGroups : the updated scenario_transportgroup items
   * @param string $sScenarioMainId : the concerned scenario id
   * @return boolean : true if the update succeeded
   */
  public function updateScenarioTransportGroupsByScenario($aScenarioTransportGroups,$sScenarioMainId){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aScenarioTransportGroups,$sScenarioMainId)]);
    $bResult = true;
    // Get the list of existing groups for the current scenario, for comparison
    $aOldScenarioTransportGroups = $this->listScenarioTransportGroups(array('scenarioMainId'=>$sScenarioMainId));
    foreach($aOldScenarioTransportGroups as $aOldScenarioTransportGroup){
      $bOldScenarioTransportGroupFound = false;
      foreach($aScenarioTransportGroups as $aScenarioTransportGroup){
        // In order to keep unicity constraint on scenario_transportgroup table, we have to compare the transport_group_id
        //   field and not the id field
        if(isset($aScenarioTransportGroup['transport_group_id']) &&
           $aScenarioTransportGroup['transport_group_id'] == $aOldScenarioTransportGroup['transport_group_id']){
          // Handle an updated scenario_transportgroup item
          // In case the id is not set, reuse the same as in the old scenario_transportgroup item
          if(!isset($aScenarioTransportGroup['id']) || $aScenarioTransportGroup['id'] == null || $aScenarioTransportGroup['id'] ==''){
            $aScenarioTransportGroup['id']=$aOldScenarioTransportGroup['id'];
          }
          $bResult &= $this->updateScenarioTransportGroup($aScenarioTransportGroup);
          $bOldScenarioTransportGroupFound = true;
          break;
        }
      }
      if(!$bOldScenarioTransportGroupFound){
        // Handle a deleted item from scenario_transportgroup
        $bResult &= $this->markScenarioTransportGroupAsRemoved($aOldScenarioTransportGroup['id']);
      }
    }
    // Now handle new scenario_transportgroup item insertion : we add only the links between the scenario and transport
    //  groups that can not be found in the old links list
    foreach($aScenarioTransportGroups as $aScenarioTransportGroup){
      $bNewScenarioTransportGroupFound = false;
      foreach($aOldScenarioTransportGroups as $aOldScenarioTransportGroup){
        // In order to keep unicity constraint on scenario_transportgroup table, we have to compare the transport_group_id
        //   field and not the id field
        if(isset($aScenarioTransportGroup['transport_group_id']) && $aScenarioTransportGroup['transport_group_id'] == $aOldScenarioTransportGroup['transport_group_id']){
          $bNewScenarioTransportGroupFound = true;
          break;
        }
      }
      if(!$bNewScenarioTransportGroupFound){
        $this->addScenarioTransportGroup($aScenarioTransportGroup);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a scenario_transportgroup item as removed (mark the link between a scenario and a transport group as removed)
  * @param string $sScenarioTransportGroupID : id of the scenario_transportgroup item to be removed.
  * @return boolean : true in case of success
  */
  public function markScenarioTransportGroupAsRemoved($sScenarioTransportGroupID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioTransportGroupID]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->markScenarioTransportGroupAsRemoved($sScenarioTransportGroupID);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->afterMarkAsRemoved($sScenarioTransportGroupID,'scenario_transportgroup');
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a scenario_transportgroup item (delete the link between a scenario and a transport group)
  * @param string $sScenarioTransportGroupID : id of the group to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteScenarioTransportGroup($sScenarioTransportGroupID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioTransportGroupID]);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sScenarioTransportGroupID,'scenario_transportgroup');
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->deleteScenarioTransportGroup($sScenarioTransportGroupID);
    $this->setResult($bResult);
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
  * @param boolean $bWithDetails : if set to true, more details are returned (default value is false)
  * @return array({object}) : array of scenario_vehiclecategory object
  **/
  public function listScenarioVehicleCategories($aData,$bWithDetails=false){
    $this->log()->debug(["method"=>__METHOD__,"data"=>array($aData,$bWithDetails)]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aScenarioVehicleCategories = $oScenarioDAO->listScenarioVehicleCategories($aData,$bWithDetails);
    $this->setResult($aScenarioVehicleCategories);
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
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aData)]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aNewScenarioVehicleCategory = $oScenarioDAO->duplicateScenarioVehicleCategories($aData);
    if(isset($aNewScenarioVehicleCategory['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewScenarioVehicleCategory['id'],'scenario_vehiclecategory');
    }
    else{
      throw new \OSS\AppException(
        "Scenario Vehicle category insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewScenarioVehicleCategory);
    return $aNewScenarioVehicleCategory;
  }

  /**
  * Add a new item in scenario_vehiclecategory table (add a new vehicle category to a scenario)
  * @param array $aData : data of the scenario_vehiclecategory item to be added.
  * @return array : new scenario_vehiclecategory object with id field
  */
  public function addScenarioVehicleCategory($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aNewScenarioVehicleCategory = $oScenarioDAO->addScenarioVehicleCategory($aData);
    if(isset($aNewScenarioVehicleCategory['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewScenarioVehicleCategory['id'],'scenario_vehiclecategory');
    }
    else{
      throw new \OSS\AppException(
        "Scenario vehicle category insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewScenarioVehicleCategory);
    return $aNewScenarioVehicleCategory;
  }

  /**
  * Update an existing item from scenario_vehiclecategory table (update a link between a vehicle category and a scenario)
  * @param array $aData : data of the scenario_vehiclecategory item to be updated.
  * @return boolean : true in case of success
  */
  public function updateScenarioVehicleCategory($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'scenario_vehiclecategory');

    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->updateScenarioVehicleCategory($aData);

    // Update quantity defined on each depot
    foreach($aData["data"]["vehicle_category_site_quantity"] as $siteQuantity){
      if(isset($siteQuantity["site_main_id"])){
        if(isset($siteQuantity["id"])){
          $oScenarioDAO->updateVehicleQuantityToDepot($siteQuantity["id"],$siteQuantity["quantity"],$siteQuantity["unlimited"]);
        }else{
          $oScenarioDAO->addVehicleQuantityToDepot($siteQuantity["site_main_id"],$aData['id'],$siteQuantity["quantity"],$siteQuantity["unlimited"]);
        }
      }
    }

    $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'scenario_vehiclecategory');


    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Update all the scenario_vehiclecategory items over a scenario (all the links between the scenario and a vehicle category)
   * @param array $aScenarioVehicleCategories : the updated scenario_vehiclecategory items
   * @param string $sScenarioMainId : the concerned scenario id
   * @return boolean : true if the update succeeded
   */
  public function updateScenarioVehicleCategoriesByScenario($aScenarioVehicleCategories,$sScenarioMainId){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aScenarioVehicleCategories,$sScenarioMainId)]);
    $bResult = true;
    // Get the list of existing scenario_vehiclecategory items for the current scenario, for comparison
    $aOldScenarioVehicleCategories = $this->listScenarioVehicleCategories(array('scenarioMainId'=>$sScenarioMainId));
    foreach($aOldScenarioVehicleCategories as $aOldScenarioVehicleCategory){
      $bOldScenarioVehicleCategoryFound = false;
      foreach($aScenarioVehicleCategories as $aScenarioVehicleCategory){
        // In order to keep unicity constraint on scenario_vehiclecategory table, we have to compare the vehicle_category_id
        //   field and not the id field
        if(isset($aScenarioVehicleCategory['vehicle_category_id']) &&
           $aScenarioVehicleCategory['vehicle_category_id'] == $aOldScenarioVehicleCategory['vehicle_category_id']){
          // Handle an updated scenario_vehiclecategory item
          // In case the id is not set, reuse the same as in the old scenario_vehiclecategory
          if(!isset($aScenarioVehicleCategory['id']) || $aScenarioVehicleCategory['id'] == null || $aScenarioVehicleCategory['id'] ==''){
            $aScenarioVehicleCategory['id']=$aOldScenarioVehicleCategory['id'];
          }
          $bResult &= $this->updateScenarioVehicleCategory($aScenarioVehicleCategory);
          $bOldScenarioVehicleCategoryFound = true;
          break;
        }
      }
      if(!$bOldScenarioVehicleCategoryFound){
        // Handle a deleted scenario_vehiclecategory item
        $bResult &= $this->markScenarioVehicleCategoryAsRemoved($aOldScenarioVehicleCategory['id']);
      }
    }
    // Now handle new scenario_vehiclecategory item insertion : we add only the links between the scenario and vehicle
    //  categories that can not be found in the old links list
    foreach($aScenarioVehicleCategories as $aScenarioVehicleCategory){
      $bNewScenarioVehicleCategoryFound = false;
      foreach($aOldScenarioVehicleCategories as $aOldScenarioVehicleCategory){
        // In order to keep unicity constraint on scenario_vehiclecategory table, we have to compare the vehicle_category_id
        //   field and not the id field
        if(isset($aScenarioVehicleCategory['vehicle_category_id']) &&
           $aScenarioVehicleCategory['vehicle_category_id'] == $aOldScenarioVehicleCategory['vehicle_category_id']){
          $bNewScenarioVehicleCategoryFound = true;
          break;
        }
      }
      if(!$bNewScenarioVehicleCategoryFound){
        $this->addScenarioVehicleCategory($aScenarioVehicleCategory);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a scenario_vehiclecategory item as removed (mark the link between a scenario and a vehicle category as removed)
  * @param string $sScenarioVehicleCategoryID : id of the scenario_vehiclecategory item to be removed.
  * @return boolean : true in case of success
  */
  public function markScenarioVehicleCategoryAsRemoved($sScenarioVehicleCategoryID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioVehicleCategoryID]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->markScenarioVehicleCategoryAsRemoved($sScenarioVehicleCategoryID);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->afterMarkAsRemoved($sScenarioVehicleCategoryID,'scenario_vehiclecategory');
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a scenario_vehiclecategory item (delete link between a scenario and a vehicle category)
  * @param string $sScenarioVehicleCategoryID : id of the scenario_vehiclecategory item to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteScenarioVehicleCategory($sScenarioVehicleCategoryID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sScenarioVehicleCategoryID]);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sScenarioVehicleCategoryID,'scenario_vehiclecategory');
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $bResult = $oScenarioDAO->deleteScenarioVehicleCategory($sScenarioVehicleCategoryID);
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * List the routes for a scenario at a given calendar date OR a given daterange
   * @param $aData array : should contain a scenarioMainId field and a calendarDt field in ms and a timeSlotId field
   *                      OR startDt  / endDt
   * @param $bWithErrors : whether to list the errors detected on routes in addition to the routes
   * @return array : array of routes
   */
  public function listRoutesByCalendarDt($aData,$bWithErrors=false){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    $aRoutes = $this->listWithRestrictions($oScenarioDAO,"listRoutesByCalendarDt",$aData);
    // Data postprocessing
    foreach($aRoutes as &$aRoute){
      if(isset($aRoute['timeslot_code'])){
        $sTimeslotCodeEnd = substr($aRoute['timeslot_code'],strlen($aRoute['timeslot_code'])-2,2);
        $aRoute['bMorning'] = $sTimeslotCodeEnd == 'AM';
      }
      $aRoute['vehicleCategory']=array(
        'id'=>$aRoute['vehicle_category_id'],
        'code'=>$aRoute['vehicle_category_code'],
        'label'=>$aRoute['vehicle_category_label'],
        'daily_cost'=>$aRoute['vehicle_category_daily_cost'],
        'hourly_cost'=>$aRoute['vehicle_category_hourly_cost'],
        'kilometric_cost'=>$aRoute['vehicle_category_kilometric_cost'],
        'co2_quantity'=>$aRoute['vehicle_category_co2_quantity']
      );
      // For each POI, set the time windows.
      // Notice that start_hr (respectively end_hr) are supposed to be the same for every morning timeslot associated
      //   with the POI. And so does start_hr and end_hr for the afternoon timeslots associated with the POI
      foreach($aRoute["POIs"] as &$aPOI){
        if(isset($aPOI['timeslots'])){
          $aPOI['bPickupTimeWindow'] = false;
          $aPOI['bDeliveryTimeWindow'] = false;
          foreach($aPOI['timeslots'] as &$aTimeslot){
            if($aTimeslot["timeslot_th"] == $aRoute["timeslot_th"]){
              $sTimeslotCodeEnd = substr($aTimeslot["code"],strlen($aTimeslot["code"])-2,2);
              if($sTimeslotCodeEnd == 'AM'){
                $aPOI['pickupStartHour']=$aTimeslot['start_hr'];
                $aPOI['pickupEndHour']=$aTimeslot['end_hr'];
                $aPOI['bPickupTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
              }else{
                $aPOI['deliveryStartHour']=$aTimeslot['start_hr'];
                $aPOI['deliveryEndHour']=$aTimeslot['end_hr'];
                $aPOI['bDeliveryTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
              }
            }
          }
        }
      }
      unset($aRoute['timeslot_code']);
      unset($aRoute['vehicle_category_id']);
      unset($aRoute['vehicle_category_code']);
      unset($aRoute['vehicle_category_label']);
    }
    if($bWithErrors){
      $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
      $aErrors = $oDataCheckerCtrl->listDetails(array(
        'datachecker_main_id'=>'',
        'scenario_main_id'=>$aData['scenarioMainId'],
        'transport_demand_id'=>'',
        'transport_calendar_id'=>'',
        'transport_calendar_dt'=>$aData['calendarDt'],        
        'transport_route_id'=>'',
        'vehicle_category_id'=>'',
        'site_poi_id'=>'',
        'hr_main_id'=>''
      ));
      // Distribution of the found errors among the routes
      foreach($aRoutes as &$aRoute){
        $aRoute["errors"] = array();
        foreach($aErrors as $aError){
          if($aError['transport_route_id']==$aRoute['id']){
            $aRoute["errors"][]=$aError;
          }
        }
      }
      
    }
    return $aRoutes;
  }

  /**
   * List the POIs for a scenario at a given calendar date.
   * @param $aData array : should contain a scenarioMainId field and a calendarDt field in ms and a timeSlotId field
   * @return array : array of POIs
   */
  public function listPOIs($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    return $oScenarioDAO->listPOIs($aData);
  }

  /**
   * Delete the routes for a scenario at a given calendar date + timeslotId.
   * @param $aData array : should contain a scenarioMainId field and a calendarDt field in ms and a timeSlotId field
   * @return boolean : true if deletion succeeded
   */
  function deleteRoutes($aData){    
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);    
    $aRoutes = $this->listRoutesByCalendarDt($aData);
    $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
    $bResult = false;
    foreach($aRoutes as $aRoute){
      $bResult &= $oRouteCtrl->markAsRemoved($aRoute['id']);
    }
    return $bResult;
  }

  /**
   * Copy a half day from a scenario calendar into a list of days from this calendar
   * The input data should contain the following fields :
   *   scenarioMainId : the id of the scenario
   *   calendarDt : the source day (expressed as a timestamp in ms at midnight server time)
   *   timeSlotId : the source timeslot id
   *   copyMode : optional copy mode : if present, and if a code subfield is set to OVERWRITE, the already existing
   *     routes will be deleted before creating the new routes
   *   selectedRouteIDs : optional restriction to a list of route ids ( array containing items with one id field )
   *   selectedDays : list of destination days to which the routes will be copied
   * Remarks :
   *   The routes will be copied in one day per selected week (the same day of week as the source day)
   *   The routes will not be copied to the source day
   * @param array $aData : the calendars to be copied
   * @return array : the list of timestamps+timeslot id to which the source will be copied
   */
  function copyCalendars($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    // Compute the day of week corresponding to the source day
    // The day of week is expressed as an integer (from 1 for monday to 7 for sunday)
    $iReferenceWeekday1to7 = date('N', $aData["calendarDt"]/1000);   
    // List routes corresponding to source day (we only need the routes ids)
    $aRoutes = array();
    if(isset($aData["selectedRouteIDs"])){
      // When the list of routes to work with are passed as an input, use if
      $aRoutes = $aData["selectedRouteIDs"];
    }
    else{
      // Otherwise, list all routes according to the available filters (date, scenario, timestlot)
      $aRoutes = $this->listRoutesByCalendarDt($aData);
    }    
    // Get the directon corresponding to the input timeslot id
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $sTimeslotCode = $oThesaurusCtrl->get($aData["timeSlotId"])["code"];    
    $sDirection = substr($sTimeslotCode,strlen($sTimeslotCode)-2,2);
    // Get the list of existing timeslots : we will use it many time, so we will use it as a cache
    $aExistingTimeslots = $oThesaurusCtrl->list(array("cat"=>'TIMESLOT')); 
    // Compute the list of destination dates and timeslots
    $aTimeStamps = array();
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    foreach($aData["selectedDays"] as $aSelectedDay){
      $iCalendarDtMs = $oCalendarCtrl->toTimestamp($aSelectedDay["data"]);
      // Avoid inserting the reference date
      if($iCalendarDtMs != $aData["calendarDt"]){
        $aTimeStamps[] = array(
          "newDateDt"=>$iCalendarDtMs,
          "newTimeslotTh"=>$oCalendarCtrl->getTimeslotId($iCalendarDtMs,$sDirection,$aExistingTimeslots)
        );
      }
    }      
    $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
    if(isset($aData["copyMode"]) && isset($aData["copyMode"]["code"]) && $aData["copyMode"]["code"]=="OVERWRITE"){
      $this->log()->info(["method"=>__METHOD__,"data"=>$aData,"message"=>"ERASING !!!!"]);
      // Delete the existing routes before creating new ones
      foreach($aTimeStamps as $aTimeStamp){
        $this->deleteRoutes(array(
          "calendarDt"=>$aTimeStamp["newDateDt"],
          "timeSlotId"=>$aTimeStamp["newTimeslotTh"],
          "scenarioMainId"=>$aData["scenarioMainId"]
        ));
      }
    }
    foreach($aRoutes as $aRoute){
      foreach($aTimeStamps as $aTimeStamp){
        $aTimeStamp["routeId"] = $aRoute['id'];
        $aTimeStamp["newOptimMainId"] = NULL;
        $aNewRoute = $oRouteCtrl->copy($aTimeStamp);
      }
    }
    return $aTimeStamps;    
  }

  /**
   * @param $bNeedUpdate boolean : true to set need_calendar_update_yn field to 'Y' 
   */
  function setNeedCalendarUpdate($sScenarioMainId,$bNeedUpdate){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($sScenarioMainId,$bNeedUpdate)]);
    $oScenarioDAO = new \OSS\Model\ScenarioDAO();
    return $oScenarioDAO->setNeedCalendarUpdate($sScenarioMainId,$bNeedUpdate);
  }

}