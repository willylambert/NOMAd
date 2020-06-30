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
 *  REST service to generate an instance as a JSON structure from a set of routes or a scenario
 *  @creationdate 2018-12-19
 **/

namespace OSS\Ctrl;

use Exception;

use OSS\BaseObject;

class InstanceWriterCtrl extends \OSS\BaseObject{

  /**
   * Generation of an item for the "points" array of the output structure.
   * A tempId field is added to the output to prevent from inserting twice the same point in the array of points
   * @param array $aPOI : representing a POI coming from a route.
   * @param integer $iNewId : the id of the new point
   * @return array : a point with the structure expected by the optimisation + a tempId field to be removed later
   */
  function generatePoint($aPOI,$iNewId){
    $sPointName = "";
    if($aPOI["site_type_code"] == 'HOME' && isset($aPOI["hr_firstname"]) && isset($aPOI["hr_lastname"])){
      $sPointName = $aPOI["hr_firstname"] . ' ' . $aPOI["hr_lastname"];
    }
    else{
      if(isset($aPOI["label"])){
        $sPointName = $aPOI["label"];
      }
      else{
        $sPointName = "";
      }
    }
    return array(
      "id" => $iNewId,
      "tempId" => $aPOI["id"],
      "name" =>  $sPointName,
      "address" => $aPOI["addr1"] . ' ' . $aPOI["addr2"] . ' ' . $aPOI["postcode"] . ' ' . $aPOI["city"],
      "gps" => [ $aPOI["geom"]["coordinates"][1], $aPOI["geom"]["coordinates"][0] ],
      // Service time corresponds to the time that is required to park the vehicle on the POI
      "stimeFixe" => $aPOI["service_duration"]/1000,
      "capa_user" => 0,
      // It seems that if we set capa_vehi to 0 for depots, optim fails
      "capa_vehi" => 180,
      "unitTime" => "second"
    );
  }

  /**
   * Generation of an item for the "users" array of the output structure.
   * A tempId field is added to the output to prevent from inserting twice the same user in the array of users
   * @param array $aPOI : representing a POI coming from a route.
   * @param integer $iNewId : the id of the new user
   * @param array $aPoints : the output array of points (supposed to be completely filled)
   * @param boolean $bMorning : whether this is morning or afternoon
   * @param string $sTimeslotId : the concerned timeslot id (for institution opening hours retrieval)
   * @param boolean $bExistsInInitialInstance
   * @param boolean $bExistsInInstance
   * @return array : a user with the structure expected by the optimisation + a tempId field to be removed later
   */
  function generateUser($aPOI,$iNewId,$aPoints,$bMorning,$sTimeslotId,$bExistsInInitialInstance,$bExistsInInstance){
    // Check that transport mode is defined
    if($aPOI["transport_mode_code"]!="FAUTEUIL" && $aPOI["transport_mode_code"]!="MARCHANT"){
      throw new \OSS\AppException(
        "Unknown or missing transport mode code for some users.",
        \OSS\AppException::OPTIM_FAILED_MISSING_TRANSPORT_MODE
      );
    }
    return array(
      "id"=> $iNewId,
      "tempId"=> $aPOI["hr_id"],
      "name" => $aPOI["hr_firstname"] . ' ' . $aPOI["hr_lastname"],
      "itineraries" => array($this->generateItinerary($aPOI,0,$aPoints,$bMorning,$sTimeslotId)),
    "demands"=>[($bExistsInInitialInstance?1:0),($bExistsInInstance?1:0)],
      "load"=>[$aPOI["transport_mode_code"]=="MARCHANT"?1:0,$aPOI["transport_mode_code"]!="MARCHANT"?1:0]
    );
  }

  /**
   * Update of an item from the "users" array of the output structure.
   * Only the "itineraries" field is supposed to be updated : we may insert a new itinerary into it
   * @param array $aPOI : representing a POI coming from a route.
   * @param array $aUser : the user to be modified
   * @param array $aPoints : the output array of points (supposed to be completely filled)
   * @param boolean $bMorning : whether this is morning or afternoon
   * @param string $sTimeslotId : the concerned timeslot id (for institution opening hours retrieval)
   * @param boolean $bExistsInInstance
   */
  function updateUser($aPOI,&$aUser,$aPoints,$bMorning,$sTimeslotId,$bExistsInInstance){
    $this->log()->info(["message"=>"updateUser","data"=>[$bExistsInInstance]]);
    if($this->itemFound($aUser["itineraries"],$aPOI["transport_demand_id"]) == false){
      $aUser["itineraries"][]=$this->generateItinerary(
        $aPOI,
        count($aUser["itineraries"]),
        $aPoints,
        $bMorning,
        $sTimeslotId
      );
    }
    $aUser["demands"][1] = ($bExistsInInstance?1:0);
  }

