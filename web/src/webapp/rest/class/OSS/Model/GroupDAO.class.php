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
 *  Class for groups of demands handling in database
 *  @creationdate 2019-04-03
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class GroupDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * Get the groups list
   * The input data array is expected to contain some filters
   * @param array $aData : filtering data
   * @param boolean $bWithAccessRestriction : enable to request a list with or without access restriction
   * @return array({object}) : array of Group objects
   */
  public function list($aData,$bWithAccessRestriction=true){
    $sInstitutionAccessRestrictionClause = "";
    $sHRAccessRestrictionClause = "";
    if($bWithAccessRestriction){
      $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
      $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');
    }
    $sSearchClause = $this->db()->getSearchClause($aData,array('transport_group.label'));
    $sQuery = "SELECT transport_group.id,
                      transport_group.label,
                      count(transport_demand) as demands_count
                FROM transport_group
          LEFT JOIN transport_groupdemand ON transport_group.id = transport_groupdemand.transport_group_id
                                          AND transport_groupdemand.rec_st <> 'D'
          LEFT JOIN transport_demand ON transport_demand.id = transport_groupdemand.transport_demand_id
                                      AND transport_demand.rec_st<>'D'
          LEFT JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                                    AND site_poi_institution.rec_st<>'D'
                                                    AND site_poi_institution.geom IS NOT NULL
          $sInstitutionAccessRestrictionClause
          LEFT JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                            AND site_poi_hr.rec_st<>'D'
                                            AND site_poi_hr.geom IS NOT NULL
          $sHRAccessRestrictionClause
              WHERE transport_group.rec_st<>'D'
                    $sSearchClause
             GROUP BY transport_group.id,
                      transport_group.label,
                      transport_group.rec_st";
    $result = $this->db()->query($sQuery);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Read the asked group
  * @param string $groupId : Group Reference
  * @param boolean $bWithAccessRestriction : enable to request a group with or without access restriction
  * @return array group data
  **/
  public function get($groupId,$bWithAccessRestriction=true){
    $sInstitutionAccessRestrictionClause = "";
    $sHRAccessRestrictionClause = "";
    if($bWithAccessRestriction){
      $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_institution','site_main_id');
      $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_poi_hr','site_main_id');
    }  
    $sGroupIdQuoted = $this->db()->quote($groupId);
    $sQuery = "SELECT transport_group.id,
                      transport_group.label,
                      transport_group.rec_st,
                      json_agg(json_build_object(
                       'id',transport_demand.id,
                       'site_poi_id_institution',transport_demand.site_poi_id_institution,
                       'start_dt',CAST(transport_demand.start_dt as bigint)*1000,
                       'end_dt',CAST(transport_demand.end_dt as bigint)*1000,
                       'site_poi_label_institution',site_poi_institution.label,
                       'institution_id',site_main_institution.id,
                       'institution_label',site_main_institution.label,
                       'site_poi_type_code_institution',site_poi_type_institution.code,
                       'site_poi_geom_institution',ST_AsGeoJSON(site_poi_institution.geom),
                       'site_poi_id_hr',transport_demand.site_poi_id_hr,
                       'site_poi_label_hr',site_poi_hr.label,
                       'hr_firstname',hr_main.firstname,
                       'hr_lastname',hr_main.lastname,
                       'hr_main_id',transport_demand.hr_main_id,
                       'site_poi_type_code_hr',site_poi_type_hr.code,
                       'site_poi_geom_hr',ST_AsGeoJSON(site_poi_hr.geom)
                     )) as demands
FROM transport_group
LEFT JOIN transport_groupdemand ON transport_group.id = transport_groupdemand.transport_group_id
                                AND transport_groupdemand.rec_st <> 'D'
LEFT JOIN transport_demand ON transport_demand.id = transport_groupdemand.transport_demand_id
                           AND transport_demand.rec_st<>'D'
INNER JOIN site_poi as site_poi_institution ON transport_demand.site_poi_id_institution = site_poi_institution.id
                                           AND site_poi_institution.rec_st<>'D'
                                           AND site_poi_institution.geom IS NOT NULL
$sInstitutionAccessRestrictionClause
LEFT JOIN site_main as site_main_institution ON site_poi_institution.site_main_id = site_main_institution.id
                                             AND site_main_institution.rec_st<>'D'
LEFT JOIN util_thesaurus as site_poi_type_institution ON site_main_institution.type_th = site_poi_type_institution.id
INNER JOIN site_poi as site_poi_hr ON transport_demand.site_poi_id_hr = site_poi_hr.id
                                  AND site_poi_hr.rec_st<>'D'
                                  AND site_poi_hr.geom IS NOT NULL
$sHRAccessRestrictionClause
LEFT JOIN site_main as site_main_hr ON site_poi_hr.site_main_id = site_main_hr.id
                                    AND site_main_hr.rec_st<>'D'
LEFT JOIN util_thesaurus as site_poi_type_hr ON site_main_hr.type_th = site_poi_type_hr.id
LEFT JOIN hr_main ON transport_demand.hr_main_id = hr_main.id
                  AND hr_main.rec_st<>'D'
               WHERE transport_group.id=$sGroupIdQuoted
            GROUP BY transport_group.id,
                      transport_group.label,
                      transport_group.rec_st";
    $result = $this->db()->query($sQuery);
    $aResult = $result->fetch(PDO::FETCH_ASSOC);
    if(isset($aResult["id"])){
      $aResult["demands"]=json_decode($aResult["demands"],true);
      foreach($aResult["demands"] as &$aDemand){
        $aDemand["institutionPOI"]=array(
          "id"=>$aDemand["site_poi_id_institution"],
          "label"=>$aDemand["site_poi_label_institution"],
          "site_main_id"=>$aDemand["institution_id"],
          "site_main_label"=>$aDemand["institution_label"],
          "site_type_code"=>$aDemand["site_poi_type_code_institution"],
          "geom"=>json_decode($aDemand["site_poi_geom_institution"],true)
        );
        unset($aDemand["site_poi_id_institution"]);
        unset($aDemand["site_poi_label_institution"]);
        unset($aDemand["institution_id"]);
        unset($aDemand["institution_label"]);
        unset($aDemand["site_poi_type_code_institution"]);
        unset($aDemand["site_poi_geom_institution"]);
        $aDemand["HRPOI"]=array(
          "id"=>$aDemand["site_poi_id_hr"],
          "label"=>$aDemand["site_poi_label_hr"],
          "hr_firstname"=>$aDemand["hr_firstname"],
          "hr_lastname"=>$aDemand["hr_lastname"],
          "hr_id"=>$aDemand["hr_main_id"],
          "site_type_code"=>$aDemand["site_poi_type_code_hr"],
          "geom"=>json_decode($aDemand["site_poi_geom_hr"],true)
        );
        unset($aDemand["site_poi_id_hr"]);
        unset($aDemand["site_poi_label_hr"]);
        unset($aDemand["hr_firstname"]);
        unset($aDemand["hr_lastname"]);
        unset($aDemand["hr_main_id"]);
        unset($aDemand["site_poi_type_code_hr"]);
        unset($aDemand["site_poi_geom_hr"]);
      }
    }
    else{
      $aResult["demands"] = array();
    }
    return $aResult;
  }

  /**
  * Add a group
  * @param array $aData : data of the group to be inserted.
  * @return array created group with an id field
  */
  public function add($aData){
    $sSQL = "INSERT INTO transport_group (
                           label,
                           rec_st)
                VALUES (
                         :label,
                         :rec_st)
                RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':label'=>$aData['label'],
      ':rec_st'=>$aData['rec_st']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a group
  * @param array $aData : data of the group to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $sSQL = "UPDATE transport_group
                SET
                  label=:label,
                  rec_st=:rec_st
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    $bResult=false;
    $bResult= $oQuery->execute(array(
      ':id'=>$aData['id'],
      ':label'=>$aData['label'],
      ':rec_st'=>$aData['rec_st']
    ));
    return $bResult;
  }

  /**
  * Mark a group as removed
  * @param string $sGroupID : id of the group to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sGroupID){
    $query = "UPDATE transport_group SET rec_st='D' WHERE id=" . $this->db()->quote($sGroupID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a group.
  * @param string $sGroupID : id of the group to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sGroupID){
    $bResult = false;
    if($this->isAdmin()){
      $query = "DELETE FROM transport_groupdemand WHERE transport_group_id=" . $this->db()->quote($sGroupID);
      $this->db()->exec($query);
      $query = "DELETE FROM transport_group WHERE id=" . $this->db()->quote($sGroupID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Get a list of demands based on search criteria
  * The input data array is expected to contain some filters
  * @param array $aData : filtering data
  * @return array({object}) : array of demands
  **/
  public function listDemands($aData){
    $sGroupIDClause = "";
    if(isset($aData['groupId']) && $aData['groupId']!= null && $aData['groupId']!= ""){
      $sGroupIDQuoted = $this->db()->quote($aData['groupId']);
      $sGroupIDClause = " AND transport_groupdemand.transport_group_id = $sGroupIDQuoted ";
    }
    $sql = "SELECT
                   transport_groupdemand.id,
                   transport_groupdemand.transport_group_id,
                   transport_groupdemand.transport_demand_id
              FROM transport_groupdemand
             WHERE true
                   $sGroupIDClause";
    $result = $this->db()->query($sql);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Add a new demand
  * @param array $aData : data of the demand to be added.
  * @return array created demand with an id field
  */
  public function addDemand($aData){
    $sSQL = "INSERT INTO transport_groupdemand (transport_group_id,transport_demand_id)
              VALUES (:transport_group_id,:transport_demand_id)
              RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':transport_group_id'=>$aData['transport_group_id'],
      ':transport_demand_id'=>$aData['id']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Delete a demand.
  * @param string $sDemandID : id of the demand to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteDemand($sDemandID){
    $query = "DELETE FROM transport_groupdemand WHERE id=" . $this->db()->quote($sDemandID);
    $this->log()->info($query);
    return $this->db()->exec($query);
  }

}