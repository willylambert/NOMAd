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
use Exception;

class UserDAO extends \OSS\BaseObject{

  /**
  * default constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of user
  * Accepted input filters : search, statusCode, typeCodes (comma separated list)
  * @return array of ["id"=>string,"login"=>string,"firstname"=>string,"lastname"=>string,"roles"=>["id","code","label"]]
  **/
  function list($filters){

    $sLimitClause = $this->db()->getLimitClause($filters);
    $sOffsetClause = $this->db()->getOffsetClause($filters);
    $sSearchClause = $this->db()->getSearchClause($filters,array("user_main.login","user_main.firstname","user_main.lastname"));

    $sStatusCodeClause = "";
    if(isset($filters['statusCode']) && $filters['statusCode']!= null && $filters['statusCode']!= ""){
      $sStatusCodeString = $this->db()->quote($filters['statusCode']);
      $sStatusCodeClause = " AND th_status.code = $sStatusCodeString ";
    }

    $sTypeCodesClause = "";
    if(isset($filters['typeCodes']) && $filters['typeCodes']!= null && $filters['typeCodes']!= ""){
      $aTypeCodes = explode(',',$filters['typeCodes']);
      $sTypeCodes = '';
      foreach($aTypeCodes as $sTypeCode){
        if($sTypeCodes!=''){
          $sTypeCodes.= ' OR ';
        }
        $sTypeCodeQuoted = $this->db()->quote($sTypeCode);
        $sTypeCodes.=" th_type.code = $sTypeCodeQuoted ";
      }
      if($sTypeCodes!=''){
        $sTypeCodesClause= " AND ( $sTypeCodes ) ";
      }
    }

    $sAccessRestrictionClause = $this->getUserAccessRestrictionClause();

    $sql = "SELECT
              user_main.id,
              login,
              firstname,
              lastname,
              th_status.label AS status_label,
              th_type.label AS type_label,
              json_agg(json_build_object('id',acl_role.id,'label',acl_role.label)) as roles
            FROM
              user_main
            INNER JOIN util_thesaurus th_status ON th_status.id=user_main.status_th
            INNER JOIN util_thesaurus th_type ON th_type.id=user_main.type_th
            LEFT JOIN acl_roleuser ON acl_roleuser.user_main_id=user_main.id 
            LEFT JOIN acl_role ON acl_role.id = acl_roleuser.acl_role_id
              WHERE user_main.rec_st<>'D'
                    $sAccessRestrictionClause
                    $sStatusCodeClause
                    $sTypeCodesClause
                    $sSearchClause
              $sLimitClause
              $sOffsetClause
              GROUP BY user_main.id,login,firstname,lastname,th_status.label,th_type.label
              ORDER BY user_main.id";

    $result = $this->db()->query($sql);
    $users = $result->fetchAll(PDO::FETCH_ASSOC);

    return $users;
  }