  /**
   * Set the time windows for a POI, assuming the pickup point is a user home and the delivery point is
   *   and institution. If the pickup time windows is not brought by user, it will be set as large as
   *   possible. The delivery time windows is computed from the institution opening hours for delivery.
   * @param array $aPOI : the input/output POI
   * @param string $sTimeslotId : the considered timeslot id
   */
  public function setTimeWindowsMorning(&$aPOI,$sTimeslotId){
    $this->log()->info(["method"=>__METHOD__,"data"=>[$aPOI,$sTimeslotId]]);
    // 1) Retrieve all the opening time windows for delivery at the institution
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    $aOpeningHours = $oSiteCtrl->listHours(array(
      "timeslotId"=>$sTimeslotId,
      "poiId"=>$aPOI["transport_demand_institution_poi_id"]
    ));
    // 2) Select the most interesting opening time windows for delivery at the institution among all the found time windows
    $aDeliveryHours=array();
    // Search for the next opening period for delivery at the institution
    // If no time window was provided for HR pickup, we use the first opening period for the delivery at the institution
    $iSearchStart = $aPOI["bPickupTimeWindow"] ? $aPOI["pickupStartHour"] : 0;
    // find the start_hr such that start_hr is min and start_hr > $iSearchStart
    foreach($aOpeningHours as $aOpeningPeriod){
      if($aOpeningPeriod["start_hr"]>$iSearchStart){
        if(!isset($aDeliveryHours['startHour']) || $aOpeningPeriod["start_hr"]<$aDeliveryHours['startHour']){
          $aDeliveryHours['endHour']=$aOpeningPeriod["end_hr"];
          $aDeliveryHours['startHour']=$aOpeningPeriod["start_hr"];
        }
      }
    }
    if(!isset($aDeliveryHours["endHour"]) || !isset($aDeliveryHours["startHour"])){
      $this->log()->warn(["method"=>__METHOD__,"message"=>"Missing delivery time windows at institution for user.","data"=>[$aDeliveryHours,$aOpeningHours,$iSearchStart]]);
      throw new \OSS\AppException(
        "Fenêtre de temps incompatible pour " . $aPOI['hr_firstname'] . " " . $aPOI['hr_lastname']  ,
        \OSS\AppException::OPTIM_FAILED_INSTITUTION_TIME_WINDOWS
      );
    }
    $aPOI["deliveryEndHour"]=$aDeliveryHours["endHour"];
    $aPOI["deliveryStartHour"]=$aDeliveryHours["startHour"];
    // 3) In case the HR pickup time windows is not set, set one by default, as late as possible
    if(!$aPOI["bPickupTimeWindow"]){
      $aPOI["pickupEndHour"] = $aPOI["deliveryEndHour"];
      $aPOI["pickupStartHour"] = 0;
    }
    // 4) Check time windows validity
    if($aPOI["deliveryStartHour"]>$aPOI["deliveryEndHour"]){
      throw new \OSS\AppException(
        "Fenêtre de temps incompatible pour " . $aPOI['hr_firstname'] . " " . $aPOI['hr_lastname']  ,
        \OSS\AppException::OPTIM_FAILED_INSTITUTION_TIME_WINDOWS
      );
    }
    if($aPOI["pickupStartHour"]>$aPOI["pickupEndHour"]){
      throw new \OSS\AppException(
        "Fenêtre de temps incompatible pour " . $aPOI['hr_firstname'] . " " . $aPOI['hr_lastname']  ,
        \OSS\AppException::OPTIM_FAILED_HR_TIME_WINDOWS
      );
    }
  }

  /**
   * Set the time windows for a POI, assuming the delivery point is a user home and the pickup point is
   *   and institution. If the delivery time windows is not brought by user, it will be set as large as
   *   possible. The pickup time windows is computed from the institution opening hours for pickup.
   * @param array $aPOI : the input/output POI
   * @param string $sTimeslotId : the considered timeslot id
   */
  public function setTimeWindowsAfternoon(&$aPOI,$sTimeslotId){
    // 1) Retrieve all the opening time windows for pickup at the institution
    $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
    $aOpeningHours = $oSiteCtrl->listHours(array(
      "timeslotId"=>$sTimeslotId,
      "poiId"=>$aPOI["transport_demand_institution_poi_id"]
    ));
    // 2) Select the most interesting opening time windows for pickup at the institution among all the found time windows
    $aPickupHours=array();
    // Search for the previous opening period for pickup at the institution
    // If no time window was provided for HR delivery, we use the last opening period for the pickup at the institution
    $iSearchEnd = $aPOI["bDeliveryTimeWindow"] ? $aPOI["deliveryEndHour"] : 86400*1000;
    // find the end_hr such that end_hr is max and end_hr < $iSearchEnd
    foreach($aOpeningHours as $aOpeningPeriod){
      if($aOpeningPeriod["end_hr"]<$iSearchEnd){
        if(!isset($aPickupHours['endHour']) || $aOpeningPeriod["end_hr"]>$aPickupHours['endHour']){
          $aPickupHours['endHour']=$aOpeningPeriod["end_hr"];
          $aPickupHours['startHour']=$aOpeningPeriod["start_hr"];
        }
      }
    }
    if(!isset($aPickupHours["endHour"]) || !isset($aPickupHours["startHour"])){
      throw new \OSS\AppException(
        "Missing pickup time windows at institution for some users.",
        \OSS\AppException::OPTIM_FAILED_INSTITUTION_TIME_WINDOWS
      );
    }
    $aPOI["pickupEndHour"]=$aPickupHours["endHour"];
    $aPOI["pickupStartHour"]=$aPickupHours["startHour"];
    // 3) In case the HR delivery time windows is not set, set one by default, as early as possible
    if(!$aPOI["bDeliveryTimeWindow"]){
      $aPOI["deliveryStartHour"] = $aPOI["pickupStartHour"];
      $aPOI["deliveryEndHour"] = 86400*1000;
    }
    // 4) Check time windows validity
    if($aPOI["deliveryStartHour"]>$aPOI["deliveryEndHour"]){
      throw new \OSS\AppException(
        "Invalid delivery time windows at home for some users.",
        \OSS\AppException::OPTIM_FAILED_HR_TIME_WINDOWS
      );
    }
    if($aPOI["pickupStartHour"]>$aPOI["pickupEndHour"]){
      throw new \OSS\AppException(
        "Invalid pickup time windows at institution for some users.",
        \OSS\AppException::OPTIM_FAILED_INSTITUTION_TIME_WINDOWS
      );
    }
  }

