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

class AclRoleDAO extends \OSS\BaseObject{

  /**
  * default constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of role, with associated actions
  * @return array of ["id"=>string,"code"=>string,"label"=>string,"actions"=>["id","code","label"]]
  **/
  function list(){
    $this->log()->debug(["method"=>__METHOD__]);

    $sql = "SELECT id,code,label
            FROM acl_role
            WHERE rec_st<>'D'";

    $result = $this->db()->query($sql);
    $roles = $result->fetchAll(PDO::FETCH_ASSOC);

    foreach ($roles as &$role) {
      $roleIdQuoted = $this->db()->quote($role["id"]);

      $sql = "SELECT acl_action.id,code,label
                FROM acl_action
          INNER JOIN acl_roleaction ON acl_action.id = acl_roleaction.acl_action_id
               WHERE acl_role_id=$roleIdQuoted";

      $result = $this->db()->query($sql);
      $role["actions"] = $result->fetchAll(PDO::FETCH_ASSOC);
    }

    return $roles;
  }

  /**
  * Get role
  * @param $id string
  * @return ["id"=>string,"code"=>string,"label"=>string,"actions"=>["id","code","label"]]
  **/
  function get($id){
    $this->log()->debug(["method"=>__METHOD__]);

    $idQuoted = $this->db()->quote($id);

    $sql = "SELECT id,code,label
              FROM acl_role
             WHERE id=$idQuoted";

    $result = $this->db()->query($sql);
    $role = $result->fetch(PDO::FETCH_ASSOC);

    $sql = "SELECT acl_action.id,code,label
              FROM acl_action
        INNER JOIN acl_roleaction ON acl_action.id = acl_roleaction.acl_action_id
             WHERE acl_role_id=$idQuoted";

    $result = $this->db()->query($sql);
    $role["actions"] = $result->fetchAll(PDO::FETCH_ASSOC);

    return $role;
  }

  /**
  * @param array ["code"=>string,"label"=>string,"aclActions"=>["id","code","label"]]
  * @return boolean : true in case of success, false otherwise
  **/
  function add($aclRole){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aclRole]);
    $bResult=false;
    if($this->isAdmin()){
      $codeQuoted = $this->db()->quote($aclRole["code"]);
      $labelQuoted = $this->db()->quote($aclRole["label"]);

      $this->db()->beginTransaction();

      $sql = "INSERT INTO acl_role(code,label)
                   VALUES ($codeQuoted,$labelQuoted)
              RETURNING id";

      $result = $this->db()->query($sql);
      $row = $result->fetch(PDO::FETCH_ASSOC);
      $roleId = $row["id"];

      // Insert role-actions
      foreach($aclRole["actions"] as $action){
        if(!isset($action["id"])){
          // Insert action
          $codeQuoted = $this->db()->quote($action["code"]);
          $labelQuoted = $this->db()->quote($action["label"]);

          $this->log()->info(["method"=>__METHOD__,"message"=>"insert action","data"=>$action]);

          $sql = "INSERT INTO acl_action(code,label)
                       VALUES($codeQuoted,$labelQuoted)
                   RETURNING id";
          $result = $this->db()->query($sql);
          $row = $result->fetch(PDO::FETCH_ASSOC);
          $action["id"] = $row["id"];
        }

        $actionIdQuoted = $this->db()->quote($action["id"]);
        $roleIdQuoted = $this->db()->quote($roleId);

        $sql = "INSERT INTO acl_roleaction(acl_action_id,acl_role_id)
                     VALUES ($actionIdQuoted,$roleIdQuoted)
                RETURNING id";

        $this->db()->query($sql);
      }

      $bResult = $this->db()->commit();
    }
    return $bResult;
  }

  /**
  * @param array ["id"=>string,"code"=>string,"label"=>string,"aclActions"=>["id","code","label"]]
  * @return boolean : true in case of success, false otherwise
  **/
  function update($aclRole){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aclRole]);
    $bResult=false;
    if($this->isAdmin()){

      $idQuoted = $this->db()->quote($aclRole["id"]);
      $codeQuoted = $this->db()->quote($aclRole["code"]);
      $labelQuoted = $this->db()->quote($aclRole["label"]);

      $this->db()->beginTransaction();

      $sql = "UPDATE acl_role
                 SET code = $codeQuoted,
                    label = $labelQuoted
               WHERE id = $idQuoted";

      $result = $this->db()->query($sql);
      $row = $result->fetch(PDO::FETCH_ASSOC);

      // Delete all previous role-action
      $sql = "DELETE FROM acl_roleaction
                    WHERE acl_role_id = $idQuoted";
      $result = $this->db()->query($sql);

      // Insert role-actions
      foreach($aclRole["actions"] as $action){
        if(!isset($action["id"])){
          // Insert action
          $codeQuoted = $this->db()->quote($action["code"]);
          $labelQuoted = $this->db()->quote($action["label"]);

          $this->log()->info(["method"=>__METHOD__,"message"=>"insert action","data"=>$action]);

          $sql = "INSERT INTO acl_action(code,label)
                       VALUES($codeQuoted,$labelQuoted)
                  RETURNING id";
          $result = $this->db()->query($sql);
          $row = $result->fetch(PDO::FETCH_ASSOC);
          $action["id"] = $row["id"];
        }

        $actionIdQuoted = $this->db()->quote($action["id"]);

        $sql = "INSERT INTO acl_roleaction(acl_action_id,acl_role_id)
                     VALUES ($actionIdQuoted,$idQuoted)
                RETURNING id";
 
        $this->db()->query($sql);
      }

      $bResult = $this->db()->commit();
    }
    return $bResult;
  }

  /**
  * Delete a role.
  * @param string $sRoleId : id of the role to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sRoleId){
    $query = "DELETE FROM acl_roleaction WHERE acl_role_id=" . $this->db()->quote($sRoleId);
    $this->db()->exec($query);
    $query = "DELETE FROM acl_role WHERE id=" . $this->db()->quote($sRoleId);
    return $this->db()->exec($query); 
  }
}