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
 *  Class to handle Routing
 *  @creationdate 2019-07-08
 **/

namespace OSS\Model;

use PDO;
use OSS\BaseObject;

/**
* Class for handling Routing
*/
class RoutingDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
   * Get the directions for a set of coordinates
   * @param $sCoordinates string : set of coordinates in (lon,lat;...;lon,lat) format
   * @return array : set of routes information send by the router
   */
  public function directionsMapbox($sCoordinates){
    // For each input coordinate, add a curb parameters, meaning that the vehicle has to stop on the right side of the
    //   road for passengers embarking/disembarking
    $sApproaches="";
    $aCoordinates= explode(";",$sCoordinates);
    foreach($aCoordinates as $aCoordinate){
      if($sApproaches!=""){
          $sApproaches.=";";
      }
      $sApproaches.="curb";
    }
    $sURL =  $this->config('MAPBOX_SERVER')."/directions/v5/mapbox/driving/".$sCoordinates;
    $sURL .= "?geometries=geojson&approaches=".$sApproaches."&overview=full";
    $sURL .= "&access_token=".$this->config('MAPBOX_KEY');
    $mapBoxRouter = curl_init($sURL);
    curl_setopt($mapBoxRouter, CURLOPT_RETURNTRANSFER, true);
    $jsonResult = curl_exec($mapBoxRouter);
    return json_decode($jsonResult,true);
  }

  /**
   * Get the directions for a set of coordinates (time dependant version)
   * The provided departure or arrival date enables to get a time dependant matrix
   * @param $sCoordinates string : set of coordinates in (lon,lat;...;lon,lat) format
   * @param integer $iDepartureDt : the start date for the route computation in milliseconds ("" if undefined)
   * @param integer $iArrivalDt : the end date for the route computation in milliseconds ("" if undefined)
   * @return array : set of routes information send by the router
   */
  public function directionsTomTom($sCoordinates,$iDepartureDt,$iArrivalDt){
    // Compute a time restriction clause based on departure date or on arrival date
    $sTimeRestrictionClause = "";
    if($iDepartureDt=="" && $iArrivalDt==""){
      $this->log()->warn([
        "method"=>__METHOD__,
        "message"=>"Arrival date and departure date are both undefined"
      ]);
    }
    else{
      if($iDepartureDt!=""){
        if($iDepartureDt<time()*1000){
          $this->log()->warn([
            "method"=>__METHOD__,
            "message"=>"Departure time for matrix computation should be in the future",
            "data"=>$iDepartureDt
          ]);
        }
        else{
          $sTimeRestrictionClause = "&departAt=".date("Y-m-d\TH:i:s",round($iDepartureDt/1000));
        }
      }
      else{
        if($iArrivalDt<time()*1000){
          $this->log()->warn([
            "method"=>__METHOD__,
            "message"=>"Arrival time for matrix computation should be in the future",
            "data"=>$iArrivalDt
          ]);
        }
        else{
          $sTimeRestrictionClause = "&arriveAt=".date("Y-m-d\TH:i:s",round($iArrivalDt/1000));
        }
      }
    }
    // change the coordinates style : mapbox uses (lon,lat;...;lon,lat) and tom tom (lat,lon:...:lat,lon)
    $aCoordinates = explode(";",$sCoordinates);
    $aLatLonArray = array();
    foreach($aCoordinates as $sCoordinate){
      $aLonLat = explode(",",$sCoordinate);
      $aLatLonArray[] = $aLonLat[1] . "," . $aLonLat[0];
    }
    $sTomtomCoordinates = implode(":",$aLatLonArray);
    $sURLOptions = "key=".$this->config('TOMTOM_KEY');
    $sURLOptions.= "&traffic=true";
    $sURLOptions.= "&computeTravelTimeFor=all";
    $sURLOptions.= "&travelMode=truck";
    $sURLOptions.= $sTimeRestrictionClause;
    $sURL =  $this->config('TOMTOM_SERVER')."/routing/1/calculateRoute/".$sTomtomCoordinates."/json?".$sURLOptions;
    $tomtomRouter = curl_init($sURL);
    curl_setopt($tomtomRouter, CURLOPT_RETURNTRANSFER, true);

    // Get the request results, the response http code and the request errors
    $jsonResult = curl_exec($tomtomRouter);
    $errors = curl_error($tomtomRouter);
    $response = curl_getinfo($tomtomRouter, CURLINFO_HTTP_CODE);
    $result = json_decode($jsonResult,true);

    // Turn the result into mapbox style
    if($response==200){
      $tblPoints = [];
      $legs = [];
      foreach ($result["routes"][0]["legs"] as $leg){
        foreach ($leg["points"] as $point) {
          // In mapbox style, longitude comes first and latitude second
          $tblPoints[] = [$point["longitude"],$point["latitude"]];
        }
        $legs[] = ["distance"=>$leg["summary"]["lengthInMeters"],
                   "duration"=>$leg["summary"]["travelTimeInSeconds"],
                   "steps"=>[]];
      }

      // Convert to Mapbox result
      $mapboxResult = ["code"=>"Ok","routes"=>[],"waypoints"=>[]];

      //TODO : set waypoints

      $mapboxResult["routes"][] = [
                   "distance"=>$result["routes"][0]["summary"]["lengthInMeters"],
                   "duration"=>$result["routes"][0]["summary"]["travelTimeInSeconds"],
                   "durationNoTraffic"=>$result["routes"][0]["summary"]["noTrafficTravelTimeInSeconds"],
                   // In the current version, geometry is not encoded
                   "geometry"=>array("coordinates"=>$tblPoints,"type"=>"lineString"),
                   "legs"=>$legs];
    }else{
      $mapboxResult = ["code"=>"Ko","message"=>$result["error"]["description"]];
    }
    return $mapboxResult;
  }


  /**
   * Compute a square duration and distance matrices based on provided coordinates.
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
    // For each input coordinate, add a curb parameters, meaning that the vehicle has to stop on the right side of the
    //   road for passengers embarking/disembarking
    $sApproaches="";
    $sCoordinates="";
    foreach($aPoints as $aPoint){
      if($sCoordinates!=""){
        $sCoordinates.=";";
      }
      $sCoordinates.=$aPoint["gps"][1].",".$aPoint["gps"][0];
      if($sApproaches!=""){
        $sApproaches.=";";
      }
      $sApproaches.="curb";
    }
    // Compute travel durations from the institution to every considered POIs
    $sURL =  "https://api.mapbox.com/directions-matrix/v1/mapbox/driving/".$sCoordinates."?";
    $sURL .= "annotations=duration,distance&approaches=".$sApproaches."&access_token=".$this->config('MAPBOX_KEY');
    $mapBoxRouter = curl_init($sURL);
    curl_setopt($mapBoxRouter, CURLOPT_RETURNTRANSFER, true);
    $jsonResult = curl_exec($mapBoxRouter);
    $aRawResult = json_decode($jsonResult,true);
    // According to the mapbox doc, the first subarray in distances array represents the distance from
    //   the first point to the other points, same thing for the times
    return $aRawResult;
  }


  /**
   * Compute a square duration and distance matrices based on provided coordinates.
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
    $sCoordinates="";
    foreach($aPoints as $aPoint){
      if($sCoordinates!=""){
        $sCoordinates.=";";
      }
      $sCoordinates.=$aPoint["gps"][1].",".$aPoint["gps"][0];
    }
    // Compute travel durations from the institution to every considered POIs
    $sURL =  $this->config('OSRM_HOST') . ":" . $this->config('OSRM_PORT') . "/table/v1/driving/".$sCoordinates;
    $sURL .= "?annotations=duration,distance";
    $mapBoxOSRM = curl_init($sURL);
    curl_setopt($mapBoxOSRM, CURLOPT_RETURNTRANSFER, true);
    $jsonResult = curl_exec($mapBoxOSRM);
    $aRawResult = json_decode($jsonResult,true);
    return $aRawResult;
  }


  /**
   * Send a request to the tomtom service for matrix computation. Since computation can be quite long,
   *   the request will be asynchronous. We launch a computation and get the URI for downloading the
   *   results.
   * The computed matrix is time dependent : we have to provide a reference date as a unix time stamp
   *   and this date must be in the future, and we have to tell whether this reference date is an arrival or
   *   a departure date.
   * The input points must be formatted in tomtom way (see tomtom documentation)
   * @param array $aPoints : a set of points that will be the departure and the arrival points
   * @param integer $iReferenceDt : the reference date for the matrix computation (in milliseconds)
   * @param boolean $bArrival : whether the reference date for the matrix computation is a departure or an arrival date
   * @return string : a download URI for the matrix results (empty string in case of failure)
   */
  public function requestMatrixTomtomAsynchronous($aPoints,$iReferenceDt,$bArrival){
    $sReferenceDt = date("Y-m-d\TH:i:s",round($iReferenceDt/1000));
    // The call to the matrix computation will be asynchronous : the body of the response will be empty, and we will get
    //   a download ling from the header (so we have to activate the display of the header in the curl response)
    $sURLOptions  = "key=".$this->config('TOMTOM_KEY');
    $sURLOptions .= "&traffic=true";
    $sURLOptions .= "&computeTravelTimeFor=all";
    $sURLOptions .= "&travelMode=truck";
    if($bArrival){
      $sURLOptions .= "&arriveAt=".$sReferenceDt;
    }
    else{
      $sURLOptions .= "&departAt=".$sReferenceDt;
    }

    $options = array(
      CURLOPT_HEADER => 1,
      CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
      CURLOPT_URL => $this->config('TOMTOM_SERVER')."/routing/1/matrix/json?".$sURLOptions,
      CURLOPT_FRESH_CONNECT => 1,
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_FORBID_REUSE => 1,
      CURLOPT_FAILONERROR => true,
      CURLOPT_TIMEOUT => 30,
      CURLOPT_POSTFIELDS => json_encode($aPoints)
    );
    $ch = curl_init();
    curl_setopt_array($ch, ($options));
    $sResponse = curl_exec($ch);
    $sDowloadURI="";
    if($sResponse===false) {
      $sCurlError = curl_error($ch);
      $this->log()->warn(["method"=>__METHOD__,"message"=>"Call to Tomtom router failed","data"=>$sCurlError]);
      curl_close($ch);
    }
    else{
      // Tomtom request was sent. Below is an example of a possible response (header without a body)
      //
      // HTTP/1.1 303 See Other
      // Access-Control-Allow-Origin: *
      // Access-Control-Expose-Headers: Content-Length,Location,Tracking-ID
      // Date: Mon, 08 Jul 2019 09:54:08 GMT
      // Location: /routing/1/matrix/b1-92cf2679-c4a0-49b4-8bc7-b96730b888fb-0001?key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      // Tracking-ID: e1aa6982-90d2-4cd8-abbd-edeb83a7e205
      // Content-Length: 0
      // Connection: keep-alive
      //
      // The line starting with Location contains the download URI
      // To turn it into a URL, add https://api.tomtom.com at the start if the URI
      curl_close($ch);
      // Parse the header to extract the response download URI (normally found in the "Location:" section)
      foreach(preg_split("/((\r?\n)|(\r\n?))/",$sResponse) as $sLine){
        if (stripos($sLine, 'Location:') === 0) {
          $sDowloadURI = trim(explode(":", $sLine, 2)[1]);
        }
      }
    }
    return $sDowloadURI;
  }

  /**
   * Download a tomtom matrix given a download URL.
   * This function returns an array with 3 fields:
   *   matrix : the computed matrices, string encoded as a json
   *   httpCode : 200 if the matrix was computed, another value otherwise
   *   error : in case there were some error in the CURL call
   * @param string $sDowloadURL : the URL for download
   * @return array : a matrix in tomtom format (see tomtom documentation) and a http code and an error message
   */
  public function downloadMatrixTomtomAsynchronous($sDowloadURL){
    $aResult = array("matrix"=>"","httpCode"=>0,"error"=>"");
    if($sDowloadURL==''){
      $this->log()->warn(["method"=>__METHOD__,"message"=>"Empty download URL for tomtom matrix download"]);
    }
    else{
      $options = array(
        CURLOPT_HEADER => 0,
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_URL => $sDowloadURL,
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_FAILONERROR => true,
        CURLOPT_TIMEOUT => 10
      );
      $ch = curl_init();
      curl_setopt_array($ch, ($options));
      $aResult["matrix"] = curl_exec($ch);
      $aResult["httpCode"] = curl_getinfo($ch, CURLINFO_HTTP_CODE);
      if($aResult["matrix"] === false) {
        $aResult["error"] = curl_error($ch);
      }
      curl_close($ch);
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
    $aCoordinates = explode(";",$sCoordinates);
    // For each input coordinate, add a curb parameters, meaning that the vehicle has to stop on the right side of the
    //   road for passengers embarking/disembarking
    // The must be one "curb" occurrence per input coordinate
    $sApproaches="curb";
    $sPositions = "";
    for($i=1;$i<count($aCoordinates);$i++){
      if($sPositions!=""){
        $sPositions .= ";";
      }
      $sPositions .= $i;
      $sApproaches.=";curb";
    }
    // Compute travel durations from the institution to every considered POIs
    $sURL =  $this->config('MAPBOX_SERVER')."/directions-matrix/v1/mapbox/driving/".$sCoordinates."?approaches=".$sApproaches."&";
    $sURL .= ($sDirection=="from") ? "sources=0&destinations=".$sPositions : "sources=".$sPositions."&destinations=0";
    $sURL .= "&access_token=".$this->config('MAPBOX_KEY');
    $mapBoxRouter = curl_init($sURL);
    curl_setopt($mapBoxRouter, CURLOPT_RETURNTRANSFER, true);
    $jsonResult = curl_exec($mapBoxRouter);
    $aRawResult = json_decode($jsonResult,true);
    $aResult = array();
    // In case the direction is "from", return the durations array, and in case the direction is "to", transpose
    //    the duration matrix befor returning.
    if($sDirection == "from"){
      if(isset($aRawResult["durations"]) && count($aRawResult["durations"])>0){
        // Duration matrix from institution POIs to home POI is an array with a collection of float values
        $aResult = $aRawResult["durations"][0];
      }
    }
    else{
      if(isset($aRawResult["durations"])){
        // Duration matrix from home POIs to institution POI is a collection of arrays with one float value,
        //   it needs be transposed into an array with a collection of float values
        foreach($aRawResult["durations"] as $aDurations){
          $aResult[] = $aDurations[0];
        }
      }
    }
    return $aResult;
  }

}