  /**
   * Generation of an item for the "itinerary" field of a user from the output structure.
   * A tempId field is added to the output to prevent from inserting twice the same itinerary
   * @param array $aPOI : representing a POI coming from a route.
   * @param integer $iNewId : the id of the new itinerary
   * @param array $aPoints : the output array of points (supposed to be completely filled)
   * @param boolean $bMorning : whether this is morning or afternoon
   * @param string $sTimeslotId : the concerned timeslot id (for institution opening hours retrieval)
   * @return array : an itinerary with the structure expected by the optimisation + a tempId field to be removed
   */
  function generateItinerary($aPOI,$iNewId,$aPoints,$bMorning,$sTimeslotId){
    // Retrieve the delivery and pickup points
    $homeId="";
    $institutionId="";
    foreach($aPoints as $aPoint){
      if($aPOI["id"] == $aPoint["tempId"]){
        $homeId=$aPoint["id"];
      }
      if($aPOI["transport_demand_institution_poi_id"] == $aPoint["tempId"]){
        $institutionId=$aPoint["id"];
      }
      if($homeId!="" && $institutionId!=""){
        break;
      }
    }
    // Take into account the direction for the itinerary (when bMorning is true, this means a travel from the
    //   home to the institution, and when it is false, this means a travel from the institution to the home)
    $pickupPointId="";
    $deliveryPointId="";
    $maxRT="";
    if($bMorning){
      $pickupPointId=$homeId;
      $deliveryPointId=$institutionId;
      $maxRT=$aPOI["home_to_institution_acceptable_duration"]/1000;
      $this->setTimeWindowsMorning($aPOI,$sTimeslotId);
    }
    else{
      $pickupPointId=$institutionId;
      $deliveryPointId=$homeId;
      $maxRT=$aPOI["institution_to_home_acceptable_duration"]/1000;
      $this->setTimeWindowsAfternoon($aPOI,$sTimeslotId);
    }
    // Check that pickup and delivery durations are set
    if(!isset($aPOI["hr_pickup_duration"])){
      throw new \OSS\AppException(
        "Missing pickup duration for some users.",
        \OSS\AppException::OPTIM_FAILED_PICKUP_DURATION
      );
    }
    // Check that pickup and delivery durations are set
    if(!isset($aPOI["hr_delivery_duration"])){
      throw new \OSS\AppException(
        "Missing delivery duration for some users.",
        \OSS\AppException::OPTIM_FAILED_DELIVERY_DURATION
      );
    }
    // Generate a new itinerary
    return array(
      "id"=>$iNewId,
      "tempId"=>$aPOI["transport_demand_id"],
      "pickupPointId"=>($pickupPointId!=""?$pickupPointId:0),
      "deliveryPointId"=>($deliveryPointId!=""?$deliveryPointId:0),
      "maxRT"=>$maxRT,
      "twPickup"=>[$aPOI["pickupStartHour"]/1000,$aPOI["pickupEndHour"]/1000],
      "twDelivery"=>[$aPOI["deliveryStartHour"]/1000,$aPOI["deliveryEndHour"]/1000],
      "type"=>"home",
      "stimePickup"=>$aPOI["hr_pickup_duration"]/1000,
      "stimeDelivery"=>$aPOI["hr_delivery_duration"]/1000,
      "unitTime"=>"second"
    );
  }

  /**
   * Generation of an item for the "vehicleTypes" field from the output structure.
   * A tempId field is added to the output to prevent from inserting twice the same vehicle type
   * @param string $sVehicleCategoryId : a vehicle category id (database id).
   * @param integer $iNewId : the id of the new vehicle category (id used only by optimiser)
   * @param string $sQuantity : the quantity as a string : may be an integer value or unlimited
   * @param string : $siteMainId : id of the depot
   * @return array : an vehicle type with the structure expected by the optimisation + a tempId field
   */
  function generateVehicleCategory($sVehicleCategoryId,$iNewId,$sQuantity="unlimited",$siteMainId){
    // Get some complementary data from database
    $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
    $aVehicleCategory = $oVehicleCategoryCtrl->get($sVehicleCategoryId);
    // Format capacities array
    $aCapacities = array();
    for($i=0;$i<count($aVehicleCategory["configurations"]);$i++){
      $iWalkingCount = 0;
      foreach($aVehicleCategory["configurations"][$i]["capacities"] as $aCapacity){
        if($aCapacity["transported_code"] == "MARCHANT"){
          $iWalkingCount+=$aCapacity["quantity"];
        }
      }
      $iWheelchairCount = 0;
      foreach($aVehicleCategory["configurations"][$i]["capacities"] as $aCapacity){
        if($aCapacity["transported_code"] != "MARCHANT"){
          $iWheelchairCount+=$aCapacity["quantity"];
        }
      }
      $aCapacities["c".($i+1)] = array($iWalkingCount,$iWheelchairCount);
    }
    // Generate a new vehicle category
    return array(
      "id"=> $iNewId,
      "tempId"=> $sVehicleCategoryId,
      "name" => $aVehicleCategory["label"],
      // Divide the daily cost by 2 (as demanded) because optimization works on halfs days
      "cost_fixed" => $aVehicleCategory["daily_cost"]/2,
      "cost_time" => $aVehicleCategory["hourly_cost"]/3600,
      "cost_distance" => $aVehicleCategory["kilometric_cost"]/1000,
      // according to optim server documentation, nbVehicles must be in string format
      "nbVehicles"=>"".$sQuantity,
      "capacity" => $aCapacities,
      "idDepot" => $siteMainId,
      "unitDist" => "meter",
      "unitTime" => "second"
    );
  }

