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
 *  REST service to handle AOIs (Areas of Interest)
 *  @creationdate 2019-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class AOICtrl extends BaseObject{

  /**
  * Get a list of AOIs based on search criteria
  * The input data array is expected to contain the following fields :
  *   siteId
  * @param array $aData : filtering data
  * @return array({object}) : array of AOI object
  **/
  public function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oAOIDAO = new \OSS\Model\AOIDAO();
    $aAOIs = $oAOIDAO->list($aData);
    $this->setResult($aAOIs);
    return $aAOIs;
  }

  /**
  * Get some details about an AOI
  * @param string $sAOIID : AOI identifier
  * @return array with ID, SITE_MAIN_ID, LABEL, POSITION, TYPE_TH, GEOM, REC_ST fields
  */
  public function get($sAOIID){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sAOIID]);
    $oAOIDAO = new \OSS\Model\AOIDAO();
    $aAOI = $oAOIDAO->get($sAOIID);
    $this->setResult($aAOI);
    return $aAOI;
  }

  /**
  * Add a AOI
  * @param array $aData : data of the AOI to be added.
  * @return array : new aoi with id field
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewAOI = array();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oSiteCtrl->hasAccess($aData['site_main_id'])){
      $aData['rec_st']='C';
      $oAOIDAO = new \OSS\Model\AOIDAO();
      $aNewAOI = $oAOIDAO->add($aData);
    }
    if(isset($aNewAOI['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewAOI['id'],'site_aoi');
    }
    else{
      throw new \OSS\AppException(
        "AOI insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewAOI);
    return $aNewAOI;
  }

  /**
   * Update all the AOIs over a site
   * @param array $aAOIs : the updated AOIs
   * @param string $sSiteID : the concerned site id
   * @return boolean : true if the update succeeded
   */
  public function updateBySite($aAOIs,$sSiteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aAOIs,$sSiteID)]);
    $bResult = true;
    // Get the list of existing AOIs for the current site, for comparison
    $aOldAOIs = $this->list(array('siteId'=>$sSiteID));
    foreach($aOldAOIs as $aOldAOI){
      $bOldAOIFound = false;
      foreach($aAOIs as $aAOI){
        if(isset($aAOI['id']) && $aAOI['id'] == $aOldAOI['id']){
          // Handle an updated AOI
          $bResult &= $this->update($aAOI);
          $bOldAOIFound = true;
          break;
        }
      }
      if(!$bOldAOIFound){
        // Handle a deleted AOI
        $bResult &= $this->markAsRemoved($aOldAOI['id']);
      }
    }
    // Now handle new AOIs insertion
    foreach($aAOIs as $aAOI){
      if(!isset($aAOI['id'])){
        $aAOI['position']=$this->getNextPosition($sSiteID);
        $this->add($aAOI);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Get the next available position for an AOI within a site
   * @param string $sSiteID : the concerned site id
   * @return integer : the next available position for an AOI within a site
   */
  public function getNextPosition($sSiteID){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sSiteID]);
    $iResult=false;
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oSiteCtrl->hasAccess($sSiteID)){    
      $oAOIDAO = new \OSS\Model\AOIDAO();
      $iResult = $oAOIDAO->getNextPosition($sSiteID);
    }
    return $iResult;
  }

  /**
  * Update a AOI
  * @param array $aData : data of the AOI to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_aoi');
    $oAOIDAO = new \OSS\Model\AOIDAO();
    $bResult = $oAOIDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_aoi');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a AOI as removed
  * @param string $sAOIID : id of the AOI to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sAOIID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sAOIID]);
    $oAOIDAO = new \OSS\Model\AOIDAO();
    $bResult = $oAOIDAO->markAsRemoved($sAOIID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sAOIID,'site_aoi');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a AOI.
  * @param string $sAOIID : id of the AOI to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function delete($sAOIID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sAOIID]);
    $bResult = false;
    if($this->isAdmin()){    
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sAOIID,'site_aoi');
      $oAOIDAO = new \OSS\Model\AOIDAO();
      $bResult = $oAOIDAO->delete($sAOIID);
    }
    $this->setResult($bResult);
    return $bResult;
  }
}