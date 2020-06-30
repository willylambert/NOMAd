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
 *  Class for site handling in database
 *  @creationdate 2018-09-13
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class SiteDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * Get the sites list (includes facilities, construction sites, etc.)
   * The input data array is expected to contain the following fields :
   *   statusCode, search (on label or code), startIndex, length, typeCode (CS, FA or CL)
   * @param array $aData : filtering data
   * @return array({object}) : array of Site objects
   */
  public function list($aData){

    $sLimitClause = $this->db()->getLimitClause($aData);
    $sOffsetClause = $this->db()->getOffsetClause($aData);
    $sSearchClause = $this->db()->getSearchClause($aData,array('site_main.code','site_main.label'));

    $sTypeCodeClause = "";
    if(isset($aData['typeCode']) && $aData['typeCode']!= null && $aData['typeCode']!= ""){
      $sTypeCodeString = $this->db()->quote($aData['typeCode']);
      $sTypeCodeClause = " AND th_type.code = $sTypeCodeString ";
    }

    $sStatusCodeClause = "";
    if(isset($aData['statusCode']) && $aData['statusCode']!= null && $aData['statusCode']!= ""){
      $sStatusCodeString = $this->db()->quote($aData['statusCode']);
      $sStatusCodeClause = " AND th_status.code = $sStatusCodeString ";
    }

    $sAccessRestrictionClause = $this->getAccessRestrictionClause();

    // The SQL JOIN with site_poi table aims at selecting the first POI on the site (if available)
    $query = "SELECT site_main.id,
                     site_main.code,
                     site_main.label,
                     site_main.site_main_id_entity,
                     entity.code AS site_main_code_entity,
                     entity.label AS site_main_label_entity,
                     site_main.status_th,
                     th_status.code AS status_code,
                     th_status.label AS status_label,
                     site_main.type_th,
                     th_type.code AS type_code,
                     th_type.label AS type_label,
                     site_poi.addr1,
                     site_poi.addr2,
                     site_poi.postcode,
                     site_poi.city,
                     site_poi.id AS poi_id,
                     ST_AsGeoJSON(site_poi.geom) AS poi_geom,
                     ST_X(geom) AS lng,
                     ST_Y(geom) AS lat,
                     site_poi.service_duration*1000 as service_duration
                FROM site_main
                $sAccessRestrictionClause
           LEFT JOIN site_poi ON site_poi.id = (
                  SELECT id
                    FROM site_poi
                   WHERE site_poi.site_main_id = site_main.id AND
                         geom IS NOT NULL AND
                         site_poi.rec_st<>'D'
                ORDER BY position
                   LIMIT 1 )
           LEFT JOIN site_main entity ON entity.id=site_main.site_main_id_entity
          INNER JOIN util_thesaurus th_status ON th_status.id=site_main.status_th
          INNER JOIN util_thesaurus th_type ON th_type.id=site_main.type_th
              WHERE site_main.rec_st<>'D'
                    $sTypeCodeClause
                    $sStatusCodeClause
                    $sSearchClause
              ORDER BY site_main.label
              $sLimitClause
              $sOffsetClause";
    $result = $this->db()->query($query);
    $aSites = $result->fetchAll(PDO::FETCH_ASSOC);
    foreach($aSites as &$aSite){
      $aSite["poi_geom"]=json_decode($aSite["poi_geom"],true);
    }
    return $aSites;
  }

  /**
  * Read the asked site
  * @param string $siteId : Site Reference
  * @return array site data
  **/
  public function get($siteId){
    $sAccessRestrictionClause = $this->getAccessRestrictionClause();
    $sSiteIdQuoted = $this->db()->quote($siteId);
    $sql = "SELECT
              site_main.id,
              site_main.code,
              site_main.site_main_id_entity,
              site_main.label,
              site_main.type_th,
              th_type.code AS type_code,
              th_type.label AS type_label,
              site_main.status_th,
              th_status.code AS status_code,
              th_status.label AS status_label,
              entity.code AS site_main_code_entity,
              entity.label AS site_main_label_entity,
              site_main.rec_st,
              site_poi.addr1,
              site_poi.addr2,
              site_poi.postcode,
              site_poi.city,
              site_poi.id AS poi_id,
              ST_AsGeoJSON(site_poi.geom) AS poi_geom,
              site_poi.service_duration*1000 as service_duration
         FROM site_main
         $sAccessRestrictionClause
    LEFT JOIN site_main entity ON entity.id=site_main.site_main_id_entity
   INNER JOIN util_thesaurus th_status ON th_status.id=site_main.status_th
   INNER JOIN util_thesaurus th_type ON th_type.id=site_main.type_th
    LEFT JOIN site_poi ON site_poi.id =
     (
      SELECT id
        FROM site_poi
       WHERE site_poi.site_main_id = site_main.id AND site_poi.geom IS NOT NULL AND site_poi.rec_st<>'D'
    ORDER BY site_poi.position
       LIMIT 1
      )
        WHERE site_main.id = $sSiteIdQuoted";
    $result = $this->db()->query($sql);
    $aSite = $result->fetch(PDO::FETCH_ASSOC);
    if(isset($aSite["poi_geom"])){
      $aSite["poi_geom"]=json_decode($aSite["poi_geom"],true);
    }
    return $aSite;
  }

  /**
  * Add a site
  * @param array $aData : data of the site to be inserted.
  * @return array created site with an id field
  */
  public function add($aData){
    $aReplacement = array(
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':site_main_id_entity'=>$aData['site_main_id_entity'],
      ':status_th'=>$aData['status_th'],
      ':rec_st'=>$aData['rec_st']
    );
    if(isset($aData['type_th'])){
      // Case where the site type identifier is provided
      $sSQL = "INSERT INTO site_main (code,label,site_main_id_entity,type_th,status_th,rec_st)
      VALUES (:code,:label,:site_main_id_entity,:type_th,:status_th,:rec_st)
      RETURNING id";
      $aReplacement[':type_th']=$aData['type_th'];
    }
    else{
      // Case where only the site type code is provided
      $sSQL = "INSERT INTO site_main (code,label,site_main_id_entity,type_th,status_th,rec_st)
      VALUES (
        :code,
        :label,
        :site_main_id_entity,
        ( SELECT id FROM util_thesaurus WHERE cat='SITE_MAIN_TYPE' AND code = :type_code ),
        :status_th,
        :rec_st)
      RETURNING id";
      $aReplacement[':type_code']=$aData['type_code'];
    }
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute($aReplacement);
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Site with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a site
  * @param array $aData : data of the site to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $bResult=false;
    if($this->hasAccess($aData['id'])){
      $sSQL = "UPDATE site_main
                  SET
                      code=:code,
                      label=:label,
                      site_main_id_entity=:site_main_id_entity,
                      type_th=:type_th,
                      status_th=:status_th,
                      rec_st=:rec_st
                WHERE id=:id";
      $oQuery = $this->db()->prepare($sSQL);
      try{
        $bResult= $oQuery->execute(array(
          ':id'=>$aData['id'],
          ':code'=>$aData['code'],
          ':label'=>$aData['label'],
          ':site_main_id_entity'=>$aData['site_main_id_entity'],
          ':type_th'=>$aData['type_th'],
          ':status_th'=>$aData['status_th'],
          ':rec_st'=>$aData['rec_st']
        ));
      }
      catch(Exception $e){
        if($e->getCode()==23505){
          throw new \OSS\AppException(
            "Site with code " . $aData['code'] . " already exists in database.",
            \OSS\AppException::ALREADY_EXISTS
          );
        }else{
          throw $e;
        }
      }
    }
    return $bResult;
  }

  /**
  * Mark a site as removed
  * @param string $sSiteID : id of the site to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sSiteID){
    $bResult=false;
    if($this->hasAccess($sSiteID)){    
      $query = "UPDATE site_main SET rec_st='D' WHERE id=" . $this->db()->quote($sSiteID);
      $bResult= $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a site.
  * @param string $sSiteID : id of the site to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sSiteID){
    $query = "DELETE FROM site_main WHERE id=" . $this->db()->quote($sSiteID);
    return $this->db()->exec($query);
  }

  /**
   * Return all site codes begining with the provided basename
   * @param string $sBaseName : a basename for code retrieval
   * @return array : array of codes.
   */
  public function listSiteCodes($sBaseName){
    $sBaseNameQuoted = $this->db()->quote("$sBaseName%");
    $sSQL = "SELECT code FROM site_main WHERE code ILIKE $sBaseNameQuoted";
    $result = $this->db()->query($sSQL);
    return array_column($result->fetchAll(PDO::FETCH_ASSOC),"code");
  }

  /**
   * List the opening hours for an institution site
   * The available input filters enable to target a specific institution id (siteId field) and a type for the
   *   opening period : opening period for pickup or opening period for delivery (bPickup field)
   * @param array $aData : filter with a siteId field (institution site id) and a bPickup field (boolean)
   * @return array : list of opening hours
   */
  public function listHours($aData){
    // Filter the timeslots based on the pickup/delivery information.
    $sPickupOrDeliveryClause = "";
    if(isset($aData['bPickup'])){
      // When bPickup parameter is set to true, we keep only opening hours that are associated to a pickup at the
      //   institution or in other words those which take place in the afternoon (PM)
      $sPickupOrDeliveryClause = " AND RIGHT(util_thesaurus.code,2) = ".($aData['bPickup'] ? "'PM'" : "'AM'")." ";
    }
    // Filter the timeslot id.
    $sTimeslotIdClause = "";
    if(isset($aData['timeslotId'])){
      $sTimeslotIdClause = " AND util_thesaurus.id = ".$this->db()->quote($aData['timeslotId'])." ";
    }
    // Filter by site id
    $sSiteIdClause = "";
    if(isset($aData['siteId']) && $aData['siteId']!=''){
      $sSiteIdClause = " AND site_hour.site_main_id = ".$this->db()->quote($aData['siteId'])." ";
    }
    // Filter by poi id
    $sPOIIdClause = "";
    $sPOIIdJoinClause = "";
    if(isset($aData['poiId']) && $aData['poiId']!=''){
      $sPOIIdJoinClause = " INNER JOIN site_poi ON site_poi.site_main_id = site_hour.site_main_id ";
      $sPOIIdClause = " AND site_poi.id = ".$this->db()->quote($aData['poiId'])." ";
    }
    $sAccessRestrictionClause = $this->getAccessRestrictionClause("site_hour","site_main_id");
    $sSQL = "SELECT
      site_hour.id,
      site_hour.site_main_id,
      util_thesaurus.id as timeslot_th,
      util_thesaurus.code as timeslot_code,
      util_thesaurus.label as timeslot_label,
      util_thesaurus.orderdisplay as timeslot_orderdisplay,
      util_thesaurus.rec_st as timeslot_rec_st,
      site_hour.start_hr*1000 as start_hr,
      site_hour.end_hr*1000 as end_hr
       FROM site_hour
       INNER JOIN util_thesaurus ON util_thesaurus.id = site_hour.timeslot_th
       $sAccessRestrictionClause
       $sPOIIdJoinClause
       WHERE site_hour.rec_st <> 'D'
             $sSiteIdClause
             $sPOIIdClause
             $sPickupOrDeliveryClause
             $sTimeslotIdClause";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
   * Insert an opening period for an institution site into the database
   * @param array $aOpeningPeriod : the opening period to be added
   * @return string : the created opening period id
   */
  public function addHours($aOpeningPeriod){
    $aResult=array();
    if($this->hasAccess($aOpeningPeriod['site_main_id'])){
      $aReplacement = array(
        ':site_main_id'=>$aOpeningPeriod['site_main_id'],
        ':timeslot_th'=>$aOpeningPeriod['timeslot_th'],
        ':start_hr'=>round($aOpeningPeriod['start_hr']/1000),
        ':end_hr'=>round($aOpeningPeriod['end_hr']/1000),
        ':rec_st'=>$aOpeningPeriod['rec_st']
      );
      $sSQL = "INSERT INTO site_hour (site_main_id,timeslot_th,start_hr,end_hr,rec_st)
                    VALUES (:site_main_id,:timeslot_th,:start_hr,:end_hr,:rec_st)
                    RETURNING id";
      $oQuery = $this->db()->prepare($sSQL);
      $oQuery->execute($aReplacement);
      $aResult = $oQuery->fetch(PDO::FETCH_ASSOC);
    }
    return $aResult;
  }

  /**
   * Update an opening period for an institution site in the database
   * @param array $aOpeningPeriod : the opening period to be update
   * @return boolean : whether the operation succeeded or not
   */
  public function updateHours($aOpeningPeriod){
    $bResult=false;
    if($this->hasAccess($aOpeningPeriod['site_main_id'])){    
      $aReplacement = array(
        ':id'=>$aOpeningPeriod['id'],
        ':site_main_id'=>$aOpeningPeriod['site_main_id'],
        ':timeslot_th'=>$aOpeningPeriod['timeslot_th'],
        ':start_hr'=>round($aOpeningPeriod['start_hr']/1000),
        ':end_hr'=>round($aOpeningPeriod['end_hr']/1000),
        ':rec_st'=>$aOpeningPeriod['rec_st']
      );
      $sSQL = "UPDATE site_hour
                  SET site_main_id=:site_main_id,
                      timeslot_th=:timeslot_th,
                      start_hr=:start_hr,
                      end_hr=:end_hr,
                      rec_st=:rec_st
                WHERE id=:id";
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute($aReplacement);
    }
    return $bResult;
  }

  /**
  * Mark a site opening period as removed
  * @param string $sSiteOpeningPeriodID : id of the site opening period to be removed.
  * @param string $sSiteID : id of the site (for access control check).
  * @return boolean : true if the operation succeeded
  */
  public function markHoursAsRemoved($sSiteOpeningPeriodID,$sSiteID){
    $bResult=false;
    if($this->hasAccess($sSiteID)){   
      $query = "UPDATE site_hour SET rec_st='D' WHERE id=" . $this->db()->quote($sSiteOpeningPeriodID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a site opening period.
  * @param string $sSiteOpeningPeriodID : id of the site opening period to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteHours($sSiteOpeningPeriodID){
    $query = "DELETE FROM site_hour WHERE id=" . $this->db()->quote($sSiteOpeningPeriodID);
    return  $this->db()->exec($query);
  }

  /**
   * Allow an user to access a site (institution)
   */
  public function addUserToSite($userMainId,$siteMainId){
    $this->log()->notice(["method"=>__METHOD__,"data"=>[$userMainId,$siteMainId]]);
    $sSQL = "INSERT INTO user_mainsite(site_main_id,user_main_id) VALUES (:siteMainId,:userMainId)";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute([":siteMainId"=>$siteMainId,":userMainId"=>$userMainId]);
  }
}