  /**
   * Generation of an item for the "depot" field from the output structure.
   * A tempId field is added to the output to prevent from inserting twice the same depot
   * @param array $aPOI : representing a POI coming from a route.
   * @param integer $iNewId : the id of the new depot
   * @param array $aPoints : the output array of points (supposed to be completely filled)
   * @return array : an depot with the structure expected by the optimisation + a tempId field to be removed
   */
  function generateDepot($aPOI,$iNewId,$aPoints){
    // Retrieve the corresponding point id
    $aPointId="";
    foreach($aPoints as $aPoint){
      if($aPOI["id"] == $aPoint["tempId"]){
        $aPointId=$aPoint["id"];
        break;
      }
    }
    $sPointName="";
    if(isset($aPOI["label"])){
      $sPointName = $aPOI["label"];
    }  
    // Time windows and routing provided where may correspond to the full extent of an opening day.
    return array(
      "id"=> $iNewId,
      "tempId"=> $aPOI["id"],
      "siteMainId"=>$aPOI["site_main_id"],
      "name" => $sPointName,
      "itineraries" => array(array(
        "id"=>0,
        "pickupPointId"=>$aPointId,
        "deliveryPointId"=>$aPointId,
        "maxRT"=>61200,
        "twPickup"=>[0,86399],
        "twDelivery"=>[0,86399],
        "type"=>"depot",
        "stimePickup"=>$aPOI["service_duration"]/1000,
        "stimeDelivery"=>$aPOI["service_duration"]/1000,
        "unitTime"=>"second"
      )),
      "demands"=>[],
      "load"=>[0,0]
    );
  }

  /**
   * Shortcut function to check whether an item is not already in a collection
   * We assume that $aCollection contains items with a tempId field
   * @param array $aCollection : collection to examine
   * @param string $sIdToFind : id to look for in the collection
   * @return array : array with 2 fields : result (true when item is found) and index (index of the found item)
   */
  function itemFound($aCollection,$sIdToFind){
    $aResult = false;
    for($i=0;$i<count($aCollection);$i++){
      if($aCollection[$i]["tempId"] == $sIdToFind){
        $aResult["result"]=true;
        $aResult["index"]=$i;
        break;
      }
    }
    return $aResult;
  }

  /**
   * Computation of the reference time for the time and distance matrix, expressed as a number of ms.
   * The reference time can be an arrival time or a departure time according to the considered period (reference time
   *   for morning routes will be an arrival time and reference time for afteroon routes will be a departure time)
   * In the morning, the reference time will be the last institution arrival time
   * In the afternoon, the reference time will be the first institution leaving time
   * @param string $sTimeslotId : the considered time slot
   * @param array $aUsers : list of users
   * @param boolean $bMorning : whether this is morning or afternoon
   * @return integer : reference arrival time or reference departure time for the matrix computation in milliseconds
   */
  function getMatrixTime($sTimeslotId,$aUsers,$bMorning){
    // First compute the timestamp corresponding to midnight (local hour) of the considered time slot for one day in
    //   the future
    $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
    $iMidnightTimestamp = $oRoutingCtrl->getMidnightTimestamp($sTimeslotId);
    // Computation or the minimal pickup latest date for all users
    // Computation of the maximal delivery earliest date for all users
    $aTimes = array();
    foreach($aUsers as $aUser){
      foreach($aUser["itineraries"] as $aItinerary){
        if(!isset($aTimes["minPickupLatestDt"]) || $aItinerary["twPickup"][1]*1000 < $aTimes["minPickupLatestDt"]){
          $aTimes["minPickupLatestDt"] = $aItinerary["twPickup"][1]*1000;
        }
        if(!isset($aTimes["maxDeliveryEarliestDt"]) || $aItinerary["twDelivery"][0]*1000 > $aTimes["maxDeliveryEarliestDt"]){
          $aTimes["maxDeliveryEarliestDt"] = $aItinerary["twDelivery"][0]*1000;
        }
      }
    }
    $aResult = array();
    if($bMorning){
      // In the morning, the reference time for matrix computation is the arrival time to the last institution
      //   of the routes. This reference time be considered as an arrival time. Then this arrival time is rounded
      //   to the closest typical arrival time (enable to reuse cache as much as possible)
      if(isset($aTimes["maxDeliveryEarliestDt"])){
        $aResult["referenceTime"] = $iMidnightTimestamp+$oRoutingCtrl->roundDayTime($aTimes["maxDeliveryEarliestDt"]);
        $aResult["bArrival"] = true;
      }
    }
    else{
      // In the afternon, the reference time for matrix computation is the depart time from the first institution
      //   of the routes. This reference time be considered as a departure time. Then this departure time is rounded
      //   to the closest typical departure time (enable to reuse cache as much as possible)
      if(isset($aTimes["minPickupLatestDt"])){
        $aResult["referenceTime"] = $iMidnightTimestamp+$oRoutingCtrl->roundDayTime($aTimes["minPickupLatestDt"]);
        $aResult["bArrival"] = false;
      }
    }
    return $aResult;
  }

