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
 *  REST service to handle Routing
 *  @creationdate 2019-07-08
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class RoutingCtrl extends BaseObject{

  /**
   * Return a time stamp corresponding to a French local time at midnight for a day corresponding to
   *   the provided timeslot id. For instance if the timeslot id corresponds to a monday, the function will
   *   return a time stamp corresponding to a French local time at midnight on a monday.
   * In the current version, this function dos not enable to choose the week nor the year, only the day
   *   of week can be chosen through $sTimeslotId input parameter
   * @param string $sTimeslotId
   * @return integer unix time stamp (in milliseconds)
   */
  function getMidnightTimestamp($sTimeslotId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sTimeslotId]);
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $aTimeslot = $oThesaurusCtrl->get($sTimeslotId);
    // Extract the day (MONDAY, TUESDAY, ...) from the thesaurus code
    $sDay = explode('_',$aTimeslot['code'])[0];
    return $this->config($sDay.'_REFERENCE_DT');
  }

  /**
   * Round a day time given in milliseconds to the closest hour.
   * This enables to request tomtom matrix computation with fewer arrival or departure dates, thus
   *   making easier to reuse matrix cache.
   * @param integer $iTimeInMs : a time expressed as a number of milliseconds from midnight
   * @return integer : a time expressed as a number of milliseconds from midnight, rounded to the closest hour
   */
  function roundDayTime($iTimeInMs){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$iTimeInMs]);
    $iNumberOfHours = round($iTimeInMs/(3600*1000));
    return $iNumberOfHours*3600*1000;
  }

  /**
   * Get the directions for a set of coordinates
   * To get a route at a given date and time, you can specify the timeslot id and departure local time
   *   or an arrival local time
   * The time slot id enables to target a specific day of week (optional).
   * The departure local time or arrival local time has to be provided as a unix time stamp and has
   *   to be expressed in ms (optional)
   * @param $sCoordinates string : set of coordinates in (lon,lat;...;lon,lat) format
   * @param array $aTimeSettings : timeslot and arrival/departure times
   * @return array : set of direction information send by the router
   */
  public function directions($sCoordinates,$aTimeSettings){
    $this->log()->debug(["method"=>__METHOD__,"data"=>array($sCoordinates,$aTimeSettings)]);
    $oRoutingDAO = new \OSS\Model\RoutingDAO();
    $aDirections = array();
    if(!isset($aTimeSettings["departureLocalTime"]) && !isset($aTimeSettings["arrivalLocalTime"])){
      $aDirections = $oRoutingDAO->directionsMapbox($sCoordinates);
    }
    else{
      // Computation of the departure date
      if(isset($aTimeSettings["departureLocalTime"])){
        $iDepartureDt = $this->getMidnightTimestamp($aTimeSettings["timeslotId"])+$aTimeSettings["departureLocalTime"];
        $aDirections = $oRoutingDAO->directionsTomTom($sCoordinates,$iDepartureDt,"");
      }
      else{
        $iArrivalDt = $this->getMidnightTimestamp($aTimeSettings["timeslotId"])+$aTimeSettings["arrivalLocalTime"];
        $aDirections = $oRoutingDAO->directionsTomTom($sCoordinates,"",$iArrivalDt);
      }
    }
    return $aDirections;
  }

  /**
   * Compute a square duration and distance matrices based on provided coordinates using Mapbox API.
   * The ouput structure is the following, where distance(i,j) is the distance between input points i and j.
   *   "code":"Ok",
   *   "distances":[[distance(1,1), ... distance(1,N)],...,[distance(N,1), ... distance(N,N)]],
   *   "durations":[[duration(1,1), ... duration(1,N)],...,[duration(N,1), ... duration(N,N)]],
   *   "destinations":[...],
   *   "sources":[...]
   * The input data is an array of points that will serve for matrix computation. They must all contain a
   *    'gps' field with the format array(lat,lon)
   * @param array $aPoints : the points for the matrix computation (should contain a gps field)
   * @return structure containing the distance and durations matrices (in meters and seconds)
   */
  public function getMatrixMapbox($aPoints){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aPoints]);
    $oRoutingDAO = new \OSS\Model\RoutingDAO();
    return $oRoutingDAO->getMatrixMapbox($aPoints);
  }

  /**
   * Compute a square duration and distance matrices based on provided coordinates using OSRM API.
   * The ouput structure is the following, where distance(i,j) is the distance between input points i and j.
   *   "code":"Ok",
   *   "distances":[[distance(1,1), ... distance(1,N)],...,[distance(N,1), ... distance(N,N)]],
   *   "durations":[[duration(1,1), ... duration(1,N)],...,[duration(N,1), ... duration(N,N)]],
   *   "destinations":[...],
   *   "sources":[...]
   * The input data is an array of points that will serve for matrix computation. They must all contain a
   *    'gps' field with the format array(lat,lon)
   * @param array $aPoints : the points for the matrix computation (should contain a gps field)
   * @return structure containing the distance and durations matrices (in meters and seconds)
   */
  public function getMatrixOSRM($aPoints){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aPoints]);
    $oRoutingDAO = new \OSS\Model\RoutingDAO();
    return $oRoutingDAO->getMatrixOSRM($aPoints);
  }

  /**
   * Given a set of input origin points and destination points for a matrix computation, prepare a set of blocks
   *   which size is compatible with TomTom router capabilities.
   * Each block is provided with the involved origin POI IDs and destination POI IDs and the input origins and
   *    destinations coordinates that shall be provided to Tomtom router for the block computation.
   * @param array $aOrigins : origin points for the matrix computation (should contain a tempId and a gps field)
   * @param array $aDestinations : destination points for the matrix computation (should contain a tempId and a gps field)
   * @return array : a set of matrix blocks to be sent to Tomtom for distances and durations computation
   */
  public function makeMatrixBlocks($aOrigins,$aDestinations){
    $this->log()->debug(["method"=>__METHOD__,"data"=>array($aOrigins,$aDestinations)]);
    // Dimension of the matrix that is based on the input points
    $iWidth=count($aOrigins);
    $iHeight=count($aDestinations);
    $aBlocks = array();
    if($iWidth>0 && $iHeight>0){
      $x=0;
      $y=0;
      // The maximal block size (depends on tomtom capabilities)
      $iMaxBlockSize=$this->config('TOMTOM_MATRIX_MAX_POINTS');
      // Compute the position for each block in the global matrix
      while($y<$iHeight){
        $iMinX = $x;
        $iMaxX = $x+$iMaxBlockSize-1;
        // control that the block is not out of the global matrix
        if($iMaxX>$iWidth-1){
          $iMaxX=$iWidth-1;
        }
        $iMinY = $y;
        $iMaxY = $y+$iMaxBlockSize-1;
        // control that the block is not out of the global matrix
        if($iMaxY>$iHeight-1){
          $iMaxY=$iHeight-1;
        }
        $aNewBlock=array(
          // To keep the origin POI IDs
          "originPOIIDs"=>array(),
          // To keep the destination POI IDs
          "destinationPOIIDs"=>array(),
          // To format the GPS coordinates in TomTom style
          "points"=>array("origins"=>array(),"destinations"=>array())
        );
        for($i=$iMinX;$i<=$iMaxX;$i++){
          // Keep into memory the origin POI IDs for storage into cache
          $aNewBlock["originPOIIDs"][]=$aOrigins[$i]["tempId"];
          // Format the data into TomTom style for each block
          $aNewBlock["points"]["origins"][]=array(
            "point"=>array("latitude"=>$aOrigins[$i]["gps"][0],"longitude"=>$aOrigins[$i]["gps"][1])
          );
        }
        for($j=$iMinY;$j<=$iMaxY;$j++){
          // Keep into memory the destination POI IDs for storage into cache
          $aNewBlock["destinationPOIIDs"][]=$aDestinations[$j]["tempId"];
          // Format the data into TomTom style for each block
          $aNewBlock["points"]["destinations"][]=array(
            "point"=>array("latitude"=>$aDestinations[$j]["gps"][0],"longitude"=>$aDestinations[$j]["gps"][1])
          );
        }
        $aBlocks[]=$aNewBlock;
        // Update $x and $y for the next block computation
        $x=$iMaxX+1;
        if($x>$iWidth-1){
          // Start a new row of blocks
          $x=0;
          $y=$iMaxY+1;
        }
      }
    }
    return $aBlocks;
  }

  /**
   * Given a matrix and the corresponding entries that could be retrieved in cache,
   *   check which origin points have some cache associated to them, and which origin points have no cache
   *   at all.
   * The input points from $aOriginPoints are sorted into 2 arrays :
   *   withCache : an origin point O from $aOriginPoints will be stored in this array when there exist at least
   *     one destination point D in $aDestinationPoints input array such that the distance and duration between O
   *     and D is already in cache.
   *   withoutCache : an origin point O from $aOriginPoints will be stored in this array when there exist no
   *     destination point D in $aDestinationPoints input array such that the distance and duration between O
   *     and D is already in cache.
   * @param array $aOriginPoints : the input origin points that enable to build the matrix
   * @param array $aDestinationPoints : the input destination points that enable to build the matrix
   * @param array $aMatrixCache : the cache values that could be retrieved for the input matrix
   * @return array with 2 array fields : withCache and withoutCache
   */
  function checkEmptyCacheForOriginPoints($aOriginPoints,$aDestinationPoints,$aMatrixCache){
    $aResult = array("withoutCache"=>array(),"withCache"=>array());
    foreach($aOriginPoints as $aOriginPoint){
      $bWithCache=false;
      foreach($aDestinationPoints as $aDestinationPoint){
        // Check whether the route from $aOriginPoint to $aDestinationPoint is in cache
        $bCellFoundInCache=false;
        foreach($aMatrixCache as $aCell){
          if($aCell["site_poi_id_start"]==$aOriginPoint["tempId"] && $aCell["site_poi_id_end"]==$aDestinationPoint["tempId"]){
            $bCellFoundInCache = true;
            break;
          }
        }
        if($bCellFoundInCache){
          $bWithCache=true;
          break;
        }
      }
      if(!$bWithCache){
        $aResult["withoutCache"][]=$aOriginPoint;
      }
      else{
        $aResult["withCache"][]=$aOriginPoint;
      }
    }
    return $aResult;
  }

  /**
   * Given a matrix and the corresponding entries that could be retrieved in cache,
   *   check which destination points have some cache associated to them, and which destination points have
   *   no cache at all.
   * The input points from $aDestinationPoints are sorted into 2 arrays :
   *   withCache : a destination point D from $aDestinationPoints will be stored in this array when there exist
   *     at least one origin point O in $aOriginPoints input array such that the distance and duration between O
   *     and D is already in cache.
   *   withoutCache : a destination point D from $aDestinationPoints will be stored in this array when there exist
   *     no origin point O in $aOriginPoints input array such that the distance and duration between O and D is
   *     already in cache.
   * @param array $aOriginPoints : the input origin points that enable to build the matrix
   * @param array $aDestinationPoints : the input destination points that enable to build the matrix
   * @param array $aMatrixCache : the cache values that could be retrieved for the input matrix
   * @return array with 2 array fields : withCache and withoutCache
   */
  function checkEmptyCacheForDestinationPoints($aOriginPoints,$aDestinationPoints,$aMatrixCache){
    $aResult = array("withoutCache"=>array(),"withCache"=>array());
    foreach($aDestinationPoints as $aDesinationPoint){
      $bWithCache=false;
      foreach($aOriginPoints as $aOriginPoint){
        // Check whether the route from $aOriginPoint to $aDesinationPoint is in cache
        $bCellFoundInCache=false;
        foreach($aMatrixCache as $aCell){
          if($aCell["site_poi_id_start"]==$aOriginPoint["tempId"] && $aCell["site_poi_id_end"]==$aDesinationPoint["tempId"]){
            $bCellFoundInCache = true;
            break;
          }
        }
        if($bCellFoundInCache){
          $bWithCache=true;
          break;
        }
      }
      if(!$bWithCache){
        $aResult["withoutCache"][]=$aDesinationPoint;
      }
      else{
        $aResult["withCache"][]=$aDesinationPoint;
      }
    }
    return $aResult;
  }

  /**
   * Given a matrix and the corresponding entries that could be retrieved in cache,
   *   check which origin points have some incomplete cache associated to them.
   * The returned array is a subset from $aOriginPoints. Every returned origin point O is chosen such that
   *   there exist at least one destination point D from $aDestinationPoints such that there is no
   *   duration and distance cache between O and D
   * @param array $aOriginPoints : the input origin points that enable to build the matrix
   * @param array $aDestinationPoints : the input destination points that enable to build the matrix
   * @param array $aMatrixCache : the cache values that could be retrieved for the input matrix
   * @return array a subset from $aOriginPoints with the origin points having incomplete cache
   */
  function checkIncompleteCacheForOriginPoints($aOriginPoints,$aDestinationPoints,$aMatrixCache){
    $aResult=array();
    foreach($aOriginPoints as $aOriginPoint){
      $bWithMissingCache=false;
      foreach($aDestinationPoints as $aDestinationPoint){
        // Check whether the route from $aOriginPoint to $aDestinationPoint is in cache
        $bCellFoundInCache=false;
        foreach($aMatrixCache as $aCell){
          if($aCell["site_poi_id_start"]==$aOriginPoint["tempId"] && $aCell["site_poi_id_end"]==$aDestinationPoint["tempId"]){
            $bCellFoundInCache = true;
            break;
          }
        }
        if(!$bCellFoundInCache){
          $bWithMissingCache=true;
          break;
        }
      }
      if($bWithMissingCache){
        $aResult[]=$aOriginPoint;
      }
    }
    return $aResult;
  }

  /**
   * Given a matrix and the corresponding entries that could be retrieved in cache,
   *   check which destination points have some incomplete cache associated to them.
   * The returned array is a subset from $aDestinationPoints. Every returned origin point D is chosen such that
   *   there exist at least one origin point O from $aOriginPoints such that there is no
   *   duration and distance cache between O and D
   * @param array $aOriginPoints : the input origin points that enable to build the matrix
   * @param array $aDestinationPoints : the input destination points that enable to build the matrix
   * @param array $aMatrixCache : the cache values that could be retrieved for the input matrix
   * @return array a subset from $aOriginPoints with the origin points having incomplete cache
   */
  function checkIncompleteCacheForDestinationPoints($aOriginPoints,$aDestinationPoints,$aMatrixCache){
    $aResult=array();
    foreach($aDestinationPoints as $aDestinationPoint){
      $bWithMissingCache=false;
      foreach($aOriginPoints as $aOriginPoint){
        // Check whether the route from $aOriginPoint to $aDestinationPoint is in cache
        $bCellFoundInCache=false;
        foreach($aMatrixCache as $aCell){
          if($aCell["site_poi_id_start"]==$aOriginPoint["tempId"] && $aCell["site_poi_id_end"]==$aDestinationPoint["tempId"]){
            $bCellFoundInCache = true;
            break;
          }
        }
        if(!$bCellFoundInCache){
          $bWithMissingCache=true;
          break;
        }
      }
      if($bWithMissingCache){
        $aResult[]=$aDestinationPoint;
      }
    }
    return $aResult;
  }

  /**
   * Request the computation of a distance and time matrix using Tomtom API.
   * The computation will be asynchronous : we get a set of download URLs as a result
   * The computation will be time-dependant : we have to provide a date (in the future) that will be a reference
   *    to compute the durations and distance of the matrix, taking into account the expected traffic at that date.
   * The input data is an array of points that will serve for matrix computation. They must all contain a
   *    'gps' field with the format array(lat,lon)
   * The ouput data is an contains the following fields:
   *   referenceDt : the reference date that is used for the matrix computation
   *   bArrival : whether the reference date is an arrival or departure date
   *   blocks : [optional] array of blocks (missing in case of problem)
   * Each block present in the blocks array comes with the following fields:
   *   originPOIIDs : the ID of the POIs that serve as origin points in the block
   *   destinationPOIIDs : the ID of the POIs that serve as destination points in the block
   *   points : the set of points given as an input for tomtom router
   *   url : the download url for the block
   * @param array $aPoints : the points for the matrix computation (should contain a gps and a tempId field)
   * @param integer $iReferenceDt : the reference date for the matrix computation (unix time stamp, milliseconds)
   * @param boolean $bArrival : whether the reference date is an arrival date or a departure date
   * @return array a set of download URLs for the blocks of the distance and duration matrix
   */
  public function requestMatrixTomtomAsynchronous($aPoints,$iReferenceDt,$bArrival){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aPoints,$iReferenceDt,$bArrival)]);
    $aResult=array("referenceDt"=>$iReferenceDt,"bArrival"=>$bArrival);
    // Check that the reference date is in the future
    if($iReferenceDt<time()*1000){
      $this->log()->warn([
        "method"=>__METHOD__,
        "message"=>"Reference time for matrix computation should be in the future",
        "data"=>$iReferenceDt
      ]);
    }
    else{
      $aResult["blocks"]=array();
      $oPOICtrl = new \OSS\Ctrl\POICtrl();
      // Get cache from database
      $aMatrixCache = $oPOICtrl->getMatrixCache($aPoints,$iReferenceDt,$bArrival);
      // Sort origin and destination points according to the presence of cache (no cache vs some cache)
      $aOriginPoints = $this->checkEmptyCacheForOriginPoints($aPoints,$aPoints,$aMatrixCache);
      $aDestinationPoints = $this->checkEmptyCacheForDestinationPoints($aPoints,$aPoints,$aMatrixCache);
      // Now, considering the submatrix formed by origin and destination points associated to some cache,
      //   sort origin and destination according to the presence of missing cache (full cache vs some missing cache)
      $aOriginPointsWithMissingCache = $this->checkIncompleteCacheForOriginPoints($aOriginPoints["withCache"],$aDestinationPoints["withCache"],$aMatrixCache);
      $aDestinationPointsWithMissingCache = $this->checkIncompleteCacheForDestinationPoints($aOriginPoints["withCache"],$aDestinationPoints["withCache"],$aMatrixCache);
      // Divide the matrix into blocks to avoid having some matrix larger than Tomtom capabilities
      $aBlocks = array_merge(
        // Blocks that enable the computation of routes from the new origins
        $this->makeMatrixBlocks($aOriginPoints["withoutCache"],$aPoints),
        // Blocks that enable the computation of routes to the new destinations (except the routes from new origins)
        $this->makeMatrixBlocks($aOriginPoints["withCache"],$aDestinationPoints["withoutCache"]),
        // Blocks that enable to update the incomplete areas of the rest of the matrices
        $this->makeMatrixBlocks($aOriginPointsWithMissingCache,$aDestinationPointsWithMissingCache)
      );
      $oRoutingDAO = new \OSS\Model\RoutingDAO();
      foreach($aBlocks as $aBlock){
        $sDownloadURI = $oRoutingDAO->requestMatrixTomtomAsynchronous($aBlock["points"],$iReferenceDt,$bArrival);
        $aResult["blocks"][] = array_merge($aBlock,array("url"=>$this->config('TOMTOM_SERVER').$sDownloadURI));
      }
    }
    return $aResult;
  }

  /**
   * Download a tomtom matrix block given a download URL.
   * The ouput structure is the following
   *   originPOIIDs : the ID of the POIs that serve as origin points in the block
   *   destinationPOIIDs : the ID of the POIs that serve as destination points in the block
   *   points : the set of points given as an input for tomtom router
   *   url : the download url for the block
   *   data : the downloaded matrix with the following subfields:
   *     "distances":[[distance(1,1), ... distance(1,N)],...,[distance(N,1), ... distance(N,N)]],
   *     "durations":[[duration(1,1), ... duration(1,N)],...,[duration(N,1), ... duration(N,N)]],
   * where distance(i,j) is the distance between input points i and j
   * Notice that when the matrix computation is not complete, data will be set to false
   * @param array $aBlock : contains the URL for the download of a block
   * @return array : Same as input data but enriched with a data field
   */
  public function downloadBlockTomtomAsynchronous($aBlock){
    $aResult = array();
    $oRoutingDAO = new \OSS\Model\RoutingDAO();
    if(isset($aBlock["data"]) && $aBlock["data"] !== false){
      // In case the block was already downloaded, no need to download it again
      $aResult = $aBlock;
    }
    else{
      $aMatrix = false;
      $aDownload = $oRoutingDAO->downloadMatrixTomtomAsynchronous($aBlock["url"]);
      if($aDownload["httpCode"]==200 && $aDownload["matrix"]!=""){
        $aTomTomMatrix=json_decode($aDownload["matrix"],true);
        // The obtained matrix is in tomtom format : we have to format the matrix to get back to mapbox style
        if(isset($aTomTomMatrix["matrix"])){
          $aMatrix = array("durations"=>array(),"distances"=>array());
          for($i=0;$i<count($aTomTomMatrix["matrix"]);$i++){
            $aMatrix["durations"][$i]=array();
            $aMatrix["distances"][$i]=array();
            for($j=0;$j<count($aTomTomMatrix["matrix"][$i]);$j++){
              if(isset($aTomTomMatrix["matrix"][$i][$j]["response"]) && isset($aTomTomMatrix["matrix"][$i][$j]["response"]["routeSummary"])){
                $aMatrix["durations"][$i][$j]=$aTomTomMatrix["matrix"][$i][$j]["response"]["routeSummary"]["travelTimeInSeconds"];
                $aMatrix["distances"][$i][$j]=$aTomTomMatrix["matrix"][$i][$j]["response"]["routeSummary"]["lengthInMeters"];
              }
            }
          }
        }
      }
      else{
        $this->log()->info(["method"=>__METHOD__,"message"=>"Block is not ready","data"=>$aBlock["url"]]);
      }
      $aResult = array_merge($aBlock,array("data"=>$aMatrix));
    }
    return $aResult;
  }

  /**
   * Download a tomtom matrix given a set of download URL for each block.
   * The matrix is downloaded block per block, then the downloaded durations and distances are
   *   saved to database, and last the requested matrix is recomposed from cache if possible.
   * The output data is an array with 3 fields :
   *   blocks : the input blocks with some updated information
   *   durations : [optional] the duration matrix (field will be missing when matrix is incomplete)
   *   distance : [optional] the distance matrix (field will be missing when matrix is incomplete)
   * @param array $aPoints : the input points for the matrix computation (should contain a tempId field)
   * @param array $aBlocks : the set of URL for the download of each block
   * @return array : a distance and duration matrix if available
   */
  public function downloadMatrixTomtomAsynchronous($aPoints,$aBlocks){
    $this->log()->debug(["method"=>__METHOD__,"message"=>"downloadMatrixTomtomAsynchronous","data"=>array($aPoints,$aBlocks)]);
    // First download each block and save them to database
    $oPOICtrl = new \OSS\Ctrl\POICtrl();
    $aResult=array("blocks"=>array());
    foreach($aBlocks["blocks"] as $aInputBlock){
      $aBlock = $this->downloadBlockTomtomAsynchronous($aInputBlock);
      // Initializes a boolean to tell whether the block was already saved in cache or not.
      // This will save some writing calls to site_poisitepoi table
      if(!isset($aBlock["savedToCache"])){
        $aBlock["savedToCache"]=false;
      }
      // Cache the matrix only when it is available and when we are sure it was not already cached
      if(isset($aBlock["data"]) && $aBlock["data"] !== false && !$aBlock["savedToCache"]){
        // First convert the block into a flat matrix structure that better corresponds to site_poisitepoi table
        $aMatrix = array();
        foreach($aBlock["originPOIIDs"] as $keyOrigin=>$sOriginPOIID){
          foreach($aBlock["destinationPOIIDs"] as $keyDestination=>$sDestinationPOIID){
            $aMatrix[]=array(
              "originPOIID"=>$sOriginPOIID,
              "destinationPOIID"=>$sDestinationPOIID,
              "duration"=>$aBlock["data"]["durations"][$keyOrigin][$keyDestination],
              "distance"=>$aBlock["data"]["distances"][$keyOrigin][$keyDestination]
            );
          }
        }
        // Save the matrix to database
        $oPOICtrl->saveMatrixCache($aMatrix,$aBlocks["referenceDt"],$aBlocks["bArrival"]);
        $aBlock["savedToCache"]=true;
      }
      $aResult["blocks"][]=$aBlock;
    }
    // Now we are supposed to found in cache all the necessary elements for the matrix computation, except
    //   when one of the blocks is still under computation
    $aMatrixCache = $oPOICtrl->getMatrixCache($aPoints,$aBlocks["referenceDt"],$aBlocks["bArrival"]);
    // We can quickly check whether all the matrix elements have been found in cache by counting them
    if(count($aMatrixCache) == count($aPoints)*count($aPoints)){
      $aResult["durations"]=array();
      $aResult["distances"]=array();
      foreach($aPoints as $aOriginPoint){
        $aDurations = array();
        $aDistances = array();
        foreach($aPoints as $aDestinationPoint){
          foreach($aMatrixCache as $aCell){
            if($aCell["site_poi_id_start"] == $aOriginPoint["tempId"] && $aCell["site_poi_id_end"] == $aDestinationPoint["tempId"]){
              $aDurations[]=$aCell["duration"];
              $aDistances[]=$aCell["distance"];
              break;
            }
          }
        }
        $aResult["durations"][]=$aDurations;
        $aResult["distances"][]=$aDistances;
      }
    }
    return $aResult;
  }

  /**
   * Compute a 1*n duration matrix based on coordinates between the first coordinates and the remaining ones.
   * If $sDirection==from, the output matrix will provide durations from the first coordinates to the remaining
   * Otherwise the output matrix will provide durations from the first coordinates to the remaining
   * @param string $sCoordinates : the coordinates for the matrix computation (lon,lat;lon,lat;...)
   * @param string $sDirection : the considered direction ("from" or "to")
   * @return array array of durations
   */
  public function getVector($sCoordinates,$sDirection){
    $this->log()->debug(["method"=>__METHOD__,"data"=>array($sCoordinates,$sDirection)]);
    $oRoutingDAO = new \OSS\Model\RoutingDAO();
    return $oRoutingDAO->getVector($sCoordinates,$sDirection);
  }

}