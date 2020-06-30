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
 *  REST service to retrieve hr (human resource)
 *  @creationdate 2018-10-10
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class HRCtrl extends BaseObject{

  /**
  * Get the hrs lists
  * The input data array is expected to contain the following fields :
  *   statusCode, search, startIndex, length, typeCode
  * @param array $aData : filtering data ["aUserId" => array of id]
  * @return array({object}) : array of HR object
  **/
  function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oHRDAO = new \OSS\Model\HRDAO();
    $aHRs = $oHRDAO->list($aData);

    $aHRs = array_map(function($hr){
      $hr["sites"] = json_decode($hr["sites"],true);
      $hr["institutions"] = [];
      $hr["transporters"] = [];
      $hr["homes"] = [];
      foreach ($hr["sites"] as $site) {
        if($site['id']){
          if($site['type'] == "INSTITUTION"){
            $hr["institutions"][] = $site;
          }else{
            if($site['type'] == "TRANSPORTER"){
              $hr["transporters"][] = $site;
            }else{ 
              $hr["homes"][] = $site;
            }
          }
        }
      }
      unset($hr["sites"]);
      return $hr;
    },$aHRs);

    $this->setResult($aHRs);
    return $aHRs;
  }

  /**
   * List the routes for a driver and a given day
   * @param array $aData : with the following fields : hr_main_id, year, month, day
   * @return array : list of routes
   */
  function listRoutes($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    
    // Date is optional
    if(isset($aData['year']) && isset($aData['month']) && isset($aData['day'])){
      $aData['calendar_dt'] = $oCalendarCtrl->toTimestamp($aData);
    }

    $aRoutes = array();
    if(isset($aData["hr_main_id"]) && $aData["hr_main_id"]!=""){
      $oHRDAO = new \OSS\Model\HRDAO();
      // First we test whether the connected user has access to the hr_main_id
      $oUserCtrl = new \OSS\Ctrl\UserCtrl();
      $aHRMainIDs = array_column($oUserCtrl->listHRs($this->getSessionUserId()),"id");
      if(in_array($aData["hr_main_id"],$aHRMainIDs)){
        // In case the connected user is the requested driver itself, we disabled data access control
        //   because a driver user is enabled to see all the routes that it is assigned to.
        $aRoutes = $oHRDAO->listRoutes($aData,false);
      }
      else{
        // Case where the connected user is not the driver : data access control is enabled
        $aRoutes = $this->listWithRestrictions($oHRDAO,"listRoutes",$aData);
      }
    }  
    return $aRoutes;  
  }

  /**
  * Read the asked hr
  * @param string $sHRId : HR Reference
  * @return array with hr data.
  **/
  function get($sHRId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sHRId]);

    $oHRDAO = new \OSS\Model\HRDAO();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();

    $aHR = $oHRDAO->get($sHRId);

    // Get the list of sites attached to the hr and sort them according to their role
    $aHomeSites = $this->listSites($sHRId,'HOME');

    $aHR['home']=array();
    if(count($aHomeSites)==0){
      $this->log()->warn(["method"=>__METHOD__,"data"=>[$sHRId],"message"=>"No home site found for a hr."]);
    }
    else{
      $aHR['home']=$oSiteCtrl->get($aHomeSites[0]['id']);
      if(count($aHomeSites)>1){
        $this->log()->warn(["method"=>__METHOD__,"data"=>[$sHRId],"message"=>"Several home sites found for a hr."]);
      }
    }

    $aHR['institutions'] = $this->listSites($sHRId,'INSTITUTION');
    // Get some details about the establishments (the geometry, for instance)
    foreach($aHR['institutions'] as &$aEstablishment){
      $aEstablishment=$oSiteCtrl->get($aEstablishment['id']);
    }
    
    $aHR['demands'] = $oDemandCtrl->list(["hrMainId"=>$sHRId]);

    // HR could be driver : get transporters and all routes without date restrictions
    if($aHR["type_code"]=="DRIVER"){
      $aHR['transporters'] = $this->listSites($sHRId,'TRANSPORTER');
      $aHR['routes'] = $this->listRoutes(['hr_main_id'=>$sHRId]);
    }

    $this->setResult($aHR);
    return $aHR;
  }

  /**
  * Get a list of site corresponding to a specific hr.
  * This function is not located in SiteCtrl since it involves the search in some hr tables.
  * @param string $sHRId : the concerned hr
  * @param string $sTypeCode : the concerned type code (indicating the role of the site for the hr)
  * @return array({object}) : array of Site object
  **/
  public function listSites($sHRId,$sTypeCode=""){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sHRId,$sTypeCode]]);
    $oHRDAO = new \OSS\Model\HRDAO();
    return $oHRDAO->listSites($sHRId,$sTypeCode);
  }

  /**
  * Save a hr (creation or update)
  * @param array $aData : data of the hr to be saved.
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
  * Add a hr
  * @param array $aData : data of the hr to be added.
  * @return array : with an id field containing the id of the created hr
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    // The creation of a new HR is not subject to access restriction checks because at creation time, a HR is linked to no site
    // The association between a HR and a site will come slightly later
    $oHRDAO = new \OSS\Model\HRDAO();
    $aNewData = $oHRDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'hr_main');
      $this->setHomeSite($aData);
      $aData['id']=$aNewData['id'];
      $this->saveHome($aData);
      $this->saveInstitutions($aData);
      $this->saveTransporters($aData);
    }
    else{
      throw new \OSS\AppException(
        "HR insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
   * Set the values for the home site of a hr
   * @param array $aData : the hr data (input/output)
   */
  public function setHomeSite(&$aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    if(!isset($aData['home'])){
      $aData['home']=array();
    }
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    $aData['home']['code'] = $oSiteCtrl->generateSiteCode('HOME_'.$aData['lastname']);
    $aData['home']['label'] = 'Site rattaché à '.$aData['firstname'].' '.$aData['lastname'];
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $aSiteType = $oThesaurusCtrl->getByCode('SITE_MAIN_TYPE','HOME');
    if(isset($aSiteType['id'])){
      $aData['home']['type_th'] = $aSiteType['id'];
    }
    $aSiteStatus = $oThesaurusCtrl->getByCode('SITE_MAIN_STATUS','ENABLED');
    if(isset($aSiteStatus['id'])){
      $aData['home']['status_th'] = $aSiteStatus['id'];
    }
  }

  /**
   * Save the home site associated to a hr.
   * In the current version, we consider that a hr can not change from one home site to another.
   * A hr can update the characteristics of its home site, and in particular the location of POIs and AOIs
   * @param array $aData : the hr's data.
   */
  public function saveHome($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    if(isset($aData['home']) && count($aData['home'])>0){
      // First we save the home site itself and we get the home site id
      $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
      $aData['home'] = $oSiteCtrl->save($aData['home']);
      // Make sure that the hr has only one home site, and if several are found, remove the useless ones
      $aOldHomes = $this->listSites($aData['id'],'HOME');
      $aHomesToRemove = $this->diffOnID($aOldHomes,array($aData['home']));
      if(count($aHomesToRemove)>0){
        $this->log()->warn([
          "method"=>__METHOD__,
          "data"=>$aData,
          "message"=>"Found a hr home site that is different from the new home site."]);
      }
      foreach($aHomesToRemove as $aHomeToRemove){
        $this->removeSite($aData['id'],$aHomeToRemove['id']);
      }
      // Then we save the association between the home site and the hr
      // Normally $aHomesToInsert should contain 0 or 1 item
      $aHomesToInsert = $this->diffOnID(array($aData['home']),$aOldHomes);
      foreach($aHomesToInsert as $aHomeToInsert){
        $this->addSite($aData['id'],$aHomeToInsert['id'],'HOME');
      }
    }
  }

  /**
   * Save the list of establishments associated to a hr.
   * A hr can add or remove existing establishments from its establishment list but it can not
   *   create a new establishment or update an existing one.
   * @param array $aData : the hr's data.
   */
  public function saveInstitutions($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    if(isset($aData['institutions'])){
      // Get the list of existing establishment for the current hr, for comparison
      $aOldInstitutions = $this->listSites($aData['id'],'INSTITUTION');
      $oUserCtrl = new \OSS\Ctrl\UserCtrl();
      $aInstitutionsToRemove = $this->diffOnID($aOldInstitutions,$aData['institutions']);
      foreach($aInstitutionsToRemove as $aEstablishmentToRemove){
        $this->removeSite($aData['id'],$aEstablishmentToRemove['id']);
        $oUserCtrl->removeHRFromInstitution($aData['id'],$aEstablishmentToRemove['id']);
      }
      $aInstitutionsToInsert = $this->diffOnID($aData['institutions'],$aOldInstitutions);
      foreach($aInstitutionsToInsert as $aEstablishmentToInsert){
        $this->addSite($aData['id'],$aEstablishmentToInsert['id'],'INSTITUTION');
        $oUserCtrl->addHRToInstitution($aData['id'],$aEstablishmentToInsert['id']);
      }
    }
  }

  /**
   * Save the list of transporters associated to a hr.
   * A hr can add or remove existing transporters from its transporter list but it can not
   *   create a new transporter or update an existing one.
   * @param array $aData : the hr's data.
   */
  public function saveTransporters($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    if(isset($aData['transporters'])){
      // Get the list of existing establishment for the current hr, for comparison
      $aOldTransporters = $this->listSites($aData['id'],'TRANSPORTER');
      $aTransportersToRemove = $this->diffOnID($aOldTransporters,$aData['transporters']);
      foreach($aTransportersToRemove as $aTransporterToRemove){
        $this->removeSite($aData['id'],$aTransporterToRemove['id']);
      }
      $aTransportersToInsert = $this->diffOnID($aData['transporters'],$aOldTransporters);
      foreach($aTransportersToInsert as $aTransporterToInsert){
        $this->addSite($aData['id'],$aTransporterToInsert['id'],'TRANSPORTER');
      }
    }
  }

  /**
   * Add a site to a hr's list of sites.
   * @param $sHRId string : the involved HRId
   * @param $sSiteId string : the involved site id
   * @param $sTypeCode string : the involved association type code (INSTITUTION or HOME)
   * @return array : the new association
   */
  public function addSite($sHRId,$sSiteId,$sTypeCode){
    $this->log()->notice(["method"=>__METHOD__,"data"=>[$sHRId,$sSiteId,$sTypeCode]]);
    
    $aNewLink=array();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    
    if($oSiteCtrl->hasAccess($sSiteId)){    
      $oHRDAO = new \OSS\Model\HRDAO();
      $aNewLink = $oHRDAO->addSite($sHRId,$sSiteId,$sTypeCode);
    }else{
      throw new \OSS\AppException(
        "Insertion into database failed : User doesn't have access to site " . $sSiteId,
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    
    $this->log()->info(["method"=>__METHOD__,"data"=>[$sHRId,$sSiteId,$sTypeCode]]);

    if(isset($aNewLink['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewLink['id'],'hr_mainsite');
    }else{
      throw new \OSS\AppException(
        "Insertion into database failed : relation between hr and site.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }

    return $aNewLink;
  }

  /**
   * Remove a site from a HR sites list
   * @param $sHRId string : the involved HRId
   * @param $sSiteId string : the involved site id
   * @return array : the removed association
   */
  public function removeSite($sHRId,$sSiteId){
    $this->log()->notice(["method"=>__METHOD__,"data"=>[$sHRId,$sSiteId]]);
    $aRemovedLink=array();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oSiteCtrl->hasAccess($sSiteId)){
      $oHRDAO = new \OSS\Model\HRDAO();
      $aRemovedLink = $oHRDAO->removeSite($sHRId,$sSiteId);
    }
    if(isset($aRemovedLink['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($aRemovedLink['id'],'hr_mainsite');
    }
    else{
      throw new \OSS\AppException(
        "Deletion from database failed : relation between hr and site.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    return $aRemovedLink;
  }

  /**
  * Update the durations for a set of hrs
  * @param array $aData : data of the set of hrs to be updated.
  * @return boolean true in case update succeded
  */
  public function updateDurations($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oHRDAO = new \OSS\Model\HRDAO();
    $bResult = true;
    foreach($aData as $aHR){
      // TODO : update audit trail on hr_main_detail table
      $aHR['rec_st']='U';
      $bResult &= $oHRDAO->updateDurations($aHR);
    }
    return $bResult;
  }

  /**
  * Update a hr
  * @param array $aData : data of the hr to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'hr_main');
    $oHRDAO = new \OSS\Model\HRDAO();
    $bResult = $oHRDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'hr_main');
      $this->saveHome($aData);
      $this->saveInstitutions($aData);
      $this->saveTransporters($aData);
      $this->setResult($bResult);
    }
    return $bResult;
  }

  /**
  * Mark a hr as removed
  * @param string $sHRID : id of the hr to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sHRID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sHRID]);
    $oHRDAO = new \OSS\Model\HRDAO();
    $bResult = $oHRDAO->markAsRemoved($sHRID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sHRID,'hr_main');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a hr
  * @param string $sHRID : id of the hr to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sHRID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sHRID]);
    $bResult = false;
    if($this->isAdmin()){    
      // First delete the hr demands
      $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
      $aDemands = $oDemandCtrl->list(array("hrMainId"=>$sHRID));
      foreach($aDemands as $aDemand){
        $oDemandCtrl->delete($aDemand['id']);
      }
      // Delete the hr itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sHRID,'hr_main');
      $oHRDAO = new \OSS\Model\HRDAO();
      $bResult = $oHRDAO->delete($sHRID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

}