  /**
   * Perform some checks on vehicle types that are listed in the instance
   * In case of detected issue, it will throw.
   * @param array $aInstance : the built isntance, must contain vehicleTypes ans users field
   */
  function vehiclesTypeChecks($aInstance){
    // Check that at least one vehicle type is defined
    if(count($aInstance["vehicleTypes"])==0){
      throw new \OSS\AppException(
        "No vehicle type found for optimisation.",
        \OSS\AppException::OPTIM_FAILED_NO_VEHICLE
      );
    }
    // Check that for each transport mode code, there are some suitable vehicles
    $aTotalLoad = array(0,0);
    foreach($aInstance["users"] as $aUser){
      $aTotalLoad[0]+=$aUser["load"][0];
      $aTotalLoad[1]+=$aUser["load"][1];
    }
    $bWalkingCapacity=false;
    $bWheelchairCapacity=false;
    foreach($aInstance["vehicleTypes"] as $aVehicleType){
      foreach($aVehicleType["capacity"] as $aCapacity){
        if($aCapacity[0]>0){
          $bWalkingCapacity = true;
        };
        if($aCapacity[1]>0){
          $bWheelchairCapacity = true;
        };
      }
    }
    if($aTotalLoad[0]>0 && !$bWalkingCapacity){
      throw new \OSS\AppException(
        "No vehicle available for walking passengers transportation.",
        \OSS\AppException::OPTIM_FAILED_NO_WALKING_CAPACITY
      );
    }
    if($aTotalLoad[1]>0 && !$bWheelchairCapacity){
      throw new \OSS\AppException(
        "No vehicle available for wheelchair passengers transportation.",
        \OSS\AppException::OPTIM_FAILED_NO_WHEELCHAIR_CAPACITY
      );
    }
  }

