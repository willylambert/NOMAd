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
 *  Class to handle DB access for POIs (Points of Interest)
 *  @creationdate 2018-09-13
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

/**
* Class for handling requests to the POI table in the database.
*/
class POIDAO extends BaseObject{

  /**
  * Constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of POIs based on search criteria. Output POIs will be sorted by site_main_id and by position
  * The input data array is expected to contain the following fields :
  *   siteId, siteType, hrId, siteStatus
  * @param array $aData : filtering data
  * @return array({object}) : array of POI object
  **/
  public function list($aData){
    $sSiteIDClause = "";
    if(isset($aData['siteId']) && $aData['siteId']!= null && $aData['siteId']!= ""){
      $sSiteIDQuoted = $this->db()->quote($aData['siteId']);
      $sSiteIDClause = " AND site_poi.site_main_id = $sSiteIDQuoted ";
    }
    $sSiteTypeClause = "";
    if(isset($aData['siteType']) && $aData['siteType']!= null && $aData['siteType']!= ""){
      $sSiteTypeQuoted = $this->db()->quote($aData['siteType']);
      $sSiteTypeClause = " AND th_type.code = $sSiteTypeQuoted ";
    }
    $sHRIdJoin = "";
    if(isset($aData['hrId']) && $aData['hrId']!= null && $aData['hrId']!= ""){
      $sSiteTypeQuoted = $this->db()->quote($aData['hrId']);
      $sHRIdJoin = "INNER JOIN hr_mainsite as hr on hr.site_main_id=site_main.id  AND hr.hr_main_id = $sSiteTypeQuoted
                    INNER JOIN util_thesaurus as u2 on hr.type_th=u2.id AND u2.code = 'INSTITUTION'";
    }
    $sSiteStatusJoin = "";
    if(isset($aData['siteStatus']) && $aData['siteStatus']!= null && $aData['siteStatus']!= ""){
      $sSiteStatusQuoted = $this->db()->quote($aData['siteStatus']);
      $sSiteStatusJoin = "INNER JOIN util_thesaurus as th_status
                                  ON site_main.status_th=th_status.id AND th_status.code=$sSiteStatusQuoted";
    }

    $sPoiIdInClause = "";
    if(isset($aData["aPoiId"])){
      $aData["aPoiId"] = array_map( array($this->db(),'quote'), $aData["aPoiId"] );
      $sPoiIdInClause = " AND site_poi.id IN (" . implode(",",$aData["aPoiId"]) . ") ";
    }    

    $sAccessRestrictionClause = $this->getAccessRestrictionClause();
    $sql = "SELECT
                   site_poi.id,
                   site_poi.site_main_id,
                   site_poi.label,
                   site_poi.position,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.country_th,
                   site_poi.type_th,
                   site_poi.service_duration*1000 as service_duration,
                   ST_AsGeoJSON(site_poi.geom) AS geom,
                   site_poi.rec_st,
                   site_main.type_th as site_type_th,
                   site_main.label as site_main_label,
                   th_type.code as site_type_code,
                   th_type.label as site_type_label,
                   json_agg(json_build_object(
                      'id',site_poisitepoi.id,
                      'rec_st',site_poisitepoi.rec_st,
                      'acceptable_duration',site_poisitepoi.acceptable_duration*1000,
                      'site_poi_id_start',site_poisitepoi.site_poi_id_start,
                      'site_poi_id_end',site_poisitepoi.site_poi_id_end
                   )) AS matrix
              FROM site_poi
        INNER JOIN site_main on site_main.id=site_poi.site_main_id
        $sAccessRestrictionClause
        INNER JOIN util_thesaurus as th_type on site_main.type_th=th_type.id
         LEFT JOIN site_poisitepoi
                      ON (site_poisitepoi.site_poi_id_start = site_poi.id OR site_poisitepoi.site_poi_id_end = site_poi.id)
                      AND site_poisitepoi.rec_st<>'D' AND site_poisitepoi.depart_dt IS NULL AND site_poisitepoi.arrival_dt IS NULL
        $sHRIdJoin
        $sSiteStatusJoin
             WHERE site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
                   AND site_main.rec_st<>'D'
                   $sSiteIDClause
                   $sSiteTypeClause
                   $sPoiIdInClause
             GROUP BY site_poi.id,
                   site_poi.site_main_id,
                   site_poi.label,
                   site_poi.position,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.country_th,
                   site_poi.type_th,
                   site_poi.service_duration,
                   site_poi.geom,
                   site_poi.rec_st,
                   site_main.type_th,
                   site_main.label,
                   th_type.code,
                   th_type.label
             ORDER BY site_poi.site_main_id,site_poi.position";
    $result = $this->db()->query($sql);
    $aPOIs = $result->fetchAll(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    foreach($aPOIs as &$aPOI){
      $aPOI["geom"]=json_decode($aPOI["geom"],true);
      $aPOI["matrix"]=json_decode($aPOI["matrix"],true);
      $this->cleanMatrix($aPOI);
    }
    return $aPOIs;
  }

  /**
  * Get a list of POIs attached to some HRs
  * @param array $aData : filtering data
  * @return array({object}) : array of TransportPOI object
  **/
  public function listTransportPOIs($aData){
    $sInstitutionIDClause = "";
    if(isset($aData['institutions']) && $aData['institutions']!= null && $aData['institutions']!= ""){
      $aInstitutions = explode(";",$aData['institutions']);
      $sInstitutionsQuoted = "";
      foreach($aInstitutions as $sInstitution){
        if($sInstitutionsQuoted != ""){
          $sInstitutionsQuoted.=',';
        }
        $sInstitutionsQuoted .= $this->db()->quote($sInstitution);
      }
      $sInstitutionIDClause = "
        INNER JOIN hr_mainsite as hr_institution2 ON hr_main.id=hr_institution2.hr_main_id
        INNER JOIN site_main as institution2 ON institution2.id=hr_institution2.site_main_id
         AND institution2.id IN ( $sInstitutionsQuoted ) ";
    }
    $sSearchClause = "";
    if(isset($aData['pattern']) && $aData['pattern']!= null && $aData['pattern']!= ""){
      $sPatternQuoted .= $this->db()->quote("%".$aData['pattern']."%");
      $sSearchClause = " AND ( hr_main.lastname ILIKE $sPatternQuoted OR hr_main.firstname ILIKE $sPatternQuoted ) ";
    }
    $sOnlyActiveHRsClause = "";
    if(isset($aData['bOnlyActiveHRs']) && $aData['bOnlyActiveHRs']){
      $sOnlyActiveHRsClause = " AND hr_main_status.code<>'DISABLED' ";
    }
    $sAccessRestrictionClause = $this->getAccessRestrictionClause('home');
    // Although the list of institutions is not required as an output, we keep it sinces it helps
    //   filtering out the HRs that do not match the requested institutions list
    $sql = "SELECT
                   site_poi.id,
                   site_poi.label,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.service_duration*1000 as service_duration,
                   ST_AsGeoJSON(site_poi.geom) AS geom,
                   home_type.code as site_type_code,
                   hr_main.firstname as hr_firstname,
                   hr_main.lastname as hr_lastname,
                   hr_main.id as hr_id,
                   json_agg(json_build_object('id',institution.id,'label',institution.label)) as institutions
              FROM site_poi
        INNER JOIN site_main as home on home.id=site_poi.site_main_id
        $sAccessRestrictionClause
         LEFT JOIN hr_mainsite as hr_home on home.id=hr_home.site_main_id
         LEFT JOIN hr_main on hr_main.id=hr_home.hr_main_id
        INNER JOIN util_thesaurus AS hr_main_status ON hr_main_status.id = hr_main.status_th
        INNER JOIN hr_mainsite as hr_institution ON hr_main.id=hr_institution.hr_main_id
        INNER JOIN site_main as institution ON institution.id=hr_institution.site_main_id
        INNER JOIN util_thesaurus as institution_type ON institution.type_th=institution_type.id AND
                                                         institution_type.code = 'INSTITUTION'
         $sInstitutionIDClause
        INNER JOIN util_thesaurus as home_type on home.type_th=home_type.id AND home_type.code = 'HOME'
             WHERE site_poi.rec_st<>'D' AND site_poi.geom IS NOT NULL
             $sSearchClause
             $sOnlyActiveHRsClause
          GROUP BY site_poi.id,
                   site_poi.label,
                   site_poi.addr1,
                   site_poi.addr2,
                   site_poi.postcode,
                   site_poi.city,
                   site_poi.service_duration,
                   site_poi.geom,
                   home_type.code,
                   hr_main.firstname,
                   hr_main.lastname,
                   hr_main.id
          ORDER BY hr_main.lastname,hr_main.firstname";
    $result = $this->db()->query($sql);
    $aPOIs = $result->fetchAll(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    foreach($aPOIs as &$aPOI){
      $aPOI["geom"]=json_decode($aPOI["geom"],true);
      $aPOI["institutions"]=json_decode($aPOI["institutions"],true);
    }
    return $aPOIs;
  }

  /**
  * Get some details about an POI
  * @param string $sPOIID : POI identifier
  * @return array with id,site_main_id,label,position,addr1,addr2,postcode,city,type_th,geom,rec_st fields
  */
  public function get($sPOIID){
    $sAccessRestrictionClause = $this->getAccessRestrictionClause();
    $sPOIIDQuoted = $this->db()->quote($sPOIID);
    $sSQL = "SELECT site_poi.id,
                    site_poi.site_main_id,
                    site_poi.label,
                    site_poi.position,
                    site_poi.addr1,
                    site_poi.addr2,
                    site_poi.postcode,
                    site_poi.city,
                    site_poi.country_th,
                    site_poi.type_th,
                    site_poi.service_duration*1000 as service_duration,
                    ST_AsGeoJSON(site_poi.geom) AS geom,
                    site_poi.rec_st,
                    site_main.type_th as site_type_th,
                    util_thesaurus.code as site_type_code,
                    util_thesaurus.label as site_type_label,
                    json_agg(json_build_object(
                      'id',site_poisitepoi.id,
                      'rec_st',site_poisitepoi.rec_st,
                      'acceptable_duration',site_poisitepoi.acceptable_duration*1000,
                      'site_poi_id_start',site_poisitepoi.site_poi_id_start,
                      'site_poi_id_end',site_poisitepoi.site_poi_id_end
                    )) AS matrix
               FROM site_poi
         INNER JOIN site_main on site_main.id=site_poi.site_main_id
         $sAccessRestrictionClause
         INNER JOIN util_thesaurus on site_main.type_th=util_thesaurus.id
          LEFT JOIN site_poisitepoi
                      ON (site_poisitepoi.site_poi_id_start = site_poi.id OR site_poisitepoi.site_poi_id_end = site_poi.id)
                      AND site_poisitepoi.rec_st<>'D' AND site_poisitepoi.depart_dt IS NULL AND site_poisitepoi.arrival_dt IS NULL
             WHERE site_poi.id=$sPOIIDQuoted
             GROUP BY site_poi.id,
                    site_poi.site_main_id,
                    site_poi.label,
                    site_poi.position,
                    site_poi.addr1,
                    site_poi.addr2,
                    site_poi.postcode,
                    site_poi.city,
                    site_poi.country_th,
                    site_poi.type_th,
                    site_poi.service_duration,
                    site_poi.geom,
                    site_poi.rec_st,
                    site_main.type_th,
                    util_thesaurus.code,
                    util_thesaurus.label";
    $oResult = $this->db()->query($sSQL);
    $aPOI = $oResult->fetch(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    if(isset($aPOI["geom"])){
      $aPOI["geom"]=json_decode($aPOI["geom"],true);
    }
    if(isset($aPOI["matrix"])){
      $aPOI["matrix"]=json_decode($aPOI["matrix"],true);
    }
    $this->cleanMatrix($aPOI);
    return $aPOI;
  }

  /**
   * Remove items from $aPOI["matrix"] array where id is not set (may occur for POI without any hit
   *   in site_poisitepoi table)
   * @param array $aPOI: input POI for whihc we need to clean the matrix
   */
  public function cleanMatrix(&$aPOI){
    if(isset($aPOI["matrix"])){
      $iMatrixCount = count($aPOI["matrix"]);
      for($j=$iMatrixCount-1;$j>=0;$j--){
        if(!isset($aPOI["matrix"][$j]['id'])){
          unset($aPOI["matrix"][$j]);
        }
      }
    }
  }

  /**
  * Add a new POI
  * @param array $aData : data of the POI to be added.
  * @return array created poi with an id field
  */
  public function add($aData){
    if(!isset($aData['type_th'])){
      $aData['type_th']=NULL;
    }
    if(!isset($aData['service_duration'])){
      $aData['service_duration']=NULL;
    }
    else{
      $aData['service_duration']=round($aData['service_duration']/1000);
    }
    // Encode geometry again before saving
    $aData["geom"]=json_encode($aData["geom"]);
    $sSQL = "INSERT INTO site_poi (site_main_id,position,label,addr1,addr2,postcode,city,country_th,type_th,geom,rec_st,service_duration)
              VALUES (:site_main_id,:position,:label,:addr1,:addr2,:postcode,:city,:country_th,:type_th,ST_GeomFromGeoJSON(:geom),:rec_st,:service_duration)
              RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':site_main_id'=>$aData['site_main_id'],
      ':label'=>$aData['label'],
      ':position'=>$aData['position'],
      ':addr1'=>$aData['addr1'],
      ':addr2'=>$aData['addr2'],
      ':postcode'=>$aData['postcode'],
      ':city'=>$aData['city'],
      ':country_th'=>$aData['country_th'],
      ':type_th'=>$aData['type_th'],
      ':geom'=>$aData['geom'],
      ':rec_st'=>$aData['rec_st'],
      ':service_duration'=>$aData['service_duration']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Get the next available position for a POI within a site
   * @param string $sSiteID : the concerned site id
   * @return integer : the next available position for a POI within a site
   */
  public function getNextPosition($sSiteID){
    $sSiteIDQuoted = $this->db()->quote($sSiteID);
    $sSQL = "SELECT MAX(position) FROM site_poi WHERE site_main_id=$sSiteIDQuoted";
    $oResult = $this->db()->query($sSQL);
    $aCurrentPosition = $oResult->fetch(PDO::FETCH_ASSOC);
    $iResult = 1;
    if(isset($aCurrentPosition['max'])){
      $iResult=$aCurrentPosition['max']+1;
    }
    return $iResult;
  }

  /**
  * Update a POI
  * @param array $aData : data of the POI to be updated.
  * @return boolean : true if the update succeeded
  */
  public function update($aData){
    $bResult=false;
    if($this->hasAccess($aData['id'])){
      if(!isset($aData['type_th'])){
        $aData['type_th']=NULL;
      }
      if(!isset($aData['service_duration'])){
        $aData['service_duration']=NULL;
      }
      else{
        $aData['service_duration']=round($aData['service_duration']/1000);
      }
      // Encode geometry again before saving
      $aData["geom"]=json_encode($aData["geom"]);
      $sSQL = "UPDATE site_poi
                   SET
                      site_main_id=:siteMainID,
                      label=:label,
                      position=:position,
                      addr1=:addr1,
                      addr2=:addr2,
                      postcode=:postcode,
                      city=:city,
                      type_th=:type_th,
                      geom=ST_GeomFromGeoJSON(:geom),
                      rec_st=:rec_st,
                      service_duration=:service_duration
        WHERE id=" . $this->db()->quote($aData['id']);
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute(array(
        ':siteMainID'=>$aData['site_main_id'],
        ':label'=>$aData['label'],
        ':position'=>$aData['position'],
        ':addr1'=>$aData['addr1'],
        ':addr2'=>$aData['addr2'],
        ':postcode'=>$aData['postcode'],
        ':city'=>$aData['city'],
        ':type_th'=>$aData['type_th'],
        ':geom'=>$aData['geom'],
        ':rec_st'=>$aData['rec_st'],
        ':service_duration'=>$aData['service_duration']
      ));
    }
    return $bResult;
  }

  /**
  * Update a POI service duration
  * @param array $aData : data of the POI to be updated.
  * @return boolean : true if the update succeeded
  */
  public function updateServiceDuration($aData){
    $bResult=false;
    if($this->hasAccess($aData['id'])){    
      $sSQL = "UPDATE site_poi
                   SET
                      service_duration=:service_duration,
                      rec_st=:rec_st
        WHERE id=" . $this->db()->quote($aData['id']);
      $oQuery = $this->db()->prepare($sSQL);
      $bResult = $oQuery->execute(array(
        ':service_duration'=>round($aData['service_duration']/1000),
        ':rec_st'=>$aData['rec_st']
      ));
    }
    return $bResult;
  }

  /**
  * Mark a POI as removed
  * @param string $sPOIID : id of the POI to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sPOIID){
    $bResult=false;
    if($this->hasAccess($sPOIID)){  
      $query = "UPDATE site_poi SET rec_st='D' WHERE id=" . $this->db()->quote($sPOIID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a POI.
  * @param string $sPOIID : id of the POI to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sPOIID){
    $query = "DELETE FROM datachecker_detail WHERE site_poi_id=" . $this->db()->quote($sPOIID);
    $this->db()->exec($query);  
    $query = "DELETE FROM site_poi WHERE id=" . $this->db()->quote($sPOIID);
    return $this->db()->exec($query);
  }

  /**
   * Call a reverse geocode. Input data is supposed to have a lat and lng fields in degrees
   * @param array $aData : latitude and longitude
   * @return array : some fields of a POI : addr1, addr2, postcode and city
   */
  public function reverseGeocode($aData){
    $ch = curl_init();
    $sURL = $this->config('NOMINATIM_URL')."reverse/?format=json&lon=".$aData['lng']."&lat=".$aData['lat'];
    curl_setopt($ch,CURLOPT_URL,$sURL);
    // Enable to get the transfer result in the value returned by curl_exec function
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_DIGEST);
    $aResults = json_decode(curl_exec($ch),true);
    curl_close($ch);
    // The most interesting part of the address iw located within address field, but some information can be found in name field
    $aResult = $aResults['address'];
    if(isset($aResults['name'])){
      $aResult['addr1']=$aResults['name'];
    }
    else{
      if(isset($aResult['road'])){
        $aResult['addr1']=$aResult['road'];
      }
    }
    // Sometimes, the city field is not set, for instance if the output city is in fact a village.
    if(!isset($aResult['city'])){
      if(isset($aResult['county'])){
        $aResult['city']=$aResult['county'];
      }
      if(isset($aResult['village'])){
        $aResult['city']=$aResult['village'];
      }
    }
    $aResult['addr2']='';
    return $aResult;
  }

  // -------------------------- SITE_POISITEPOI handling : acceptable durations ---------------

  /**
  * List the entries in the POI POI matrix corresponding to a POI id
  * @param array $aData : containing an site_poi_id field with the POI id.
  * @return array the matching entries in POI POI matrix
  */
  public function listSitePOISitePOI($aData){
    $aResult=array();
    if($this->isAdmin()){
      // Currently this function is reversed to admins because it is used only in the 
      // POICtrl::delete function, which is expected to be used by administrators only
      if(isset($aData['site_poi_id'])){
        $sSitePOIIdQuoted = $this->db()->quote($aData['site_poi_id']);
        $sSQL = "SELECT id FROM site_poisitepoi
                  WHERE site_poi_id_start=$sSitePOIIdQuoted OR site_poi_id_end=$sSitePOIIdQuoted
                        AND depart_dt IS NULL AND arrival_dt IS NULL";
        $oResult = $this->db()->query($sSQL);
        $aResult = $oResult->fetchAll(PDO::FETCH_ASSOC);
      }
    }
    return $aResult;
  }

  /**
   * Get a row from site_poisitepoi table knowing the start and end POI ids.
   * @param string $sStartPOIId : id of the start POI
   * @param string $sEndPOIId : id of the end POI
   * @return array : array with one id field if there is a matching row in site_poisitepoi table.
   */
  public function getSitePOISitePOI($sStartPOIId,$sEndPOIId){
    $sStartPOIIdQuoted = $this->db()->quote($sStartPOIId);
    $sEndPOIIdQuoted = $this->db()->quote($sEndPOIId);
    $sSQL = "SELECT id FROM site_poisitepoi
              WHERE site_poi_id_start = $sStartPOIIdQuoted AND site_poi_id_end = $sEndPOIIdQuoted
                    AND depart_dt IS NULL AND arrival_dt IS NULL";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * List the elements of a distance and duration square matrix that are already in cache.
   * Here we consider a time dependent matrix (computed for a given departure date or arrival date)
   * The arrival date or departure date shall be given as a unix timestamp in ms in $iReferenceDt input param.
   * The last $bArrival parameter enables to tell whether the reference date is an arrival date or a departure date.
   * The input points are the origins and destination points of the square matrix, they all should contain a tempId
   *   field that gives the ID of POI in database.
   * @param array $aPoints : array of points (that are both origin and destinations points) with a tempId field
   * @param integer $iReferenceDt : reference date for the matrix computation as unix timestamp in ms
   * @param boolean $bArrival : whether the reference date is a departure or an arrival date
   * @return array : found cells in cache, with the following fields: site_poi_id_start,site_poi_id_end,duration,distance
   */
  public function getMatrixCache($aPoints,$iReferenceDt,$bArrival){
    $aResult =array();
    if(count($aPoints)>0){
      $sReferenceDateClause = "";
      if($bArrival){
        $sReferenceDateClause = " AND depart_dt IS NULL AND arrival_dt = ".$this->db()->quote(round($iReferenceDt/1000))." ";
      }
      else{
        $sReferenceDateClause = " AND arrival_dt IS NULL AND depart_dt = ".$this->db()->quote(round($iReferenceDt/1000))." ";
      }
      $sStartPOIIDList = "";
      foreach($aPoints as $aPoint){
        if($sStartPOIIDList!=""){
          $sStartPOIIDList.=",";
        }
        $sStartPOIIDList.=$this->db()->quote($aPoint["tempId"]);
      }
      $sEndPOIIDList = "";
      foreach($aPoints as $aPoint){
        if($sEndPOIIDList!=""){
          $sEndPOIIDList.=",";
        }
        $sEndPOIIDList.=$this->db()->quote($aPoint["tempId"]);
      }
      // Although there is a unicity constraint over 4 columns ( site_poi_id_start, site_poi_id_end,
      //   depart_dt and arrival_dt), one of depart_dt and arrival_dt columns is explicitely set to null
      //   in the query below, which makes it possible to have several hits for a given 4-uple ( site_poi_id_start,
      //   site_poi_id_end, depart_dt and arrival_dt). Among the several hits, we want to keep only one value and
      //   therefore we use the distinct on clause
      $sSQL = "SELECT distinct on (site_poi_id_start,site_poi_id_end) site_poi_id_start,site_poi_id_end,duration,distance
                 FROM site_poisitepoi
                WHERE site_poi_id_start IN ($sStartPOIIDList) AND
                      site_poi_id_end IN ($sEndPOIIDList)
                      $sReferenceDateClause
             ORDER BY site_poi_id_start,site_poi_id_end,duration,distance";
      $oResult = $this->db()->query($sSQL);
      $aResult = $oResult->fetchAll(PDO::FETCH_ASSOC);
    }
    return $aResult;
  }

  /**
   * Save some elements of a distance and duration matrix into database.
   * Here we consider a time dependent matrix (computed for a given departure date or arrival date)
   * The arrival date or departure date shall be given as a unix timestamp in ms in $iReferenceDt input param.
   * The last $bArrival parameter enables to tell whether the reference date is an arrival date or a departure date.
   * The input matrix is a collection of cells, each cell should have the following fields :
   *   originPOIID, destinationPOIID, duration (in s), distance (in m)
   * @param array $aMatrix : the duration and distance matrix cells to be saved
   * @param integer $iReferenceDt : reference date for the matrix computation as unix timestamp in ms
   * @param boolean $bArrival : whether the reference date is a departure or an arrival date
   */
  public function saveMatrixCache($aMatrix,$iReferenceDt,$bArrival){
    // First we have to check whether the entries of the matrix to be saved are already present in database or not
    $sReferenceDateClause = "";
    if($bArrival){
      $sReferenceDateClause = " AND depart_dt IS NULL AND arrival_dt = ".$this->db()->quote(round($iReferenceDt/1000))." ";
    }
    else{
      $sReferenceDateClause = " AND arrival_dt IS NULL AND depart_dt = ".$this->db()->quote(round($iReferenceDt/1000))." ";
    }
    $sPOIIDsClause="";
    foreach($aMatrix as $aCell){
      if($sPOIIDsClause!=""){
        $sPOIIDsClause.=" OR ";
      }
      $sPOIIDsClause .= "(";
      $sPOIIDsClause .= "site_poi_id_start=".$this->db()->quote($aCell["originPOIID"])." AND ";
      $sPOIIDsClause .= "site_poi_id_end=".$this->db()->quote($aCell["destinationPOIID"]);
      $sPOIIDsClause .= ")";
    }
    // No need to go on if $sPOIIDsClause is the empty string because this means there are no cells to be saved
    if($sPOIIDsClause!=""){
      $sSQL="SELECT site_poi_id_start,site_poi_id_end,depart_dt,arrival_dt,duration,distance,rec_st
               FROM site_poisitepoi
              WHERE ( $sPOIIDsClause ) $sReferenceDateClause";
      $oResult = $this->db()->query($sSQL);
      $aCellsAlreadyInCache = $oResult->fetchAll(PDO::FETCH_ASSOC);
      // Prepare the values to update and the values to insert according to their presence in cache
      $sInsertValues="";
      $sUpdateValues="";
      foreach($aMatrix as $aCell){
        // Check that the cell is not already in cache
        $bAlreadyInCache=false;
        foreach($aCellsAlreadyInCache as $aCellAlreadyInCache){
          if($aCellAlreadyInCache["site_poi_id_start"]==$aCell["originPOIID"] &&
             $aCellAlreadyInCache["site_poi_id_end"]==$aCell["destinationPOIID"]){
            if($bArrival && $aCellAlreadyInCache["arrival_dt"]==round($iReferenceDt/1000)){
              $bAlreadyInCache = true;
              break;
            }
            if(!$bArrival && $aCellAlreadyInCache["depart_dt"]==round($iReferenceDt/1000)){
              $bAlreadyInCache = true;
              break;
            }
          }
        }
        if($bAlreadyInCache){
          // The matrix cell is already in cache, we just update the values
          if($sUpdateValues!=""){
            $sUpdateValues.=",";
          }
          $sUpdateValues .= "(";
          $sUpdateValues .= $this->db()->quote($aCell["originPOIID"]).",";
          $sUpdateValues .= $this->db()->quote($aCell["destinationPOIID"]).",";
          $sUpdateValues .= $this->db()->quote(round($iReferenceDt/1000)).",";
          $sUpdateValues .= $this->db()->quote($aCell["duration"]).",";
          $sUpdateValues .= $this->db()->quote($aCell["distance"]).",";
          $sUpdateValues .= "'U'";
          $sUpdateValues .= ")";
        }
        else{
          // The matrix cell is not already in cache, we will insert it
          if($sInsertValues!=""){
            $sInsertValues.=",";
          }
          $sInsertValues .= "(";
          $sInsertValues .= $this->db()->quote($aCell["originPOIID"]).",";
          $sInsertValues .= $this->db()->quote($aCell["destinationPOIID"]).",";
          $sInsertValues .= $this->db()->quote(round($iReferenceDt/1000)).",";
          $sInsertValues .= $this->db()->quote($aCell["duration"]).",";
          $sInsertValues .= $this->db()->quote($aCell["distance"]).",";
          $sInsertValues .= "'C'";
          $sInsertValues .= ")";
        }
      }
      $sReferenceDtField = $bArrival ? "arrival_dt" : "depart_dt";
      $sNotReferenceDtField = $bArrival ? "depart_dt" : "arrival_dt";
      if($sUpdateValues!=""){
        // Update values
        $sSQL="UPDATE site_poisitepoi as t
                  SET duration = CAST(c.duration as integer), distance = CAST(c.distance as integer),rec_st = c.rec_st
                 FROM ( VALUES $sUpdateValues ) as c(site_poi_id_start,site_poi_id_end,$sReferenceDtField,duration,distance,rec_st)
                WHERE CAST(c.site_poi_id_start as uuid) = t.site_poi_id_start AND
                      CAST(c.site_poi_id_end as uuid) = t.site_poi_id_end AND
                      CAST(c.$sReferenceDtField as integer) = t.$sReferenceDtField AND
                      t.$sNotReferenceDtField IS NULL";
        $this->db()->exec($sSQL);
      }
      if($sInsertValues!=""){
        // Insert values
        $sSQL="INSERT INTO site_poisitepoi (site_poi_id_start,site_poi_id_end,$sReferenceDtField,duration,distance,rec_st)
                    VALUES $sInsertValues";
        $this->db()->exec($sSQL);
      }
    }
  }

  /**
  * Insert a row into site_poisitepoi table
  * @param array $aData : data of the entry to be added in the site_poisitepoi table.
  * @return array array with one id field corresponding to the inserted row in site_poisitepoi table.
  */
  public function addSitePOISitePOI($aData){
    if(isset($aData['acceptable_duration'])){
      if(!isset($aData['duration'])){
        $sSQL = "INSERT INTO site_poisitepoi (site_poi_id_start,site_poi_id_end,acceptable_duration,rec_st)
                  VALUES (:site_poi_id_start,:site_poi_id_end,:acceptable_duration,:rec_st)
                  RETURNING id";
        $oQuery = $this->db()->prepare($sSQL);
        $oQuery->execute(array(
          ':site_poi_id_start'=>$aData['site_poi_id_start'],
          ':site_poi_id_end'=>$aData['site_poi_id_end'],
          ':acceptable_duration'=>round($aData['acceptable_duration']/1000),
          ':rec_st'=>'C'
        ));
      }
      else{
        $sSQL = "INSERT INTO site_poisitepoi (site_poi_id_start,site_poi_id_end,acceptable_duration,duration,rec_st)
                  VALUES (:site_poi_id_start,:site_poi_id_end,:acceptable_duration,:duration,:rec_st)
                  RETURNING id";
        $oQuery = $this->db()->prepare($sSQL);
        $oQuery->execute(array(
          ':site_poi_id_start'=>$aData['site_poi_id_start'],
          ':site_poi_id_end'=>$aData['site_poi_id_end'],
          ':acceptable_duration'=>round($aData['acceptable_duration']/1000),
          ':duration'=>round($aData['duration']/1000),
          ':rec_st'=>'C'
        ));
      }
    }
    else{
      $sSQL = "INSERT INTO site_poisitepoi (site_poi_id_start,site_poi_id_end,duration,rec_st)
                VALUES (:site_poi_id_start,:site_poi_id_end,:duration,:rec_st)
                RETURNING id";
      $oQuery = $this->db()->prepare($sSQL);
      $oQuery->execute(array(
        ':site_poi_id_start'=>$aData['site_poi_id_start'],
        ':site_poi_id_end'=>$aData['site_poi_id_end'],
        ':duration'=>round($aData['duration']/1000),
        ':rec_st'=>'C'
      ));      
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Update a row from site_poisitepoi table
   * Currently only the acceptable duration can be updated (provided in milliseconds)
   * @param array $aData : data of the entry to be updated in the site_poisitepoi table.
   * @return boolean : wether the update succeeded or not.
   */
  public function updateSitePOISitePOI($aData){
    if(isset($aData['acceptable_duration'])){
      if(!isset($aData['duration'])){    
        $sSQL = "UPDATE site_poisitepoi
                    SET
                        acceptable_duration=:acceptable_duration,
                        rec_st=:rec_st
                  WHERE id=" . $this->db()->quote($aData['id']);
        $oQuery = $this->db()->prepare($sSQL);
        return $oQuery->execute(array(
          ':acceptable_duration'=>round($aData['acceptable_duration']/1000),
          ':rec_st'=>'U',
        ));
      }
      else{
        $sSQL = "UPDATE site_poisitepoi
                    SET
                        acceptable_duration=:acceptable_duration,
                        duration=:duration,
                        rec_st=:rec_st
                  WHERE id=" . $this->db()->quote($aData['id']);
        $oQuery = $this->db()->prepare($sSQL);
        return $oQuery->execute(array(
          ':acceptable_duration'=>round($aData['acceptable_duration']/1000),
          ':duration'=>round($aData['duration']/1000),
          ':rec_st'=>'U',
        ));        
      }
    }
    else{
      $sSQL = "UPDATE site_poisitepoi
                  SET
                      duration=:duration,
                      rec_st=:rec_st
               WHERE id=" . $this->db()->quote($aData['id']);
      $oQuery = $this->db()->prepare($sSQL);
      return $oQuery->execute(array(
        ':duration'=>round($aData['duration']/1000),
        ':rec_st'=>'U',
      ));       
    }
  }

  /**
  * Delete an entry from the site_poisitepoi table.
  * @param string $sSitePOISitePOIID : id of the entry of the site_poisitepoi table to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteSitePOISitePOI($sSitePOISitePOIID){
    $bResult = false;
    if($this->isAdmin()){
      $query = "DELETE FROM site_poisitepoi WHERE id=" . $this->db()->quote($sSitePOISitePOIID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
   * Get the list of institutions attached to a POI of type HOME.
   * The list of institutions is obtained by considering the HR that is linked to the input Home POI
   * And the by considering the list of institutions that is linked to that HR.
   * @param string $sHomePOIId : a POI identifier of type HOME
   * @return array : a list of institutions
   */
  public function getInstitutions($sHomePOIId){
    $sPOIIdQuoted = $this->db()->quote($sHomePOIId);
    $sAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_hr');
    $sSQL =
    " SELECT
               site_main_institution.id,
               site_main_institution.label,
               site_poi_institution.id as poi_id,
               home_to_institution.acceptable_duration*1000 as home_to_institution_acceptable_duration,
               institution_to_home.acceptable_duration*1000 as institution_to_home_acceptable_duration
    FROM site_poi AS site_poi_hr
    INNER JOIN site_main AS site_main_hr ON site_main_hr.id=site_poi_hr.site_main_id AND site_main_hr.rec_st <> 'D'
    $sAccessRestrictionClause
    INNER JOIN util_thesaurus AS th_site_type_hr ON site_main_hr.type_th=th_site_type_hr.id AND th_site_type_hr.code = 'HOME'
    INNER JOIN hr_mainsite ON hr_mainsite.site_main_id=site_main_hr.id AND hr_mainsite.rec_st <> 'D'
    INNER JOIN hr_main ON hr_main.id=hr_mainsite.hr_main_id AND hr_main.rec_st <> 'D'
    INNER JOIN hr_mainsite AS hr_main_institution ON hr_main_institution.hr_main_id=hr_main.id AND hr_main_institution.rec_st <> 'D'
    INNER JOIN site_main AS site_main_institution ON site_main_institution.id=hr_main_institution.site_main_id
                                                 AND site_main_institution.rec_st <> 'D'
    INNER JOIN util_thesaurus AS th_site_type_institution  ON site_main_institution.type_th=th_site_type_institution.id
                                                 AND th_site_type_institution.code = 'INSTITUTION'
    -- for each institution, we consider only the first poi --
    LEFT JOIN site_poi AS site_poi_institution ON site_poi_institution.id = (
      SELECT id
      FROM site_poi
      WHERE site_poi.site_main_id = site_main_institution.id AND geom IS NOT NULL AND  site_poi.rec_st<>'D'
      ORDER BY position
      LIMIT 1 )
    LEFT JOIN site_poisitepoi AS home_to_institution ON home_to_institution.site_poi_id_start = site_poi_hr.id
                                                    AND home_to_institution.site_poi_id_end = site_poi_institution.id
                                                    AND home_to_institution.rec_st<>'D'
                                                    AND home_to_institution.depart_dt IS NULL AND home_to_institution.arrival_dt IS NULL
    LEFT JOIN site_poisitepoi AS institution_to_home ON institution_to_home.site_poi_id_end = site_poi_hr.id
                                                    AND institution_to_home.site_poi_id_start = site_poi_institution.id
                                                    AND institution_to_home.rec_st<>'D'
                                                    AND institution_to_home.depart_dt IS NULL AND institution_to_home.arrival_dt IS NULL
    WHERE site_poi_hr.rec_st <> 'D' AND site_poi_hr.id= $sPOIIdQuoted";
     $result = $this->db()->query($sSQL);
     return $result->fetchAll(PDO::FETCH_ASSOC);
  }

   /**
   * Given a list of POIs of type HOME, find the corresponding list of institution POIs.
   * For each pair of home/institution POIs, retrieve the acceptable travel durations if defined
   * Works even for POIs associated to HRs that are marked as removed or deactivated
   * @param $aData array : contains some a list of POI identifiers.
   * @return array : a list of institution POIs.
   */
  public function listInstitutionPOIs($aData){
    $sPOIIDsQuoted = "";
    foreach($aData as $sPOIID){
      if($sPOIIDsQuoted != ""){
        $sPOIIDsQuoted.=',';
      }
      $sPOIIDsQuoted .= "CAST(".$this->db()->quote($sPOIID). " as uuid)";
    }
    $sInstitutionAccessRestrictionClause = $this->getAccessRestrictionClause('site_main');
    $sHRAccessRestrictionClause = $this->getAccessRestrictionClause('site_main_home');
    // Compute the list of POIs for each HR concerned by the input list of POIs
    $sSQL = "SELECT
               site_poi_institution.id,
               public.ST_AsGeoJSON(site_poi_institution.geom)::json->'coordinates' AS coordinates,
               json_agg(json_build_object(
                 'id',site_poi_hr.id,
                 'coordinates',public.ST_AsGeoJSON(site_poi_hr.geom)::json->'coordinates',
                 'acceptableDurationFromInstitution',fromInstitution.acceptable_duration*1000,
                 'acceptableDurationToInstitution',toInstitution.acceptable_duration*1000
               )) AS pois
             FROM site_poi AS site_poi_institution
       INNER JOIN site_main ON site_poi_institution.site_main_id=site_main.id
       $sInstitutionAccessRestrictionClause
       INNER JOIN util_thesaurus AS util_thesaurus_institution ON site_main.type_th=util_thesaurus_institution.id AND
                                                                  util_thesaurus_institution.code='INSTITUTION'
       INNER JOIN hr_mainsite AS hr_mainsite_institution ON site_main.id=hr_mainsite_institution.site_main_id
       INNER JOIN hr_main ON hr_main.id=hr_mainsite_institution.hr_main_id
       INNER JOIN hr_mainsite AS hr_mainsite_home ON hr_main.id=hr_mainsite_home.hr_main_id
       INNER JOIN site_main AS site_main_home ON site_main_home.id=hr_mainsite_home.site_main_id
       $sHRAccessRestrictionClause
       INNER JOIN util_thesaurus AS util_thesaurus_home ON site_main_home.type_th=util_thesaurus_home.id AND
                                                           util_thesaurus_home.code='HOME'
       INNER JOIN site_poi AS site_poi_hr ON site_poi_hr.site_main_id=site_main_home.id AND
                                             site_poi_hr.id IN ( $sPOIIDsQuoted )
        LEFT JOIN site_poisitepoi AS fromInstitution ON fromInstitution.site_poi_id_start = site_poi_institution.id
                                 AND fromInstitution.site_poi_id_end = site_poi_hr.id
                                 AND fromInstitution.rec_st<>'D'
        LEFT JOIN site_poisitepoi AS toInstitution ON toInstitution.site_poi_id_start = site_poi_hr.id
                                 AND toInstitution.site_poi_id_end = site_poi_institution.id
                                 AND toInstitution.rec_st<>'D'
         GROUP BY site_poi_institution.id, site_poi_institution.geom";
    $oResult = $this->db()->query($sSQL);
    $aInstitutionPOIs = $oResult->fetchAll(PDO::FETCH_ASSOC);
    foreach($aInstitutionPOIs as &$aInstitutionPOI){
      $aInstitutionPOI["coordinates"]=json_decode($aInstitutionPOI["coordinates"],true);
      $aInstitutionPOI["pois"]=json_decode($aInstitutionPOI["pois"],true);
    }
    return $aInstitutionPOIs;
  }

}
