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
 *  Class to handle DB access for AOIs (Areas of Interest)
 *  @creationdate 2018-09-13
 **/

namespace OSS\Model;

use PDO;

use OSS\BaseObject;

/**
* Class for handling requests to the AOI table in the database.
*/
class AOIDAO extends BaseObject{

  /**
  * Constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of AOIs based on search criteria. Output AOIs will be sorted by site_main_id and by position
  * The input data array is expected to contain the following fields :
  *   siteId
  * @param array $aData : filtering data
  * @return array({object}) : array of AOI object
  **/
  public function list($aData){
    $sSiteIDClause = "";
    if(isset($aData['siteId']) && $aData['siteId']!= null && $aData['siteId']!= ""){
      $sSiteIDQuoted = $this->db()->quote($aData['siteId']);
      $sSiteIDClause = " AND site_aoi.site_main_id = $sSiteIDQuoted ";
    }
    $sAccessRestrictionClause = $this->getAccessRestrictionClause('site_aoi','site_main_id');
    $sql = "SELECT
                   site_aoi.id,
                   site_aoi.site_main_id,
                   site_aoi.label,
                   site_aoi.position,
                   site_aoi.type_th,
                   st_AsGeoJSON(site_aoi.geom) AS geom,
                   site_aoi.rec_st
              FROM site_aoi
              $sAccessRestrictionClause
             WHERE site_aoi.rec_st<>'D' AND site_aoi.geom IS NOT NULL
                   $sSiteIDClause
             ORDER BY site_aoi.site_main_id,site_aoi.position";
    $result = $this->db()->query($sql);
    $aAOIs = $result->fetchAll(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    foreach($aAOIs as &$aAOI){
      $aAOI["geom"]=json_decode($aAOI["geom"],true);
    }
    return $aAOIs;
  }

  /**
  * Get some details about an AOI
  * @param string $sAOIID : AOI identifier
  * @return array with id, site_main_id, label, position, type_th, geom, rec_st fields
  */
  public function get($sAOIID){
    $sAccessRestrictionClause = $this->getAccessRestrictionClause('site_aoi','site_main_id');
    $sAOIIDQuoted = $this->db()->quote($sAOIID);
    $sSQL = "SELECT site_aoi.id,
                    site_aoi.site_main_id,
                    site_aoi.label,
                    site_aoi.position,
                    site_aoi.type_th,
                    st_AsGeoJSON(site_aoi.geom) AS geom,
                    site_aoi.rec_st
               FROM site_aoi
               $sAccessRestrictionClause
             WHERE site_aoi.id=$sAOIIDQuoted";
    $oResult = $this->db()->query($sSQL);
    $aAOI = $oResult->fetch(PDO::FETCH_ASSOC);
    // Cast every geojson to an array structures
    if(isset($aAOI["geom"])){
      $aAOI["geom"]=json_decode($aAOI["geom"],true);
    }
    return $aAOI;
  }

  /**
  * Add a new AOI
  * @param array $aData : data of the AOI to be added.
  * @return array created aoi with an id field
  */
  public function add($aData){
    if(!isset($aData['type_th'])){
      $aData['type_th']=NULL;
    }
    // Encode geometry again before saving
    $aData["geom"]=json_encode($aData["geom"]);
    $sSQL = "INSERT INTO site_aoi (site_main_id,position,label,type_th,geom,rec_st)
              VALUES (:site_main_id,:position,:label,:type_th,ST_GeomFromGeoJSON(:geom),:rec_st)
              RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':site_main_id'=>$aData['site_main_id'],
      ':label'=>$aData['label'],
      ':position'=>$aData['position'],
      ':type_th'=>$aData['type_th'],
      ':geom'=>$aData['geom'],
      ':rec_st'=>$aData['rec_st']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Get the next available position for an AOI within a site
   * @param string $sSiteID : the concerned site id
   * @return integer : the next available position for an AOI within a site
   */
  public function getNextPosition($sSiteID){
    $sSiteIDQuoted = $this->db()->quote($sSiteID);
    $sSQL = "SELECT MAX(position) FROM site_aoi WHERE site_main_id=$sSiteIDQuoted";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetch(PDO::FETCH_ASSOC)['max']+1;
  }

  /**
  * Update a AOI
  * @param array $aData : data of the AOI to be updated.
  * @return boolean : true if the update succeeded
  */
  public function update($aData){
    $aResult=array();
    if($this->hasAccess($aData['id'])){    
      if(!isset($aData['type_th'])){
        $aData['type_th']=NULL;
      }
      // Encode geometry again before saving
      $aData["geom"]=json_encode($aData["geom"]);
      $sSQL = "UPDATE site_aoi
                   SET
                      site_main_id=:siteMainID,
                      label=:label,
                      position=:position,
                      type_th=:type_th,
                      geom=ST_GeomFromGeoJSON(:geom),
                      rec_st=:rec_st
        WHERE id=" . $this->db()->quote($aData['id']);
      $oQuery = $this->db()->prepare($sSQL);
      $aResult = $oQuery->execute(array(
        ':siteMainID'=>$aData['site_main_id'],
        ':label'=>$aData['label'],
        ':position'=>$aData['position'],
        ':type_th'=>$aData['type_th'],
        ':geom'=>$aData['geom'],
        ':rec_st'=>$aData['rec_st']
      ));
    }
    return $aResult;
  }

  /**
  * Mark a AOI as removed
  * @param string $sAOIID : id of the AOI to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sAOIID){
    $bResult=false;
    if($this->hasAccess($sAOIID)){       
      $query = "UPDATE site_aoi SET rec_st='D' WHERE id=" . $this->db()->quote($sAOIID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a AOI.
  * @param string $sAOIID : id of the AOI to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sAOIID){
    $query = "DELETE FROM site_aoi WHERE id=" . $this->db()->quote($sAOIID);
    return $this->db()->exec($query);
  }
}