  /**
   * Create an instance from an existing scenario
   * @param array $aData : some filters that enables to get the scenario
   * @return string : an optimization
   */
  function fromScenario($aData){
    $this->log()->info(["method"=>__METHOD__]);
    
    // Find whether the input timeslot points to a transport from homes to institutions (so called morning)
    //   or to a transport from institutions to homes (so called afternoon)
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $bMorning = $oThesaurusCtrl->isMorning($aData["timeSlotId"]);
    $optim = $this->initOptim($aData,$bMorning);

    // Get the transport demand calendars associated to the scenario at the given date
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(array(
      "scenarioMainId"=>$aData['scenarioMainId'],
      "startDt"=>$aData['calendarDt'],
      "endDt"=>$aData['calendarDt']+86400*1000,
      "timeSlotId"=>$aData["timeSlotId"]
    ));
    
    // First we insert every points, based on POIs found in the transport_calendars linked to the scenario
    // Insert only if point is not already present
    foreach($aCalendars as $aCalendar){
      if($this->itemFound($optim["instance"]["points"],$aCalendar["HRPOI"]["id"]) === false){
        $optim["instance"]["points"][] = $this->generatePoint(
          $aCalendar["HRPOI"],
          count($optim["instance"]["points"])
        );
      }
      if($this->itemFound($optim["instance"]["points"],$aCalendar["institutionPOI"]["id"]) === false){
        $optim["instance"]["points"][] = $this->generatePoint(
          $aCalendar["institutionPOI"],
          count($optim["instance"]["points"])
        );
      }
    }
    
    // Then we insert or update every users, still based on POIs found in the calendars linked to the scenario.
    // The users update concerns the list of known transport demands (called "itineraries" in the output structure)
    foreach($aCalendars as $aCalendar){
      $aUserFound = $this->itemFound($optim["instance"]["users"],$aCalendar["HRPOI"]["hr_id"]);
      // Data that is missing in HRPOI to reuse $this->generateUser function
      $aCalendar["HRPOI"]["transport_demand_id"]=$aCalendar["transport_demand_id"];
      $aCalendar["HRPOI"]["transport_demand_institution_poi_id"]=$aCalendar["institutionPOI"]["id"];
      
      if($aUserFound === false){
        $optim["instance"]["users"][] = $this->generateUser(
          $aCalendar["HRPOI"],
          count($optim["instance"]["users"]),
          $optim["instance"]["points"],
          $bMorning,
          $aData['timeSlotId'],
          false, // Does not exists in initialSolution
          ($aCalendar["transport_calendar_status_code"]=="TO_BE_SERVED"?true:false)   // Exists in new solution ?
        );
      }
      else{
        $this->updateUser(
          $aCalendar["HRPOI"],
          $optim["instance"]["users"][$aUserFound["index"]],
          $optim["instance"]["points"],
          $bMorning,
          $aData['timeSlotId'],
          ($aCalendar["transport_calendar_status_code"]=="TO_BE_SERVED"?true:false)   // Exists in new solution ?
        );
      }
    }

    // Now we create the depots. In the current version the list of depots will be the list of institutions involved
    // through the transport calendars of the scenario
    foreach($aCalendars as $aCalendar){
      if($this->itemFound($optim["instance"]["depots"],$aCalendar["institutionPOI"]["id"]) === false){
        $optim["instance"]["depots"][] = $this->generateDepot(
          $aCalendar["institutionPOI"],
          count($optim["instance"]["depots"]),
          $optim["instance"]["points"]
        );
      }
    }
   
    // Now we create the vehicleTypes. Assuming there are few vehicle types in the optimization, we will get their data
    // in separate SQL queries
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    $aScenario = $oScenarioCtrl->get($aData['scenarioMainId'],true);
    foreach($aScenario["fleet"] as $aFleetItem){
        foreach($aFleetItem["data"]["vehicle_category_site_quantity"] as $siteQuantity){
        // for each vehicle category, we have one entry per depot
        $sQuantity = $siteQuantity["unlimited"] ? "unlimited" : $siteQuantity["quantity"];
        $optim["instance"]["vehicleTypes"][] = $this->generateVehicleCategory(
          $aFleetItem["data"]["id"],
          count($optim["instance"]["vehicleTypes"]),
          $sQuantity,
          $this->getDepotId($siteQuantity["site_main_id"],$optim["instance"]["depots"])
        );
      }
    }

    $this->vehiclesTypeChecks($optim["instance"]);
        
    // Handle regularity algorithm
    if($aData['options']['optimMode']=="regularity"){
      $optim["instance"]["consistency"] = [($bMorning?"pickup":"delivery")];
      $optim["instance"]["periods"] = [ "0", "1" ];  

      // Build initial solution
      $routes = [];

      $i = 0;
      foreach($aData['options']['initialSolutionRoutes'] as $optimRoute){
        $route = [];
        $route['id'] = $i;

        // Lookup vehicle id
        $optimRoute["vehicleCategory"]["id"];
        foreach($optim["instance"]["vehicleTypes"] as $aVehicleType){
          $bFound = false;
          if($aVehicleType["tempId"]==$optimRoute["vehicleCategory"]["id"]){
            $route['idVehicle'] = $aVehicleType["id"];
            $bFound = true;
            break;
          }
        }
        if(!$bFound){
          $this->log()->warn(["method"=>__METHOD__,"message"=>"Unable to find vehicleId in instance","data"=>$aVehicleType["id"]]);
        }

        $route["nodes"] = [];
        $j = 0;
        $institutionHrs = []; // store picked up HR, by destination instituion
        foreach($optimRoute['POIs'] as $poi){
          $node = [];
          $node["tempId"] = $poi["hr_id"];
          $node["tempPoi"] = $poi;
          
          // Set relative time
          $node["time"] = $poi["target_hr"];

          // Look up User Id in instance
          if($poi["site_type_code"]=="HOME"){
            foreach($optim["instance"]["users"] as $user){
              $bFound = false;
              if($user["tempId"]==$poi["hr_id"]){
                $node["idUser"] = $user["id"];                
                $bFound = true;
                break;
              }
            }
            if(!$bFound){
              // Add missing points into new instance
              if($this->itemFound($optim["instance"]["points"],$poi["id"]) === false){
                $optim["instance"]["points"][] = $this->generatePoint(
                  $poi,
                  count($optim["instance"]["points"])
                );
              }           

              // Mark User as removed in new instance
              $node["idUser"] = ($i+1) * 1000 + $j;             
              $optim["instance"]["users"][] = $this->generateUser($poi,$node["idUser"],$optim["instance"]["points"],$bMorning,$sTimeslotId,true,false);
            }
          }else{
            // For institution, on node 'idUser' is
            foreach($optim["instance"]["depots"] as $depot){
              if($depot["siteMainId"]==$poi["site_main_id"]){
                $node["idUser"] = $depot["id"];                
                break;
              }
            }            
          }          

          // Set node type : depotIn, delivery, pickup or depotOut
          if($j==0){
            $node["type"] = "depotOut";
          }else{
            if($j==count($optimRoute["POIs"])-1){
              $node["type"] = "depotIn";
            }else{
              // User => Institution
              if($bMorning){
                if($poi["site_type_code"]=="HOME"){
                  $node["type"] = "pickup";
                  $institutionHrs[$poi["transport_demand_institution_poi_id"]][] = $node;
                }else{
                  $node["type"] = "delivery";
                }
              }else{
                // Institution => User
                if($poi["site_type_code"]=="INSTITUTION"){
                  $node["type"] = "pickup";
                }else{
                  $node["type"] = "delivery";
                  $institutionHrs[$poi["transport_demand_institution_poi_id"]][] = $node;
                }                
              }
            }
          }
          
          $route["nodes"][] = $node;
          $j++;
        }

        // Insert delivery nodes
        if($bMorning){
          $nodesWithDelivery = [];
          $deliveredNodes = [];
          foreach($route["nodes"] as $node){
            if($node["type"]=="delivery" || 
               $node["type"]=="depotIn"){
              // Insert one delivery node for each pickup node
              if(isset($institutionHrs[$node["tempPoi"]["id"]])){
                foreach($institutionHrs[$node["tempPoi"]["id"]] as $pickupNode){
                  // insert delivery node only if pickup was already done
                  if($pickupNode["time"] < $node["time"] && !isset($deliveredNodes["P".$pickupNode['idUser']])){
                    $deliveredNodes["P".$pickupNode['idUser']] = true;
                    $nodesWithDelivery[] = ["type"=>"delivery","idUser"=>$pickupNode["idUser"],"time"=>$node["time"]];
                  }
                }
              }
            }
            // ByPass except for delivery Node, handle above
            if($node["type"] == "depotOut" ||  
              $node["type"] == "depotIn" || 
              $node["type"] == "pickup"){
              $nodesWithDelivery[] = $node;
            }
          }
          $route["tempInstitutionHrs"] = $institutionHrs;
          $route["nodes"] = $nodesWithDelivery;
        }else{
          // Insert pickup nodes
          $nodesWithPickup = [];
          $pickupNodes = [];
          foreach($route["nodes"] as $node){
            // ByPass except for pickup Node, handle above
            if($node["type"] == "depotOut" ||  
              $node["type"] == "depotIn" || 
              $node["type"] == "delivery"){
              $nodesWithPickup[] = $node;
            }
            if($node["type"]=="pickup" || 
               $node["type"]=="depotOut"){
              // Insert one pickup node for each delivery node
              if(isset($institutionHrs[$node["tempPoi"]["id"]])){
                foreach($institutionHrs[$node["tempPoi"]["id"]] as $deliveryNode){
                  // insert delivery node only if pickup was already done
                  if($deliveryNode["time"] > $node["time"] && !isset($deliveredNodes["D".$deliveryNode['idUser']])){
                    $deliveredNodes["D".$deliveryNode['idUser']] = true;                  
                    $nodesWithPickup[] = ["type"=>"pickup","idUser"=>$deliveryNode["idUser"],"time"=>$node["time"]];
                  }
                }
              }
            }
          }
          $route["tempInstitutionHrs"] = $institutionHrs;
          $route["nodes"] = $nodesWithPickup;
        }

        $i++;
        $routes[] = $route;
      }

      // By default, all users are considered as not present in initial solution
      // Here we detect if users exists in initial solution
      foreach($optim["instance"]["users"] as &$initialInstanceUser){

        // Exclude user found in initial solution and not found in new instance
        if( $initialInstanceUser["demands"][0]==0 ){

          $bFound = false;
          foreach($routes as $route){
            foreach($route["nodes"] as $node){
              if($node["tempId"]==$initialInstanceUser["tempId"]){
                $bFound = true;
                break;
              }
            }
          }

          if($bFound){
            $initialInstanceUser["demands"][0] = 1;
          }
        }

      }  

      $optim["parameters"]["initialSolution"] = ["routes"=>$routes];

    }
    
    // We do not remove tempId from the instance input structure since these tempId will make a bridge between
    // instance ids and database ids. The parameters we use are those find by default on some sample data, so we
    // reuse them in a hardcoded version.
    $this->setMatrix($aData,$optim,$bMorning);
    return $optim;
  }
  
