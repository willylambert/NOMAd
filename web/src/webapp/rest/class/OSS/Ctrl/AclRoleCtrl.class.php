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
 *  Service REST for ACL
 **/
namespace OSS\Ctrl;

class AclRoleCtrl extends \OSS\BaseObject{

  /**
  * Get Acl Roles
  * @return array of ["id"=>string,"code"=>string,"label"=>string,"actions"=>["id","code","label"]]
  **/
  function list(){
    $this->log()->debug(["method"=>__METHOD__]);
    $oAclRoleDAO = new \OSS\Model\AclRoleDAO();
    $roles = $oAclRoleDAO->list();

    $this->setResult($roles);

    return $roles;
  }

  /**
  * Get role
  * @param $id string
  * @return ["id"=>string,"code"=>string,"label"=>string,"aclActions"=>["id","code","label"]]
  **/
  function get($id){
    $this->log()->debug(["method"=>__METHOD__]);
    $oAclRoleDAO = new \OSS\Model\AclRoleDAO();
    $role = $oAclRoleDAO->get($id);

    $this->setResult($role);

    return $role;
  }

  /**
  * @param array ["id"=>string,"code"=>string,"label"=>string,"aclActions"=>["id","code","label"]]
  **/
  function save($aclRole){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aclRole]);
    // If record Id is provide, update record, otherwise create new one
    $oAclRoleDAO = new \OSS\Model\AclRoleDAO();

    $roleId = null;

    if(isset($aclRole["id"])){
      $oAclRoleDAO->update($aclRole);
      $roleId = $aclRole["id"];
    }else{
      $roleId = $oAclRoleDAO->add($aclRole);
    }

    $this->setResult(["id"=>$roleId]);

    return $roleId;
  }

  /**
  * Delete a role
  * @param string $sRoleId : id of the role to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sRoleId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sRoleId]);
    $bResult = false;
    if($this->isAdmin()){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sRoleId,'acl_role');
      $oAclRoleDAO = new \OSS\Model\AclRoleDAO();
      $bResult = $oAclRoleDAO->delete($sRoleId);
    }
    $this->setResult($bResult);
    return $bResult;
  }
}