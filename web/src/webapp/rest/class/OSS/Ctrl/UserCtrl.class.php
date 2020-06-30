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
 *  Service REST for user
 **/
namespace OSS\Ctrl;

class UserCtrl extends \OSS\BaseObject{

  /**
  * Get users
  * @param $id string
  **/
  function list($filters){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$filters]);
    $oUserDAO = new \OSS\Model\UserDAO();
    $users = $oUserDAO->list($filters);
    $this->setResult($users);

    return $users;
  }

   /**
   * List the HRs linked to a user
   * @param string id : the user id
   * @return array : a list of HRs
   */
  function listHRs($id){
    $this->log()->info(["method"=>__METHOD__,"data"=>$id]);
    $oUserDAO = new \OSS\Model\UserDAO();
    $aHRs = $oUserDAO->listHRs($id);
    return $aHRs;
  }

  /**
  * Get user
  * @param $id string
  **/
  function get($id){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$id]);
    $oUserDAO = new \OSS\Model\UserDAO();
    $user = $oUserDAO->get($id);
    $this->setResult($user);
    return $user;
  }

  /**
  * @param array ["id"=>string,"login"=>string,"firstname"=>string,"lastname"=>string,"roles"=>["id","code","label"]]
  * @return string : userId
  **/
  function save($user){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$user]);

    $oUserDAO = new \OSS\Model\UserDAO();

    $userId = null;

    // If record Id is provide, update record, otherwise create new one
    if(isset($user["id"])){
      $oUserDAO->update($user);
      $userId = $user["id"];
    }else{
      $userId = $oUserDAO->add($user);
    }

    $this->setResult(["id"=>$userId]);

    return $userId;
  }

  /**
  * Update the password for a user.
  * Only the user itself is allowed to modify its password this way.
  * @param array ["id"=>string,"passwd"=>string,and other fields]]
  * @return string : userId
  **/
  function updatePassword($user){
    $this->log()->notice(["method"=>__METHOD__,"data"=>$user]);

    $oUserDAO = new \OSS\Model\UserDAO();
    if(!isset($user["id"]) || $user["id"]==""){
      throw new \OSS\AppException(
        "Update into database failed : missing user id.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    if(!isset($user["passwd"]) || $user["passwd"]==""){
      throw new \OSS\AppException(
        "Update into database failed : missing user password.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    // Check whether current user has the rights to access $user data
    if($this->getSessionUserId() == $user["id"]){
      $oUserDAO->updatePassword($user);
    }
    else{
      throw new \OSS\AppException(
        "Update into database failed : only the concerned user is allowed to update the password this way.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult(["id"=>$userId]);
    return $userId;
  }

  /**
   * Update all the access restrictions for all users that are concerned by the provided institution ID
   *   so as to allow access to the provided HR ID
   * @param $sHRId string : the involved HRId
   * @param $sInstitutionSiteId string : the involved institution site id
   */
  public function addHRToInstitution($sHRId,$sInstitutionSiteId){
    $oHRCtrl = new \OSS\Ctrl\HRCtrl();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oHRCtrl->hasAccess($sHRId) && $oSiteCtrl->hasAccess($sInstitutionSiteId)){
      $oUserDAO = new \OSS\Model\UserDAO();
      $oUserDAO->addHRToInstitution($sHRId,$sInstitutionSiteId);
    }
  }

  /**
   * Update all the access restrictions for all users that are concerned by the provided institution ID
   *   so as to remove access to the provided HR ID
   * @param $sHRId string : the involved HRId
   * @param $sInstitutionSiteId string : the involved institution site id
   */
  public function removeHRFromInstitution($sHRId,$sInstitutionSiteId){
    $oHRCtrl = new \OSS\Ctrl\HRCtrl();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oHRCtrl->hasAccess($sHRId) && $oSiteCtrl->hasAccess($sInstitutionSiteId)){
      $oUserDAO = new \OSS\Model\UserDAO();
      $oUserDAO->removeHRFromInstitution($sHRId,$sInstitutionSiteId);
    }
  }

  /**
  * Mark a user as removed
  * @param string $sUserID : id of the user to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sUserID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sUserID]);
    $oUserDAO = new \OSS\Model\UserDAO();
    $bResult = $oUserDAO->markAsRemoved($sUserID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sUserID,'user_main');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a user
  * @param string $sUserId : id of the user to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sUserId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sUserId]);
    $bResult = false;
    if($this->isAdmin()){       
      // Delete the user itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sUserId,'user_main');
      $oUserDAO = new \OSS\Model\UserDAO();
      $bResult = $oUserDAO->delete($sUserId);
    }
    $this->setResult($bResult);
    return $bResult;
  }
}