  /**
   * Create an instance from existing routes
   * @param array $aData : some filters that enables to get a set of routes
   * @return array : an optimization object
   */
  function fromRoutes($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    
    // Find whether the input timeslot points to a transport from homes to institutions (so called morning)
    //  or to a transport from institutions to homes (so called afternoon)
    $oThesaurusCtrl = new \OSS\Ctrl\ThesaurusCtrl();
    $bMorning = $oThesaurusCtrl->isMorning($aData["timeSlotId"]);
    $optim = $this->initOptim($aData,$bMorning);

    // Get the involved routes, knowing that optimization can be based only on routes build on transport demands
    $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
    $aData["demands"]=true;
    $aRoutes = $oRouteCtrl->list($aData,true);
    // First we insert every points, based on POIs found in the route
    // Insert only if point is not already present
    foreach($aRoutes as $aRoute){
      foreach($aRoute["POIs"] as $aPOI){
        if($this->itemFound($optim["instance"]["points"],$aPOI["id"]) === false){
          $optim["instance"]["points"][] = $this->generatePoint($aPOI,count($optim["instance"]["points"]));
        }
      }
    }

    // Then we insert or update every users, still based on POIs found in the route. The users update concerns the list
    //   of known transport demands (called "itineraries" in the output structure)
    foreach($aRoutes as $aRoute){
      foreach($aRoute["POIs"] as $aPOI){
        if($aPOI["site_type_code"] == 'HOME' && isset($aPOI["transport_demand_id"])){
          $aUserFound = $this->itemFound($optim["instance"]["users"],$aPOI["hr_id"]);
          if($aUserFound === false){
            $optim["instance"]["users"][] = $this->generateUser(
              $aPOI,
              count($optim["instance"]["users"]),
              $optim["instance"]["points"],
              $bMorning,
              $aData['timeSlotId']
            );
          }
          else{
            $this->updateUser(
              $aPOI,
              $optim["instance"]["users"][$aUserFound["index"]],
              $optim["instance"]["points"],
              $bMorning,
              $aData['timeSlotId']
            );
          }
        }
      }
    }
    // Now we create the vehicleTypes. Assuming there are few vehicle types in the optimization, we will get their data
    //   in separate SQL queries
    foreach($aRoutes as $aRoute){
      if(isset($aRoute["vehicleCategory"]) && isset($aRoute["vehicleCategory"]["id"]) && $aRoute["vehicleCategory"]["id"]!=""){
        if($this->itemFound($optim["instance"]["vehicleTypes"],$aRoute["vehicleCategory"]["id"]) === false){
          $optim["instance"]["vehicleTypes"][] = $this->generateVehicleCategory(
            $aRoute["vehicleCategory"]["id"],
            count($optim["instance"]["vehicleTypes"])
          );
        }
      }
    }
    $this->vehiclesTypeChecks($optim["instance"]);

    // Now we create the depots. A depot can only be located at the first or last position of a route and can not be
    //   of HOME type
    foreach($aRoutes as $aRoute){
      for($i=0;$i<count($aRoute["POIs"]);$i++){
        if(($i==0 || $i==count($aRoute["POIs"])-1) && $aRoute["POIs"][$i]["site_type_code"] != 'HOME'){
          if($this->itemFound($optim["instance"]["depots"],$aRoute["POIs"][$i]["id"]) === false){
            $optim["instance"]["depots"][] = $this->generateDepot(
              $aRoute["POIs"][$i],
              count($optim["instance"]["depots"]),
              $optim["instance"]["points"]
            );
          }
        }
      }
    }
    // We do not remove tempId from the instance input structure since these tempId will make a bridge between
    //   instance ids and database ids. The parameters we use are those find by default on some sample data, so we
    //   reuse them in a hardcoded version.
    $this->setMatrix($aData,$optim,$bMorning);
    return $optim;
  }

