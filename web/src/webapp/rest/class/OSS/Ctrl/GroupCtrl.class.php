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
 *  REST service to retrieve groups of demands
 *  @creationdate 2019-04-03
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class GroupCtrl extends BaseObject{

  /**
  * Get the groups of demands list
  * The input data array is expected to contain the some filters
  * @param array $aData : filtering data
  * @return array({object}) : array of Group object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oGroupDAO = new \OSS\Model\GroupDAO();
    return $this->listWithRestrictions($oGroupDAO,"list",$aData);
  }

  /**
  * Read the asked group
  * @param string $sGroupId : Group Reference
  * @return array with group data.
  **/
  function get($sGroupId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sGroupId]);
    $oGroupDAO = new \OSS\Model\GroupDAO();
    return $this->getWithRestrictions($oGroupDAO,"get",$sGroupId);
  }

  /**
  * Save a group (creation or update)
  * @param array $aData : data of the group to be saved.
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
  * Add a group
  * @param array $aData : data of the group to be added.
  * @return array : with an id field containing the id of the created group
  */
  public function add($aData){
    $this->log()->notice(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    // For the group creation, there is no access data right check because at creation time a group
    //   contains only a label, the demands will be added to the group later.
    $oGroupDAO = new \OSS\Model\GroupDAO();
    $aNewData = $oGroupDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'transport_group');
      // Handle the insertion for the new demands
      if(isset($aData['demands'])){
        foreach($aData['demands'] as &$aDemand){
          $aDemand['transport_group_id']=$aNewData['id'];
          $this->addDemand($aDemand);
        }
      }
    }
    else{
      throw new \OSS\AppException(
        "Group insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a group
  * @param array $aData : data of the group to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->notice(["method"=>__METHOD__,"data"=>$aData]);
    $bResult = false;
    if($this->hasAccess($aData['id'])){
      $aData['rec_st']='U';
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'transport_group');
      $oGroupDAO = new \OSS\Model\GroupDAO();
      $bResult = $oGroupDAO->update($aData);
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'transport_group');
      // Handle the update for the list of existing demands
      if(isset($aData['demands'])){
        $aDemands = array();
        foreach($aData['demands'] as &$aDemand){
          $aDemand['transport_group_id']=$aData['id'];
        }
        $bResult = $this->updateDemands($aData['demands'],$aData['id']);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a group as removed
  * @param string $sGroupID : id of the group to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sGroupID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sGroupID]);
    $bResult = false;
    if($this->hasAccess($sGroupID)){    
      $oGroupDAO = new \OSS\Model\GroupDAO();
      $bResult = $oGroupDAO->markAsRemoved($sGroupID);
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sGroupID,'transport_group');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a group
  * @param string $sGroupID : id of the group to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sGroupID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sGroupID]);
    $bResult = false;
    if($this->isAdmin()){    
      // Delete demands associated to the group
      $aDemandsToDelete = $this->listDemands(array("groupId"=>$sGroupID));
      foreach($aDemandsToDelete as $aDemandToDelete){
        $this->deleteDemand($aDemandToDelete['id']);
      }
      // Delete the group itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sGroupID,'transport_group');
      $oGroupDAO = new \OSS\Model\GroupDAO();
      $bResult = $oGroupDAO->delete($sGroupID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Get a list of demands based on search criteria
  * The input data array is expected to contain some filters
  * @param array $aData : filtering data
  * @return array({object}) : array of demands
  **/
  public function listDemands($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $aDemands = array();
    if($this->hasAccess($aData['groupId'])){    
      $oGroupDAO = new \OSS\Model\GroupDAO();
      $aDemands = $oGroupDAO->listDemands($aData);
    }
    $this->setResult($aDemands);
    return $aDemands;
  }

  /**
  * Add a demand.
  * This function will check that we have the access rights over the demand that is being inserted
  * This function will NOT check that we have the access rights over the involved group
  * @param array $aData : data of the demand to be added.
  * @return array : new demand with id field
  */
  public function addDemand($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewDemand = array();
    $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
    if($oDemandCtrl->hasAccess($aData['id'])){    
      $aData['rec_st']='C';
      $oGroupDAO = new \OSS\Model\GroupDAO();
      $aNewDemand = $oGroupDAO->addDemand($aData);
    }
    if(isset($aNewDemand['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewDemand['id'],'transport_groupdemand');
    }
    else{
      throw new \OSS\AppException(
        "Insertion into database of an association between a demand and a group failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewDemand);
    return $aNewDemand;
  }

  /**
   * Update all the demands over a group
   * @param array $aDemands : the updated Demands
   * @param string $sGroupID : the concerned group id
   * @return boolean : true if the update succeeded
   */
  public function updateDemands($aDemands,$sGroupID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aDemands]);
    $bResult = true;
    // Get the list of existing demands for the current group, for comparison
    $aOldDemands = $this->listDemands(array('groupId'=>$sGroupID));
    foreach($aOldDemands as $aOldDemand){
      // Check whether a demand that was linked to the group is still linked to the group in the new data
      $bOldDemandFound = false;
      foreach($aDemands as $aDemand){
        if($aDemand['id'] == $aOldDemand['transport_demand_id']){
          $bOldDemandFound = true;
          break;
        }
      }
      if(!$bOldDemandFound){
        // Handle a deleted Demand
        $bResult = $this->deleteDemand($aOldDemand['id']);
      }
    }
    // Now handle new Demands insertion
    foreach($aDemands as $aDemand){
      // Check whether a demand that is linked to the group in the new data was already linked to the group
      $bNewDemandFound = false;
      foreach($aOldDemands as $aOldDemand){
        if($aDemand['id'] == $aOldDemand['transport_demand_id']){
          $bNewDemandFound = true;
          break;
        }
      }
      if(!$bNewDemandFound){
        // Handle an inserted Demand
        $this->addDemand($aDemand);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a demand.
  * This function will check that we have the access rights over the demand that is being inserted
  * This function will NOT check that we have the access rights over the involved group
  * @param string $sDemandID : id of the demand to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteDemand($sDemandID){
    $this->log()->notice(["method"=>__METHOD__,"data"=>$sDemandID]);
    $bResult = false;
    $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sDemandID,'transport_groupdemand');
    $oGroupDAO = new \OSS\Model\GroupDAO();
    $bResult = $oGroupDAO->deleteDemand($sDemandID);
    $this->setResult($bResult);
    return $bResult;
  }
}