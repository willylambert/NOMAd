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
 *  REST service to retrieve site (whatever their type)
 *  @creationdate 2018-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class SiteCtrl extends BaseObject{

  /**
  * Get the sites lists (includes facilities, construction sites, etc.)
  * The input data array is expected to contain the following fields :
  *   statusCode, search, startIndex, length, typeCode (CS, FA or CL)
  * @param array $aData : filtering data
  * @return array({object}) : array of Site object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aSites = $oSiteDAO->list($aData);
    $this->setResult($aSites);
    return $aSites;
  }

  /**
  * Read the asked site
  * @param string $sSiteId : Site Reference
  * @return array with site data.
  **/
  function get($sSiteId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sSiteId]);
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aSite = $oSiteDAO->get($sSiteId);
    $oPOICtrl = new \OSS\Ctrl\POICtrl();
    $aSite['POIs'] = $oPOICtrl->list(array('siteId'=>$sSiteId));
    $oAOICtrl = new \OSS\Ctrl\AOICtrl();
    $aSite['AOIs'] = $oAOICtrl->list(array('siteId'=>$sSiteId));
    // For sites of type institution, we also have some opening hours (some for pickup, others for delivery)
    if($aSite['type_code']=='INSTITUTION'){
      $aSite['pickupHours'] = $this->listHours(array('siteId'=>$sSiteId,'bPickup'=>true));
      $aSite['deliveryHours'] = $this->listHours(array('siteId'=>$sSiteId,'bPickup'=>false));
    }
    $this->setResult($aSite);
    return $aSite;
  }

  /**
  * Save a site (creation or update)
  * @param array $aData : data of the site to be saved.
  * @return array : with an id field (empty array in case of failure)
  */
  public function save($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    // site_main_id_entity is optional
    if(!isset($aData['site_main_id_entity'])){
      $aData['site_main_id_entity']=null;
    }
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
  * Add a site
  * @param array $aData : data of the site to be added.
  * @return array : with an id field containing the id of the created site
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    // TODO : check whether it is necessary to have the data access rights on the entity_main_id to
    //        create a site. Currently we perform no check at all
    $aData['rec_st']='C';
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aNewData = $oSiteDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'site_main');
      // Handle the insertion for the new POIs
      if(isset($aData['POIs'])){
        $oPOICtrl = new \OSS\Ctrl\POICtrl();
        foreach($aData['POIs'] as $aPOI){
          $aPOI['site_main_id']=$aNewData['id'];
          $oPOICtrl->add($aPOI);
        }
      }
      // Handle the insertion for the new AOIs
      if(isset($aData['AOIs'])){
        foreach($aData['AOIs'] as $aAOI){
          $aAOI['site_main_id']=$aNewData['id'];
          $oAOICtrl->add($aAOI);
        }
      }
      // Handle the insertion for the opening hours
      if(isset($aData['deliveryHours'])){
        foreach($aData['deliveryHours'] as $aDeliveryPeriod){
          $aDeliveryPeriod['site_main_id']=$aNewData['id'];
          $this->addHours($aDeliveryPeriod);
        }
      }
      if(isset($aData['pickupHours'])){
        foreach($aData['pickupHours'] as $aPickupPeriod){
          $aPickupPeriod['site_main_id']=$aNewData['id'];
          $this->addHours($aPickupPeriod);
        }
      }
      // Add access for current user to newly added site
      $oSiteDAO->addUserToSite($this->getSessionUserId(),$aNewData['id']);      
    }
    else{
      throw new \OSS\AppException(
        "Site insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a site
  * @param array $aData : data of the site to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    if($aData['site_main_id_entity']==$aData['id']){
      throw new \OSS\AppException(
        "Site entity id must be different from site id.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_main');
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $bResult = $oSiteDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_main');
      // Handle the update for the list of existing POIs
      if(isset($aData['POIs'])){
        foreach($aData['POIs'] as &$aPOI){
          $aPOI['site_main_id']=$aData['id'];
        }
        $oPOICtrl = new \OSS\Ctrl\POICtrl();
        $bResult &= $oPOICtrl->updateBySite($aData['POIs'],$aData['id']);
      }
      // Handle the update for the list of exisiting AOIs
      if(isset($aData['AOIs'])){
        foreach($aData['AOIs'] as &$aAOI){
          $aAOI['site_main_id']=$aData['id'];
        }
        $oAOICtrl = new \OSS\Ctrl\AOICtrl();
        $bResult &= $oAOICtrl->updateBySite($aData['AOIs'],$aData['id']);
      }
      // Handle the update for the list of opening hours
      if(isset($aData['deliveryHours'])){
        foreach($aData['deliveryHours'] as &$aDeliveryPeriod){
          $aDeliveryPeriod['site_main_id']=$aData['id'];
        }
        $bResult &= $this->updateHoursBySite($aData['deliveryHours'],$aData['id'],false);
      }
      if(isset($aData['pickupHours'])){
        foreach($aData['pickupHours'] as &$aPickupPeriod){
          $aPickupPeriod['site_main_id']=$aData['id'];
        }
        $bResult &= $this->updateHoursBySite($aData['pickupHours'],$aData['id'],true);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a site as removed
  * @param string $sSiteID : id of the site to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sSiteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sSiteID]);
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $bResult = $oSiteDAO->markAsRemoved($sSiteID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sSiteID,'site_main');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a site
  * @param string $sSiteID : id of the site to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sSiteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sSiteID]);
    $bResult = false;
    if($this->isAdmin()){      
      // Delete POIs associated to the site
      $oPOICtrl = new \OSS\Ctrl\POICtrl();
      $aPOIsToDelete = $oPOICtrl->list(array("siteId"=>$sSiteID));
      foreach($aPOIsToDelete as $aPOIToDelete){
        $oPOICtrl->delete($aPOIToDelete['id']);
      }
      // Delete AOIs associated to the site
      $oAOICtrl = new \OSS\Ctrl\AOICtrl();
      $aAOIsToDelete = $oAOICtrl->list(array("siteId"=>$sSiteID));
      foreach($aAOIsToDelete as $aAOIToDelete){
        $oAOICtrl->delete($aAOIToDelete['id']);
      }
      // Delete opening hours associated to the site
      $aDeliveryHoursToDelete = $this->listHours(array("siteId"=>$sSiteID,"bPickup"=>false));
      foreach($aDeliveryHoursToDelete as $aDeliveryPeriodToDelete){
        $this->deleteHours($aDeliveryPeriodToDelete['id']);
      }
      $aPickupHoursToDelete = $this->listHours(array("siteId"=>$sSiteID,"bPickup"=>true));
      foreach($aPickupHoursToDelete as $aPickupPeriodToDelete){
        $this->deleteHours($aPickupPeriodToDelete['id']);
      }
      // Delete the site itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sSiteID,'site_main');
      $oSiteDAO = new \OSS\Model\SiteDAO();
      $bResult = $oSiteDAO->delete($sSiteID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Generate a site code from a basename.
   * For instance if basename is toto, the output will be toto_001, or toto_002 is toto_001 is already taken, and so on
   * @param string $sBaseName : a basename for site code generation
   * @return : a new site code
   */
  public function generateSiteCode($sBaseName){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sBaseName]);
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aSiteCodes = $oSiteDAO->listSiteCodes($sBaseName);
    $sResult = $sBaseName;
    for($i=1;$i<1000;$i++){
      $j=$i;
      if($i<10){
        $j="0".$j;
      }
      if($i<100){
        $j="0".$j;
      }
      $j="_".$j;
      if(!in_array($sBaseName.$j,$aSiteCodes)){
        $sResult.=$j;
        break;
      }
    }
    return $sResult;
  }

  /**
   * List the opening hours for an institution site
   * The available input filters enable to target a specific institution id (siteId field) and a type for the
   *   opening period : opening period for pickup or opening period for delivery (bPickup field)
   * A dayLabel field is added to the output that contains only the day label
   * @param array $aData : filter with a siteId field (institution site id) and a bPickup field (boolean)
   * @return array : list of opening hours
   */
  public function listHours($aData){
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aOpeningHours = $oSiteDAO->listHours($aData);
    // post treatment : keep only the day part in the timeslot code
    foreach($aOpeningHours as &$aOpeningPeriod){
      $iPositionOfFirstSpace = strpos($aOpeningPeriod["timeslot_label"],' ');
      if($iPositionOfFirstSpace>0){
        $aOpeningPeriod['dayLabel']=substr($aOpeningPeriod["timeslot_label"],0,$iPositionOfFirstSpace);
      }
      else{
        $aOpeningPeriod['dayLabel']=$aOpeningPeriod["timeslot_label"];
      }
    }
    return $aOpeningHours;
  }

  /**
   * Insert an opening period for an institution site into the database
   * @param array $aOpeningPeriod : the opening period to be added
   * @return string : the created opening period id
   */
  public function addHours($aOpeningPeriod){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aOpeningPeriod]);
    $aOpeningPeriod['rec_st']='C';
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $aNewOpeningPeriod = $oSiteDAO->addHours($aOpeningPeriod);
    if(isset($aNewOpeningPeriod['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewOpeningPeriod['id'],'site_hour');
    }
    else{
      throw new \OSS\AppException(
        "Site opening period insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewOpeningPeriod);
    return $aNewOpeningPeriod;
  }

  /**
   * Update an opening period for an institution site in the database
   * @param array $aOpeningPeriod : the opening period to be update
   * @return boolean : whether the operation succeeded or not
   */
  public function updateHours($aOpeningPeriod){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aOpeningPeriod]);
    $aOpeningPeriod['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aOpeningPeriod['id'],'site_hour');
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $bResult = $oSiteDAO->updateHours($aOpeningPeriod);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aOpeningPeriod['id'],$aOldData,'site_hour');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a site opening period as removed
  * @param string $sSiteOpeningPeriodID : id of the site opening period to be removed.
  * @param string $sSiteID : id of the site (for access control check).
  * @return boolean : true if the operation succeeded
  */
  public function markHoursAsRemoved($sSiteOpeningPeriodID,$sSiteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sSiteOpeningPeriodID]);
    $oSiteDAO = new \OSS\Model\SiteDAO();
    $bResult = $oSiteDAO->markHoursAsRemoved($sSiteOpeningPeriodID,$sSiteID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sSiteOpeningPeriodID,'site_hour');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a site opening period
  * @param string $sSiteOpeningPeriodID : id of the site opening period to be deleted.
  * @return boolean : true in case of success
  */
  public function deleteHours($sSiteOpeningPeriodID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sSiteOpeningPeriodID]);
    $bResult = false;
    if($this->isAdmin()){  
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sSiteOpeningPeriodID,'site_hour');
      $oSiteDAO = new \OSS\Model\SiteDAO();
      $bResult = $oSiteDAO->deleteHours($sSiteOpeningPeriodID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Update all the pickup opening hours or all delivery opening hour the over a site
   * @param array $aOpeningHours : the updated opening hours
   * @param string $sSiteID : the concerned site id
   * @param boolean $bPickup : whether we ant to update pickup opening hours or delivery opening hours
   * @return boolean : true if the update succeeded
   */
  public function updateHoursBySite($aOpeningHours,$sSiteID,$bPickup){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aOpeningHours,$sSiteID,$bPickup)]);
    $bResult = true;
    // Get the list of existing opening hours for the current site, for comparison
    $aOldOpeningHours = $this->listHours(array('siteId'=>$sSiteID,'bPickup'=>$bPickup));
    foreach($aOldOpeningHours as $aOldOpeningPeriod){
      $bOldOpeningPeriodFound = false;
      foreach($aOpeningHours as $aOpeningPeriod){
        if(isset($aOpeningPeriod['id']) && $aOpeningPeriod['id'] == $aOldOpeningPeriod['id']){
          // Handle an updated opening period
          $bResult &= $this->updateHours($aOpeningPeriod);
          $bOldOpeningPeriodFound = true;
          break;
        }
      }
      if(!$bOldOpeningPeriodFound){
        // Handle a deleted opening period
        $bResult &= $this->markHoursAsRemoved($aOldOpeningPeriod['id'],$sSiteID);
      }
    }
    // Now handle new opening hours insertion
    foreach($aOpeningHours as $aOpeningPeriod){
      if(!isset($aOpeningPeriod['id'])){
        $this->addHours($aOpeningPeriod);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

}