   /**
   * List the HRs linked to a user
   * @param string id : the user id
   * @return array : a list of HRs
   */
  function listHRs($id){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$id]]);
    $idQuoted = $this->db()->quote($id);
    $sSQL = "SELECT hr_main.id,
                    hr_main.lastname,
                    hr_main.firstname,
                    th_gender.label AS gender_label,
                    CAST(hr_main.birthday_dt AS bigint)*1000 as birthday_dt,
                    th_status.label AS status_label,
                    th_type.label AS type_label,
                    demands.count as demands_count
                FROM hr_main
                INNER JOIN user_mainhr ON user_mainhr.hr_main_id=hr_main.id AND user_mainhr.user_main_id=$idQuoted
                LEFT JOIN util_thesaurus th_gender ON th_gender.id=hr_main.gender_th
                INNER JOIN util_thesaurus th_status ON th_status.id=hr_main.status_th
                INNER JOIN util_thesaurus th_type ON th_type.id=hr_main.type_th
                LEFT JOIN (
                      SELECT hr_main2.id as hr_main_id, count(transport_demand.id)
                        FROM hr_main as hr_main2
                  INNER JOIN transport_demand ON transport_demand.hr_main_id=hr_main2.id
                    GROUP BY hr_main2.id
                    ) AS demands ON demands.hr_main_id = hr_main.id
                WHERE hr_main.rec_st<>'D'";
    $result = $this->db()->query($sSQL);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Return user information
  * @param string $id : id of the user.
  * @return array with login,firstname,lastname,status
  **/
  function get($id){
    $sAccessRestrictionClause = $this->getUserAccessRestrictionClause();
    $idQuoted = $this->db()->quote($id);
    $sSql = "SELECT user_main.id,
                    user_main.login,
                    user_main.firstname,
                    user_main.lastname,
                    user_main.status_th,
                    user_main.type_th,
                    th_type.code as type_code,
                    CAST(lastconnection_dt AS bigint)*1000 as lastconnection_dt
               FROM user_main
         INNER JOIN util_thesaurus th_type ON th_type.id=user_main.type_th
              WHERE user_main.id = $idQuoted
                    $sAccessRestrictionClause";
    $oResult = $this->db()->query($sSql);
    $user = $oResult->fetch(PDO::FETCH_ASSOC);
    if(isset($user["id"])){

      $sql = "SELECT acl_role.id,code,label
                FROM acl_role
          INNER JOIN acl_roleuser ON acl_role.id = acl_roleuser.acl_role_id
               WHERE user_main_id=$idQuoted";

      $result = $this->db()->query($sql);
      $user["roles"] = $result->fetchAll(PDO::FETCH_ASSOC);

      $sql = "SELECT site_main.id,site_main.code,site_main.label,th_type.label AS type_label,th_type.code AS type_code
                FROM site_main
          INNER JOIN user_mainsite ON user_mainsite.site_main_id = site_main.id
          INNER JOIN util_thesaurus AS th_type ON th_type.id = site_main.type_th
               WHERE user_mainsite.user_main_id=$idQuoted";

      $result = $this->db()->query($sql);
      $user["sites"] = $result->fetchAll(PDO::FETCH_ASSOC);
      $user["hrs"] = $this->listHRs($id);
    }

    return $user;
  }

  /**
   *  Generate a INNER JOIN SQL cause to insert in a SQL SELECT query so as to restrict access
   *    to a list of user_main.
   * @return string : a INNER JOIN SQL clause to insert in a SQL query
   */
  public function getUserAccessRestrictionClause(){
    $sAccessRestrictionClause = "";
    if(!$this->isAdmin()){
      $sUserIdQuoted = $this->db()->quote($this->getSessionUserId());
      $sAccessRestrictionClause = " AND user_main.id = $sUserIdQuoted ";
    }
    return $sAccessRestrictionClause;
  }

  /**
  * @param array ["id"=>string,"login"=>string,"firstname"=>string,"lastname"=>string,"status_th"=>string,"type_th"=>string]
  * @return new user Id
  **/
  function add($user){
    $sUserId=null;
    // In the current version, creation of new users is granted only to admin users
    if($this->isAdmin()){
      $loginQuoted = $this->db()->quote($user["login"]);
      $passwdQuoted = $this->db()->quote($user["passwd"]);
      $firstnameQuoted = $this->db()->quote($user["firstname"]);
      $lastnameQuoted = $this->db()->quote($user["lastname"]);
      $statusQuoted = $this->db()->quote($user["status_th"]);
      $typeQuoted = $this->db()->quote($user["type_th"]);

      $sql = "INSERT INTO user_main(login,passwd,firstname,lastname,status_th,type_th)
                   VALUES($loginQuoted,crypt($passwdQuoted,gen_salt('bf')::text),$firstnameQuoted,$lastnameQuoted,$statusQuoted,$typeQuoted)
              RETURNING id";

      $result = $this->db()->query($sql);
      $row = $result->fetch(PDO::FETCH_ASSOC);

      // Get user id
      $user["id"]=$row["id"];
      $idQuoted = $this->db()->quote($user["id"]);

      // Insert role-users, sites and hrs
      $this->addRoles($user);
      $this->addSites($user);
      $this->addHRs($user);

      $sUserId = $row["id"];
    }
    return $sUserId;
  }

  /*
   * Get user type (assuming database contains the actual user type)
   **/
  function getUserTypeCode($sUserId){
    $idQuoted = $this->db()->quote($sUserId);
    $sql = "SELECT util_thesaurus.code AS type_code
              FROM user_main
        INNER JOIN util_thesaurus ON util_thesaurus.id = user_main.type_th
             WHERE user_main.id=$idQuoted";
    $result = $this->db()->query($sql);
    return $result->fetch(PDO::FETCH_ASSOC)['type_code'];
  }

  /**
   * Remove the roles associated to a user
   * @param array $user : the user for which we need remove the roles
   */
  function removeRoles($user){
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      $sql = "DELETE FROM acl_roleuser WHERE user_main_id = $idQuoted";
      $result = $this->db()->query($sql);
    }
  }

  /**
   * Add the roles to a user. The roles can be provided in $user["roles"] but in case of a user :
   *  - with CLIENT type, the provided roles will be ignored and only "USER" role will be granted
   *  - with DRIVER type, the provided roles will be ignored and only "DRIVER" role will be granted
   *  - with INSTITUTION type, the provided roles will be ignored and only "INSTITUTION" role will be granted
   *  - with TRANSPORT_ORGANIZER type, the provided roles will be ignored and only "TRANSPORT_ORGANIZER" role will be granted
   * @param array $user : a user for which we need to add some roles
   */
  function addRoles($user){
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      $sUserTypeCode=$this->getUserTypeCode($user["id"]);
      $sql ="";
      if($sUserTypeCode=="ADMIN"){
        // Insert role-users
        foreach($user["roles"] as $role){
          $roleIdQuoted = $this->db()->quote($role["id"]);
          $sql = "INSERT INTO acl_roleuser(acl_role_id,user_main_id) VALUES ($roleIdQuoted,$idQuoted)";
        }
      }
      else{
        // In the current version, for users with a non-admin, there will be exactly one role, which is defined
        //   automatically according to the user type, and the user role code will be the same code as the user type
        $aTypeToRoleCodes=array(
          "CLIENT"=>"'USER'",
          "DRIVER"=>"'DRIVER'",
          "INSTITUTION"=>"'INSTITUTION'",
          "TRANSPORT_ORGANIZER"=>"'TRANSPORT_ORGANIZER'"
        );
        if(array_key_exists($sUserTypeCode,$aTypeToRoleCodes)){
          $sUserRoleCode = $aTypeToRoleCodes[$sUserTypeCode];
          $sql = "INSERT INTO acl_roleuser(acl_role_id,user_main_id)
                   VALUES ((SELECT id FROM acl_role WHERE code=$sUserRoleCode),$idQuoted)";
        }        
      }
      if($sql==""){
        throw new \OSS\AppException(
          "User type code " . $sUserTypeCode . " is not recognized.",
          \OSS\AppException::SAVE_INTO_DATABASE_FAILED
        );
      }
      else{
        $this->db()->query($sql);
      }
    }
  }

  /**
   * Remove the sites associated to a user
   * @param array $user : the user for which we need remove the sites
   */
  function removeSites($user){
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      $sql = "DELETE FROM user_mainsite WHERE user_main_id = $idQuoted";
      $result = $this->db()->query($sql);
    }
  }

  /**
   * Add the sites to a user. The sites can be provided in $user["sites"] but in case of a user with CLIENT type,
   *   the provided sites will be ignored and the home sites of the associated users will be added to the user
   * @param array $user : should contain an id field and a "sites" field (or a "hrs" field is the user type is CLIENT)
   */
  function addSites($user){
    $this->log()->info(["method"=>__METHOD__,"data"=>[$user]]);
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      $sUserTypeCode=$this->getUserTypeCode($user["id"]);
      // First we will collect the ids of the elements of site_main we need to associate to the $user in user_mainsite table
      $aSiteMainIdsToInsert=array();
      switch($sUserTypeCode){
        case 'CLIENT':
          // In case of a user with 'CLIENT' type, the sites are not supposed to be defined on client side
          // Instead, we add a site for each found HR home (normally one home per HR)
          $sHRIdList = '';
          foreach($user["hrs"] as $HR){
            if($sHRIdList!=''){
              $sHRIdList.=',';
            }
            $sHRIdList.=$this->db()->quote($HR["id"]);
          }
          if($sHRIdList!=''){
            $sSQL = "SELECT distinct site_main.id  FROM site_main
                     INNER JOIN hr_mainsite ON site_main.id=hr_mainsite.site_main_id
                     INNER JOIN hr_main ON hr_main.id=hr_mainsite.hr_main_id
                     INNER JOIN util_thesaurus ON hr_mainsite.type_th = util_thesaurus.id
                        WHERE hr_main.id IN ($sHRIdList)
                          AND util_thesaurus.code='HOME'";
            $result = $this->db()->query($sSQL);
            $aSiteMainIdsToInsert = array_column($result->fetchAll(PDO::FETCH_ASSOC),'id');
          }
          break;
        case 'INSTITUTION':
        case 'TRANSPORT_ORGANIZER':
          // In case of a user with 'INSTITUTION' or TRANSPORT_ORGANIZER type, only the INSTITUTION sites are
          //   supposed to be defined on client side. The provided list of sites is given in $user["sites"]
          // In this list of sites, we will get only those corresponding to institutions
          // Then for each of this institution, we will collect all the home sites of hrs that are attached
          // to these institutions
          $sInstitutionIdList = '';
          foreach($user["sites"] as $aSite){
            if($aSite["type_code"]=='INSTITUTION'){
              if($sInstitutionIdList!=''){
                $sInstitutionIdList.=',';
              }
              $sInstitutionIdList.=$this->db()->quote($aSite["id"]);
              // Add the institution id to the list of site ids to be inserted
              $aSiteMainIdsToInsert[]=$aSite["id"];
            }
          }
          if($sInstitutionIdList!=""){      
            $sSQL = "SELECT distinct site_main.id  FROM site_main
                INNER JOIN hr_mainsite AS hr_mainsite_home ON site_main.id=hr_mainsite_home.site_main_id
                INNER JOIN hr_main ON hr_main.id=hr_mainsite_home.hr_main_id
                INNER JOIN util_thesaurus AS th_type_home ON hr_mainsite_home.type_th = th_type_home.id AND th_type_home.code='HOME'
                INNER JOIN hr_mainsite AS hr_mainsite_institution ON hr_main.id=hr_mainsite_institution.hr_main_id
                INNER JOIN util_thesaurus AS th_type_institution ON hr_mainsite_institution.type_th = th_type_institution.id AND th_type_institution.code='INSTITUTION'
                     WHERE hr_mainsite_institution.site_main_id IN ($sInstitutionIdList)";
            $result = $this->db()->query($sSQL);
            $aSiteMainIdsToInsert = array_merge($aSiteMainIdsToInsert,array_column($result->fetchAll(PDO::FETCH_ASSOC),'id'));
          }
          break;
        default:
          $aSiteMainIdsToInsert = array_column($aSite,'id'); 
          break;
      }
      // Make sure there are no duplicated ids in the resulting array
      $aSiteMainIdsToInsert = array_unique($aSiteMainIdsToInsert);
      $sValues = "";
      foreach($aSiteMainIdsToInsert as $sSiteMainIdToInsert){
        if($sValues!=''){
          $sValues.=',';
        }
        $sValues.= "(".$this->db()->quote($sSiteMainIdToInsert).','.$idQuoted.")";
      }
      if($sValues!=""){
        $sql = "INSERT INTO user_mainsite(site_main_id,user_main_id) VALUES $sValues";
        $this->db()->query($sql);
      }
    }
  }

  /**
   * Remove the HRs associated to a user
   * @param array $user : the user for which we need remove the associated HRs
   */
  function removeHRs($user){
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      $sql = "DELETE FROM user_mainhr WHERE user_main_id = $idQuoted";
      $result = $this->db()->query($sql);
    }
  }

  /**
   * Add the HRs to a user
   */
  function addHRs($user){
    if(isset($user["id"]) && $user["id"]!=""){
      $idQuoted = $this->db()->quote($user["id"]);
      // Insert hr-users
      foreach($user["hrs"] as $HR){
        $sHRIdQuoted = $this->db()->quote($HR["id"]);
        $sql = "INSERT INTO user_mainhr(hr_main_id,user_main_id) VALUES ($sHRIdQuoted,$idQuoted)";
        $this->db()->query($sql);
      }
    }
  }

  /**
  * @param array ["id"=>string,"login"=>string,"firstname"=>string,"lastname"=>string,"status_th"=>string,"type_th"=>string,"roles"=>["id","code","label"]]
  * @return boolean : true in case of success, false otherwise
  **/
  function update($user){
    // In the current version, update of users is granted only to admin users (except for password update, granted to all)
    if($this->isAdmin()){
      $idQuoted = $this->db()->quote($user["id"]);
      $loginQuoted = $this->db()->quote($user["login"]);
      $firstnameQuoted = $this->db()->quote($user["firstname"]);
      $lastnameQuoted = $this->db()->quote($user["lastname"]);
      $statusQuoted = $this->db()->quote($user["status_th"]);
      $typeQuoted = $this->db()->quote($user["type_th"]);

      $this->db()->beginTransaction();
  
      if(isset($user["passwd"]) && $user["passwd"]!=''){
        // Password is defined, we can update it
        $passwdQuoted = $this->db()->quote($user["passwd"]);
        $sql = "UPDATE user_main
                   SET login = $loginQuoted,
                       passwd = crypt($passwdQuoted,gen_salt('bf')::text),
                       firstname = $firstnameQuoted,
                       lastname = $lastnameQuoted,
                       status_th = $statusQuoted,
                       type_th = $typeQuoted
                 WHERE id = $idQuoted";
      }
      else{
        // Password is not defined or is empty : removing a password is not a good practice
        //   so we just leave the password unmodified
        $sql = "UPDATE user_main
                   SET login = $loginQuoted,
                       firstname = $firstnameQuoted,
                       lastname = $lastnameQuoted,
                       status_th = $statusQuoted,
                       type_th = $typeQuoted
                 WHERE id = $idQuoted";
      }

      $result = $this->db()->query($sql);
      $row = $result->fetch(PDO::FETCH_ASSOC);

      // Update role-users, sites and HRd
      $this->removeRoles($user);
      $this->removeSites($user);
      $this->removeHRs($user);
      $this->addRoles($user);
      $this->addSites($user);
      $this->addHRs($user);

      $this->db()->commit();
    }
  }


  /**
  * Update the password fo a user
  * @param array ["id"=>string,"passwd"=>string, and other fields]]
  * @return integer : number of affected rows
  **/
  function updatePassword($user){
    $idQuoted = $this->db()->quote($user["id"]);
    $passwdQuoted = $this->db()->quote($user["passwd"]);
    $sql = "UPDATE user_main
               SET passwd = crypt($passwdQuoted,gen_salt('bf')::text),
                   lastconnection_dt = ".time()."
             WHERE id = $idQuoted";
    return $this->db()->exec($sql);
  }

  /**
  * Mark a user as removed
  * @param string $sUserID : id of the user to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sUserID){
    $bResult = false;
    if($this->isAdmin()){      
      $query = "UPDATE user_main SET rec_st='D' WHERE id=" . $this->db()->quote($sUserID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a user.
  * @param string $sUserId : id of the user to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sUserId){
    $query = "DELETE FROM acl_roleuser WHERE user_main_id=" . $this->db()->quote($sUserId);
    $this->db()->exec($query);
    $query = "DELETE FROM user_mainsite WHERE user_main_id=" . $this->db()->quote($sUserId);
    $this->db()->exec($query);
    $query = "DELETE FROM user_mainhr WHERE user_main_id=" . $this->db()->quote($sUserId);
    $this->db()->exec($query);
    $query = "DELETE FROM user_main WHERE id=" . $this->db()->quote($sUserId);
    return $this->db()->exec($query);
  }

  /**
   * Update all the access restrictions for all users that are concerned by the provided institution ID
   *   so as to allow access to the provided HR ID. This function makes the assumption that there is no current
   *   link between the input HR and the input institution
   * @param $sHRId string : the involved HRId
   * @param $sInstitutionSiteId string : the involved institution site id
   */
  public function addHRToInstitution($sHRId,$sInstitutionSiteId){
    // 1) Find the users that are concerned by the institution site
    $sInstitutionSiteIdQuoted = $this->db()->quote($sInstitutionSiteId);
    $sSQL = "SELECT user_main.id
               FROM user_main
         INNER JOIN util_thesaurus th_type ON th_type.id=user_main.type_th
         INNER JOIN user_mainsite ON user_mainsite.user_main_id=user_main.id
              WHERE (th_type.code='INSTITUTION' OR th_type.code='TRANSPORT_ORGANIZER')
                AND user_mainsite.site_main_id=$sInstitutionSiteIdQuoted";
    $result = $this->db()->query($sSQL);
    $aUsers = $result->fetchAll(PDO::FETCH_ASSOC);
    // 2) Find the Homes that are concerned by the HR (normally one)
    $sHRIdQuoted = $this->db()->quote($sHRId);
    $sSQL = "SELECT site_main.id  FROM site_main
         INNER JOIN hr_mainsite ON site_main.id=hr_mainsite.site_main_id
         INNER JOIN hr_main ON hr_main.id=hr_mainsite.hr_main_id
         INNER JOIN util_thesaurus ON hr_mainsite.type_th = util_thesaurus.id
              WHERE hr_main.id = $sHRIdQuoted
                AND util_thesaurus.code='HOME'";
    $result = $this->db()->query($sSQL);
    $aHome = $result->fetch(PDO::FETCH_ASSOC);
    $sValues = '';
    foreach($aUsers as $aUser){
      if($sValues!=''){
        $sValues.=',';
      }
      $sValues.='('.$this->db()->quote($aHome['id']).','.$this->db()->quote($aUser['id']).')';
    }
    if($sValues!=''){
      $sSQL = "INSERT INTO user_mainsite(site_main_id,user_main_id) VALUES $sValues";
      $this->db()->query($sSQL);
    }
  }

  /**
   * Update all the access restrictions for all users that are concerned by the provided institution ID
   *   so as to remove access to the provided HR ID
   * @param $sHRId string : the involved HRId
   * @param $sInstitutionSiteId string : the involved institution site id
   */
  public function removeHRFromInstitution($sHRId,$sInstitutionSiteId){
    // 1) Find the users that are concerned by the institution site
    $sInstitutionSiteIdQuoted = $this->db()->quote($sInstitutionSiteId);
    $sSQL = "SELECT user_main.id
               FROM user_main
         INNER JOIN util_thesaurus th_type ON th_type.id=user_main.type_th
         INNER JOIN user_mainsite ON user_mainsite.user_main_id=user_main.id
              WHERE (th_type.code='INSTITUTION' OR th_type.code='TRANSPORT_ORGANIZER')
                AND user_mainsite.site_main_id=$sInstitutionSiteIdQuoted";
    $result = $this->db()->query($sSQL);
    $aUsers = $result->fetchAll(PDO::FETCH_ASSOC);
    // 2) Find the Homes that are concerned by the HR (normally one)
    $sHRIdQuoted = $this->db()->quote($sHRId);
    $sSQL = "SELECT site_main.id  FROM site_main
         INNER JOIN hr_mainsite ON site_main.id=hr_mainsite.site_main_id
         INNER JOIN hr_main ON hr_main.id=hr_mainsite.hr_main_id
         INNER JOIN util_thesaurus ON hr_mainsite.type_th = util_thesaurus.id
              WHERE hr_main.id = $sHRIdQuoted
                AND util_thesaurus.code='HOME'";
    $result = $this->db()->query($sSQL);
    $aHome = $result->fetch(PDO::FETCH_ASSOC);
    $sHomeClause = ' site_main_id = '.$this->db()->quote($aHome['id']);
    $sUsersClause = "";
    foreach($aUsers as $aUser){
      if($sUsersClause!=''){
        $sUsersClause.=' OR ';
      }
      $sUsersClause.=' user_main_id='.$this->db()->quote($aUser['id']) ;
    }
    if($sUsersClause!=''){
      $sSQL = "DELETE FROM user_mainsite WHERE $sHomeClause AND ( $sUsersClause )";
      $this->db()->query($sSQL);
    }
  }

}