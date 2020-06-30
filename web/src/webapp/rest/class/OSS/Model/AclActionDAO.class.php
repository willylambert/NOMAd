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
 *  Class to handle DB access for user
 **/
namespace OSS\Model;

use PDO;

class AclActionDAO extends \OSS\BaseObject{

  /**
   * default constructor
   */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of actions
  * @return array of ["id"=>string,"code"=>string,"label"=>string]
  **/
  function list(){
    $this->log()->debug(["method"=>__METHOD__]);

    $sql = "SELECT id,code,label
              FROM acl_action
             WHERE rec_st<>'D'";

    $result = $this->db()->query($sql);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Check if user has access to an action
  * @param $userId string
  * @param $actionCode, route pattern
  * @return boolean
  **/
  function userHasAccess($userId,$actionCode){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$userId,$actionCode]]);

    $bResult = false;
    if($userId != null && $userId != ''){
      $userIdQuoted = $this->db()->quote($userId);
      $actionCodeQuoted = $this->db()->quote($actionCode);

      $sql = "SELECT COUNT(acl_action.id) As nb_action
                FROM acl_action
          INNER JOIN acl_roleaction ON acl_roleaction.acl_action_id=acl_action.id and acl_action.code=$actionCodeQuoted
          INNER JOIN acl_roleuser ON acl_roleaction.acl_role_id=acl_roleuser.acl_role_id and acl_roleuser.user_main_id=$userIdQuoted";

      $result = $this->db()->query($sql);
      $row = $result->fetch(PDO::FETCH_ASSOC);

      $bResult = ($row['nb_action']>0);
    }

    return $bResult;

  }

}