  /**
   * Return optim depot Id from a siteMain UUID
   * @return depotId, or false if not found
   */
  function getDepotId($depotId,$aDepots){
    $ret = false;
    foreach($aDepots as $depot){
      if($depot["siteMainId"]==$depotId){
        $ret = $depot["id"];
        break;
      }
    }
    return $ret;
  }

  /**
   * Compute the distance matrices with TomTom or OSRM according to the chosen router
   *   and update $aOptim accordingly
   * @param array $aData : the input data for instance generation
   * @param array $aOptim : the instance where the computed matrix should be written
   * @param boolean $bMorning : whether this is morning or afternoon
   */
  public function setMatrix($aData,&$aOptim,$bMorning){
    $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
    if($aData["options"]["router"]=="OSRM"){
      // Computation of the distance matrix using OSRM (not time dependent)
      $aMatrix = $oRoutingCtrl->getMatrixOSRM($aOptim["instance"]['points']);
      $aOptim["instance"]["timeMatrix"] = $aMatrix["durations"];
      $aOptim["instance"]["distanceMatrix"] = $aMatrix["distances"];
    }else{
      // Computation of the distance matrix using TomTom (time dependent)
      // Computation of a reference time for the distance matrix (including day and time of day)
      $aTime = $this->getMatrixTime(
        $aData['timeSlotId'],
        $aOptim["instance"]["users"],
        $bMorning
      );
      if(!isset($aTime["referenceTime"]) || !isset($aTime["bArrival"])){
        throw new \OSS\AppException(
          "Failure in the computation of the matrix reference time",
          \OSS\AppException::OPTIM_FAILED_NO_MATRIX
        );
      }
      // In case we use Tomtom, matrix is subdivided into blocks that will be computed asynchronously
      //  When every blocks will be ready, we will be able to fill $aOptim["instance"]["timeMatrix"] and
      //  $aOptim["instance"]["distanceMatrix"] fields.
      $aOptim["matrix_blocks"]=$oRoutingCtrl->requestMatrixTomtomAsynchronous(
        $aOptim["instance"]["points"],
        $aTime["referenceTime"],
        $aTime["bArrival"]
      );
    }
  }

  /**
   * Create a blank optimization instance structure, that we will have to fill in.
   * @param array $aData : the input data for instance generation
   * @param boolean $bMorning : whether this is morning or afternoon
   * @return array : a structure representing an optimization (some fields still have to be set)
   */
  public function initOptim($aData,$bMorning){
    // Generate a code and a label for the optimisation instance
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    $aScenario = $oScenarioCtrl->get($aData['scenarioMainId'],false);
    
    $sCode="OPTIM_".date('Ymd_H_i_s');
    $sLabel="Scenario ".$aScenario["label"]." ".date('Ymd_H_i_s');

    // Set the parameters for the optimization instance
    $aParams = $this->getDefaultParams();
    $aParams["timeLimit"]= floatval($aData["options"]["timeLimit"]);

    if($aData["options"]['optimMode']=="regularity"){
      $aParams["MPDARP"] = true;
      $aParams["minConsistency"] = true;
      $aParams["regularityToleranceSeconds"] = $aData["options"]["regularityRange"]*60;
    }

    return array(
      "code"=>$sCode,
      "label"=>$sLabel,
      // Enables to retrieve the list of optimizations linked to a scenario
      "scenario_main_id"=>$aData['scenarioMainId'],
      // Enables to retrieve the list of optimizations linked to a timeslot :
      //   - this enables to recompute the time matrices while taking into account the real traffic conditions
      //       during the concerned timeslot (if necessary)
      //   - enables to retrieve the involved institutions opening hours
      "timeslot_th"=>$aData['timeSlotId'],
      "instance"=>array(
                        "nbUserTypes"=>2,
                        "name"=>$sLabel,
                        "nbReconfigurations"=>0,
                        "period"=>$bMorning ? "AM" : "PM",
                        "unitTime"=>"second",
                        "unitDist"=>"meter",
                        "points"=>array(),
                        "users"=>array(),
                        "vehicleTypes"=>array(),
                        "depots"=>array()
                      ),
      "parameters"=>$aParams,
      "initialInstance"=>$initialInstance,
      "solution"=>array(),
      "matrix_blocks"=>array()
    );
  }

  /**
   * Get the default parameters for the optimization server
   * @return array : the default parameters for the optimization server
   */
  function getDefaultParams(){
    return array(
      "nbIterations"=> $this->config('OPTIM')['PARAMS']["nbIterations"],
      "nbIterationsSCP"=> 10,
      "nbReplica"=> 0,
      "timeLimit"=> $this->config('OPTIM')['PARAMS']["timeLimit"],
      "multiplier"=> 1,
      "checkAll"=> true,
      "verbosite"=> 1,
      "displayTitle"=> true,
      "SCP"=> false,
      "allOperators"=>true,
      "displayLogFrequency"=>1,
      "GDARP_instance"=>false,
      "tightenTW"=>false,
      "capacity_on_points"=>false,
      "path_export_best_sol"=>"./instance/unitTest/exports/last_best_sol.json",
      "path_stop_file"=>"./instance/unitTest/stopping/stop"
    );
  }

}