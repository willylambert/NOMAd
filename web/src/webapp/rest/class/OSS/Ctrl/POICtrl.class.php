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
 *  REST service to handle POIs (Points of Interest)
 *  @creationdate 2019-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class POICtrl extends BaseObject{

  /**
  * Get a list of POIs based on search criteria
  * The input data array is expected to contain the following fields :
  *   siteId, siteType
  * @param array $aData : filtering data
  * @return array({object}) : array of POI object
  **/
  public function list($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>count($aData)]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    $aPOIs = $oPOIDAO->list($aData);
    $this->setResult($aPOIs);
    return $aPOIs;
  }

  /**
  * Get a list of POIs attached to some HRs
  * @param array $aData : filtering data
  * @return array({object}) : array of TransportPOI object
  **/
  public function listTransportPOIs($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    $aPOIs = $oPOIDAO->listTransportPOIs($aData);
    $this->setResult($aPOIs);
    return $aPOIs;
  }

  /**
  * Get some details about an POI
  * @param string $sPOIID : POI identifier
  * @return array with ID,SITE_MAIN_ID,LABEL,POSITION,ADDR1,ADDR2,POSTCODE,CITY,TYPE_TH,GEOM,REC_ST fields
  */
  public function get($sPOIID){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sPOIID]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    $aPOI = $oPOIDAO->get($sPOIID);
    $this->setResult($aPOI);
    return $aPOI;
  }

  /**
   * Update the POI matrix for the considered POI
   * @param array $aData : the considered POI
   */
  public function updatePOIMatrix($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    if(isset($aData['matrix'])){
      foreach($aData['matrix'] as $aMatrixEntry){
        // Make sure that the POI id is set (for new POIs, it may be unset)
        if(!isset($aMatrixEntry['site_poi_id_start'])){
          $aMatrixEntry['site_poi_id_start']=$aData['id'];
        }
        else{
          if(!isset($aMatrixEntry['site_poi_id_end'])){
            $aMatrixEntry['site_poi_id_end']=$aData['id'];
          }
        }
        $this->saveSitePOISitePOI($aMatrixEntry);
      }
    }
  }

  /**
  * Add a POI
  * @param array $aData : data of the POI to be added.
  * @return array : new poi with id field
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewPOI = array();
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oSiteCtrl->hasAccess($aData['site_main_id'])){  
      $aData['rec_st']='C';
      // In the current release, country code is not set and position is computed on server side
      $aData['country_th']=NULL;
      $aData['position']=$this->getNextPosition($aData['site_main_id']);
      $oPOIDAO = new \OSS\Model\POIDAO();
      $aNewPOI = $oPOIDAO->add($aData);
    }
    if(isset($aNewPOI['id'])){
      $aData['id']=$aNewPOI['id'];
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aData['id'],'site_poi');
      $this->updatePOIMatrix($aData);
    }
    else{
      throw new \OSS\AppException(
        "POI insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewPOI);
    return $aNewPOI;
  }

  /**
   * Update all the POIs over a site
   * @param array $aPOIs : the updated POIs
   * @param string $sSiteID : the concerned site id
   * @return boolean : true if the update succeeded
   */
  public function updateBySite($aPOIs,$sSiteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aPOIs,$sSiteID)]);
    $bResult = true;
    // Get the list of existing POIs for the current site, for comparison
    $aOldPOIs = $this->list(array('siteId'=>$sSiteID));
    foreach($aOldPOIs as $aOldPOI){
      $bOldPOIFound = false;
      foreach($aPOIs as $aPOI){
        if(isset($aPOI['id']) && $aPOI['id'] == $aOldPOI['id']){
          // Handle an updated POI
          $bResult &= $this->update($aPOI);
          $bOldPOIFound = true;
          break;
        }
      }
      if(!$bOldPOIFound){
        // Handle a deleted POI
        $bResult &= $this->markAsRemoved($aOldPOI['id']);
      }
    }
    // Now handle new POIs insertion
    foreach($aPOIs as $aPOI){
      if(!isset($aPOI['id'])){
        $this->add($aPOI);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Get the next available position for a POI within a site
   * @param string $sSiteID : the concerned site id
   * @return integer : the next available position for a POI within a site
   */
  public function getNextPosition($sSiteID){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sSiteID]);
    $iResult=false;
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    if($oSiteCtrl->hasAccess($sSiteID)){  
      $oPOIDAO = new \OSS\Model\POIDAO();
      $iResult = $oPOIDAO->getNextPosition($sSiteID);
    }
    return $iResult;
  }

  /**
  * Update a POI
  * @param array $aData : data of the POI to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_poi');
    $oPOIDAO = new \OSS\Model\POIDAO();
    $bResult = $oPOIDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_poi');
      $this->updatePOIMatrix($aData);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Update a POI service duration
  * @param array $aData : data of the POI to be updated : id and service_duration fields
  * @return boolean : true in case of success
  */
  public function updateServiceDuration($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_poi');
    $oPOIDAO = new \OSS\Model\POIDAO();
    $bResult = $oPOIDAO->updateServiceDuration($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_poi');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a POI as removed
  * @param string $sPOIID : id of the POI to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sPOIID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sPOIID]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    $bResult = $oPOIDAO->markAsRemoved($sPOIID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sPOIID,'site_poi');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a POI.
  * @param string $sPOIID : id of the POI to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function delete($sPOIID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sPOIID]);
    $bResult = false;
    if($this->isAdmin()){   
      // First delete all entries from site_poisitepoi matrix that concerns the current POI
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oPOIDAO = new \OSS\Model\POIDAO();
      $aSitePOISitePOIs = $oPOIDAO->listSitePOISitePOI(array('site_poi_id'=>$sPOIID));
      foreach($aSitePOISitePOIs as $aSitePOISitePOI){
        $oAuditTrailCtrl->beforeDataDelete($aSitePOISitePOI['id'],'site_poisitepoi');
        $oPOIDAO->deleteSitePOISitePOI($aSitePOISitePOI['id']);
      }
      // Then delete the POI itself
      $oAuditTrailCtrl->beforeDataDelete($sPOIID,'site_poi');
      $bResult = $oPOIDAO->delete($sPOIID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Call a reverse geocode. Input data is supposed to have a lat and lng fields in degrees
   * @param array $aData : latitude and longitude
   * @return array : some fields of a POI : addr1, addr2, postcode and city
   */
  public function reverseGeocode($aData){
    $oPOIDAO = new \OSS\Model\POIDAO();
    $aPOI = $oPOIDAO->reverseGeocode($aData);
    $this->setResult($aPOI);
    return $aPOI;
  }

  /**
   * Function that turns a transport duration into an acceptable transport duration
   * The input is supposed to be the maximal duration between a HR POI and the corresponding set of institutions,
   *   whatever the travel direction, and is given in seconds.
   * @param float $fMaxDuration : maximal travel duration from a POI in seconds
   * @return float : acceptable travel duration from the POI in milliseconds
   */
  public function computeAcceptableDuration($fMaxDuration){
    $this->log()->info(["method"=>__METHOD__,"data"=>$fMaxDuration]);
    // The old function was : return 1000*900*ceil(($fMaxDuration+900)/900);
    // The new function is the described below
    // One strange thing is that it is not always increasing :
    // - the acceptable ride time for 45 minutes is higher than the acceptable ride time for 46 minutes
    // - the acceptable ride time for 90 minutes is higher than the acceptable ride time for 91 minutes
    // However, the new function may be more realistic for short reference travel times
    $fResultInSeconds = 0;
    if($fMaxDuration<=10*60){
      $fResultInSeconds=$fMaxDuration+15*60;
    }
    else{
      if($fMaxDuration<=30*60){
        $fResultInSeconds=$fMaxDuration+20*60;
      }
      else{
        if($fMaxDuration<=45*60){
          $fResultInSeconds=$fMaxDuration+30*60;
        }
        else{
          if($fMaxDuration<=90*60){
            $fResultInSeconds=1.5*$fMaxDuration;
          }
          else{
            $fResultInSeconds=1.3*$fMaxDuration;
          }
        }
      }
    }
    // Make sure the number of seconds is an integer
    return ceil($fResultInSeconds)*1000;
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
    $oPOIDAO = new \OSS\Model\POIDAO();
    return $oPOIDAO->getMatrixCache($aPoints,$iReferenceDt,$bArrival);
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
    $this->log()->info([
      "method"=>__METHOD__,
      "Saving some duration and distance matrix entries to database",
      "data"=>array("cells"=>$aMatrix,"referenceDate"=>$iReferenceDt,"bIsArrival"=>$bArrival)
    ]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    return $oPOIDAO->saveMatrixCache($aMatrix,$iReferenceDt,$bArrival);
  }

  /**
   * Save a row into site_poisitepoi table
   * The durations in the input array must be given in milliseconds
   * @param array $aData : the information about the row to save in site_poisitepoi table
   * @return array : the saved raw site_poisitepoi table.
   */
  public function saveSitePOISitePOI($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oPOIDAO = new \OSS\Model\POIDAO();
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aResult = array();
    if(isset($aData['id'])){
      // Case of an update
      $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_poisitepoi');
      $oPOIDAO->updateSitePOISitePOI($aData);
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_poisitepoi');
      $aResult = $aData;
    }
    else{
      // Case of an insertion. First we test whether the data to insert is not already present in site_poisitepoi table
      $aSitePOIsitePOI = $oPOIDAO->getSitePOISitePOI($aData['site_poi_id_start'],$aData['site_poi_id_end']);
      if(isset($aSitePOIsitePOI['id'])){
        // Row of site_poisitepoi is already present, so we just update it
        $aData['id']=$aSitePOIsitePOI['id'];
        $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'site_poisitepoi');
        $aSitePOIsitePOI = $oPOIDAO->updateSitePOISitePOI($aData);
        $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'site_poisitepoi');
        $aResult = $aData;
      }
      else{
        // Row of site_poisitepoi is not present yet, we insert it
        $aNewSitePOISitePOI = $oPOIDAO->addSitePOISitePOI($aData);
        if(isset($aNewSitePOISitePOI['id'])){
          $oAuditTrailCtrl->afterDataInsert($aNewSitePOISitePOI['id'],'site_poisitepoi');
        }
        else{
          throw new \OSS\AppException(
            "Acceptable duration insertion into database failed.",
            \OSS\AppException::SAVE_INTO_DATABASE_FAILED
          );
        }
        $aResult = $aNewSitePOISitePOI;
      }
    }
    return $aResult;
  }

  /**
   * Set some acceptable durations in database
   * The input data is a collection of array, each of these array with 2 fields
   *  id : the id of the concerned site_poisitepoi item (durations without ids will be ignored)
   *  acceptable_duration : the new acceptable duration in ms
   * @param array $aData : the new durations
   * @return boolean : whether the operations succeeded or not
   */
  function setAcceptableDurations($aData){
    $oPOIDAO = new \OSS\Model\POIDAO();
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $bResult = true;
    foreach($aData as $aDuration){
      if(isset($aDuration['id'])){
        $aOldData = $oAuditTrailCtrl->getRecordData($aDuration['id'],'site_poisitepoi');
        $bResult &= $oPOIDAO->updateSitePOISitePOI($aDuration);
        $oAuditTrailCtrl->afterDataUpdate($aDuration['id'],$aOldData,'site_poisitepoi');  
      }
    }
    return $bResult;
  }

  /**
   * Call mapbox API to set the travel durations between the considered insitution POI and the associated
   *   set of home POIs. According to the input $sDirection parameter, we consider only the direction from
   *   the institution to the set of POIs ($sDirection=="from") or from the set of POIs to the institution
   *   ($sDirection=="to").
   * In order to save some calls to the router, the travel durations for which the acceptable duration is already
   *   set are not computed again.
   * @param $aInstitutionPOI array : institution POI with a set of associated home POIs (input/output param)
   * @param $sDirection string : considered direction :"from"=from the institution POI, "to"= to the institution POI
   */
  public function setInstitutionPOIDurations(&$aInstitutionPOI,$sDirection){
    // We keep only the home POIs for which the travel direction from or to (according to the considered
    //   direction) the institution POI is unknown.
    $sFlag = ($sDirection=="from") ? 'acceptableDurationFromInstitution' : 'acceptableDurationToInstitution';
    $aPOIsWithoutDuration = array();
    foreach($aInstitutionPOI['pois'] as $aPOI){
      if(!isset($aPOI[$sFlag])){
        $aPOIsWithoutDuration[]=$aPOI;
      }
    }
    // Compute the duration matrix between the institution POI and the filtered home POIs
    $sCoordinates=$aInstitutionPOI['coordinates'][0].','.$aInstitutionPOI['coordinates'][1];
    if(count($aPOIsWithoutDuration)>0){
      // Format the set of POIs for the institution
      foreach($aPOIsWithoutDuration as $aPOIWithoutDuration){
        $sCoordinates.=";".$aPOIWithoutDuration['coordinates'][0].','.$aPOIWithoutDuration['coordinates'][1];
      }
      // Call router to get a duration matrix
      $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
      $aResult=$oRoutingCtrl->getVector($sCoordinates,$sDirection);
      // Associate the returned durations with the home POIs
      for($i=0;$i<count($aPOIsWithoutDuration);$i++){
        $aPOIsWithoutDuration[$i][$sDirection]=$aResult[$i];
      }
    }
    // Update the input data with the durations returned by the router
    foreach($aInstitutionPOI['pois'] as &$aPOI){
      foreach($aPOIsWithoutDuration as $aPOIWithoutDuration){
        if($aPOI['id'] == $aPOIWithoutDuration['id']){
          $aPOI[$sDirection]=$aPOIWithoutDuration[$sDirection];
          break;
        }
      }
    }
  }

  /**
   * Compute a set of acceptable travel durations for a set of POIs associated to HRs.
   * A HR POI can be associated to several acceptable durations : for every POI of every institution
   *    the HR is associated to, there will be an acceptable duration
   * This function will also update the found acceptable travel durations in database
   * @param array $aData : array of POI ids for which we need compute the acceptable durations
   * @return array : set of POI, each one with id and a set of acceptable durations in ms
   */
  public function updateAcceptableDurations($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=array();
    if(count($aData)>0){
      $oPOIDAO = new \OSS\Model\POIDAO();
      // Get the list of institution POIs concerned by the set of input home POIs
      $aInstitutionPOIs = $oPOIDAO->listInstitutionPOIs($aData);
      foreach($aInstitutionPOIs as &$aInstitutionPOI){
        // Set the travel durations by calling the router when the acceptable durations are missing
        $this->setInstitutionPOIDurations($aInstitutionPOI,"from");
        $this->setInstitutionPOIDurations($aInstitutionPOI,"to");
        // Turn travel durations into acceptable travel durations and save to database
        foreach($aInstitutionPOI['pois'] as &$aPOI){
          if(isset($aPOI["from"])){
            $aPOI['acceptableDurationFromInstitution']=$this->computeAcceptableDuration($aPOI["from"]);
            $this->saveSitePOISitePOI(array(
              'site_poi_id_start'=>$aInstitutionPOI['id'],
              'site_poi_id_end'=>$aPOI['id'],
              'acceptable_duration'=>$aPOI['acceptableDurationFromInstitution'],
              'duration'=>$aPOI["from"]*1000,
            ));
          }
          if(isset($aPOI["to"])){
            $aPOI['acceptableDurationToInstitution']=$this->computeAcceptableDuration($aPOI["to"]);
            $this->saveSitePOISitePOI(array(
              'site_poi_id_start'=>$aPOI['id'],
              'site_poi_id_end'=>$aInstitutionPOI['id'],
              'acceptable_duration'=>$aPOI['acceptableDurationToInstitution'],
              'duration'=>$aPOI["to"]*1000,
            ));
          }
        }
      }
      // Prepare the output by associating every input POI to a set of acceptable durations
      $aResult=array();
      foreach($aData as $sInputPOIID){
        $aOutputPOI=array('id'=>$sInputPOIID,'acceptableDurations'=>array());
        foreach($aInstitutionPOIs as &$aInstitutionPOI){
          foreach($aInstitutionPOI['pois'] as &$aPOI){
            if($sInputPOIID==$aPOI['id']){
              $aOutputPOI['acceptableDurations'][]=array(
                'institutionPOIId'=>$aInstitutionPOI['id'],
                'homePOIId'=>$aPOI['id'],
                'fromInstitution'=>$aPOI['acceptableDurationFromInstitution'],
                'toInstitution'=>$aPOI['acceptableDurationToInstitution']
              );
            }
          }
        }
        $aResult[]=$aOutputPOI;
      }
    }
    $this->setResult($aResult);
    return $aResult;
  }

  /**
   * Get the acceptable travel durations for a HR POI.
   * The input data must contain 2 string fields :
   *   "poiCoordinates" (the HR POI coordinates), for instance "0.2545,45.888"
   *   "institutionsCoordinates" (the institution POIs coordinates), for instance "0.7585,46.7877;0.566,46.578"
   *   "institutionsIds" (the institution Ids) separated by semicolon characters
   * All input coordinates must be provided in mapbox format (lon,lat;lon,lat;...)
   * The result is a number of milliseconds
   * @param array $aData : the input coordinates
   * @return float : a set of durations in milliseconds
   */
  public function getAcceptableDurations($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
    $aDurations=array('from'=>array(),'to'=>array());
    if(isset($aData["poiCoordinates"]) && $aData["poiCoordinates"]!="" && isset($aData["institutionsCoordinates"]) && $aData["institutionsCoordinates"]!=""){
      $sCoordinates=$aData["poiCoordinates"] . ";" . $aData["institutionsCoordinates"];
      $aDurations['from']=$oRoutingCtrl->getVector($sCoordinates,"from");
      $aDurations['to']=$oRoutingCtrl->getVector($sCoordinates,"to");
    }
    $aInstitutionIds = explode(";",$aData['institutionsIds']);
    $aResult = array();
    for($i=0;$i<count($aInstitutionIds);$i++){
      $aResult[]=array(
        'institutionPOIId'=>$aInstitutionIds[$i],
        'fromInstitution'=>$this->computeAcceptableDuration($aDurations["from"][$i]),
        'toInstitution'=>$this->computeAcceptableDuration($aDurations["to"][$i])
      );
    }
    $this->setResult($aResult);
    return $aResult;
  }

  /**
   * Get the list of institutions attached to a POI of type HOME.
   * The list of institutions is obtained by considering the HR that is linked to the input Home POI
   * And the by considering the list of institutions that is linked to that HR.
   * @param string $sHomePOIId : a POI identifier of type HOME
   * @return array : a list of institutions
   */
  public function getInstitutions($sHomePOIId){
    $oPOIDAO = new \OSS\Model\POIDAO();
    return $oPOIDAO->getInstitutions($sHomePOIId);
  }
}