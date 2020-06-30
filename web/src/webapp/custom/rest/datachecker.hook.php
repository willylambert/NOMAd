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
 * Checker definition
 * 
 * == Returned values
 * Checker definition functions return array with keys used to identified context of failed checks.
 * Returnd array could contains following keys : scenarioMainId, transportDemandId, transportCalendarId, transportRouteId, vehicleCategoryId, sitePoiId, hrMainId.
 * Additionnal keys/values could be added, to be used in checker label template.
 * 
 */

/**
 * @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
 * @return array : a list of scenarios (only one scenario if filter is activated)
 */
function getScenariosList($aContext){
  $aScenarios=array();
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  if(isset($aContext['scenario_main_id'])){
    $aScenarios[] = $oScenarioCtrl->get($aContext['scenario_main_id']);
  }
  else{
    $aScenarios = $oScenarioCtrl->list([]);
  }
  return $aScenarios;
}

/**
* 
* 1
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_hr_demand_without_route($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){
    // Get TransportGroups associated to scenario
    $aTransportGroups = $oScenarioCtrl->listScenarioTransportGroups(array("scenarioMainId"=>$scenario['id']),true);

    $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Scenario {$scenario['id']}"]);

    // Select all the calendars that are concerned by the scenario + day + timeslot id
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(["scenarioMainId"=>$scenario['id'], "startDt"=>$scenario["start_dt"], "endDt"=>$scenario["end_dt"]]);

    // Loop through demands
    foreach($aTransportGroups as $aTransportGroup){
      foreach($aTransportGroup["data"]["demands"] as $aTransportDemand){
        $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Demand {$aTransportDemand['id']}"]);
        $transportDemandId = $aTransportDemand['id'];
        // Check whether the current transport demand is concerned by the selected timeslot and day
        foreach($aCalendars as $aCalendar){
          $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Calendar {$aCalendar['id']}"]);
          if($aCalendar["transport_demand_id"] == $transportDemandId){
            $serveCount = 0;
            // We should found a route which served the demand
            $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id'], "calendarDt"=>$aCalendar["date_dt"], "timeSlotId"=>$aCalendar["timeslot_th"]]);            
            foreach($aRoutes as $route){
              foreach($route['POIs'] as $poi){
                if($transportDemandId == $poi['transport_demand_id']){
                  $serveCount++;
                }
              }
            }
            $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"serveCount $serveCount"]);
            if($serveCount==0){
              $aRet[] = ["scenarioMainId"=>$scenario['id'],'transportDemandId'=>$transportDemandId,'transportCalendarId'=>$aCalendar['id'],'hrMainId'=>$aTransportDemand['HRPOI']['hr_id'],'serveCount'=>$serveCount];
            }
          }
        }
      }
    }
  }
  return $aRet;
}

/**
* 
* 2
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_hr_demand_with_several_route($context){

  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);
  foreach($scenarios as $scenario){

    // Select all the calendars that are concerned by the scenario
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(["scenarioMainId"=>$scenario['id']]);

    $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Scenario {$scenario['id']}"]);

    // For each calendar, get the list of routes
    foreach($aCalendars as $aCalendar){
      $aServedPOIs = array();
      $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt([
        "scenarioMainId"=>$scenario['id'],
        "calendarDt"=>$aCalendar["date_dt"],
        "timeSlotId"=>$aCalendar["timeslot_th"]
      ]);
      foreach($aRoutes as $route){
        foreach($route['POIs'] as $poi){
          if($aCalendar['transport_demand_id'] == $poi['transport_demand_id']){
            $aServedPOIs[]=array('transportRouteId'=>$route['id'],'sitePoiId'=>$poi['id']);
          }
        }
      }
      // One item per found route poi, except if exactly one poi found
      if(count($aServedPOIs)>1){
        foreach($aServedPOIs as $aServedPOI){
          $aRet[] = [
            "scenarioMainId"=>$scenario['id'],
            'transportDemandId'=>$aCalendar['transport_demand_id'],
            'transportCalendarId'=>$aCalendar['id'],
            'transportRouteId'=>$aServedPOI['transportRouteId'],
            'sitePoiId'=>$aServedPOI['sitePoiId'],
            'hrMainId'=>$aCalendar['HRPOI']['hr_id'],
            'serveCount'=>$serveCount
          ];
        }    
      }
    }
  }
  
  return $aRet;  
}

/**
* 
* 3
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_hr_with_several_demands($context){

  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){

    // Select all the calendars that are concerned by the scenario
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(["scenarioMainId"=>$scenario['id']]);

    // For each calendar, add the information into an associative array
    $aHRs=array();
    foreach($aCalendars as $aCalendar){
      $sHRMainId = $aCalendar['HRPOI']['hr_id'];
      $sDateDt = $aCalendar['date_dt'];
      $sTimeSlotId = $aCalendar['timeslot_th'];
      $sSitePOIId = $aCalendar['HRPOI']['id'];
      $sTransportCalendarId = $aCalendar['id'];
      $sTransportDemandId = $aCalendar['transport_demand_id'];
      if(!array_key_exists($sHRMainId,$aHRs)){
        $aHRs[$sHRMainId]=array();
      }
      if(!array_key_exists($sDateDt,$aHRs[$sHRMainId])){
        $aHRs[$sHRMainId][$sDateDt]=array();
      }
      if(!array_key_exists($sTimeSlotId,$aHRs[$sHRMainId][$sDateDt])){
        $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId]=array();
      } 
      if(!array_key_exists($sSitePOIId,$aHRs[$sHRMainId][$sDateDt][$sTimeSlotId])){
        $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId][$sSitePOIId]=array();
      }
      $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId][$sSitePOIId][]=array(
        'transportCalendarId'=>$sTransportCalendarId,
        'transportDemandId'=>$sTransportDemandId
      );
    }
    foreach($aHRs as $sHRMainId=>$aHR){
      foreach($aHR as $sDateDt=>$aHRDateDt){
        foreach($aHRDateDt as $sTimeSlotId=>$aHRDateDtTimeSlotId){
          if(count($aHRDateDtTimeSlotId)>1){
            foreach($aHRDateDtTimeSlotId as $sSitePOIId=>$aHRDateDtTimeSlotIdSitePOIId){
              // Normally we should find only one calendar per hr/day/timeslot/poi. If we find more of one calendar
              //  this is not normal but this is not in the scope of the present check. Therefore in that case 
              //  only the first item will be reported
              if(count($aHRDateDtTimeSlotIdSitePOIId)>0){
                $aRet[] = [
                  "scenarioMainId"=>$scenario['id'],
                  "transportCalendarId"=>$aHRDateDtTimeSlotIdSitePOIId[0]["transportCalendarId"],
                  "transportDemandId"=>$aHRDateDtTimeSlotIdSitePOIId[0]["transportDemandId"],
                  "sitePoiId"=>$sSitePOIId,
                  'hrMainId'=>$sHRMainId
                ];   
              }
            } 
          }
        }     
      }
    }
  }
  return $aRet;
}

/**
*  
* 4 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_hr_with_route_without_demands($context){

  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){

    // Select all the calendars that are concerned by the scenario
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(["scenarioMainId"=>$scenario['id']]);

    // Here we get all the routes of the scenario with the details.
    // Looping first into the existing transport_calendars is useless because we are looking for routes serving POIs
    //   corresponding to no existing transport_calendar
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    
    $aHRs=array();
    foreach($aRoutes as $aRoute){
      // TODO : check that the route date_dt is in ms!!!!
      if(isset($aRoute["date_dt"]) && isset($aRoute["timeslot_th"])){
        foreach($aRoute["POIs"] as $aPOI){
          if(isset($aPOI["transport_demand_id"]) && isset($aPOI["hr_id"])){
            // Try to find a calendar that matches the route POI : match is based on the transport_demand, date and timeslot
            $bMatchingCalendarFound = false;
            foreach($aCalendars as $aCalendar){
              if($aCalendar['date_dt']==$aRoute["date_dt"] &&
                 $aCalendar['timeslot_th']==$aRoute["timeslot_th"] &&
                 $aCalendar['transport_demand_id']==$aPOI["transport_demand_id"]){
                $bMatchingCalendarFound = true;
                break;
              }
            }
            if(!$bMatchingCalendarFound){
              $sHRMainId = $aPOI['hr_id'];
              $sDateDt = $aRoute['date_dt'];
              $sTimeSlotId = $aRoute['timeslot_th'];
              $sRouteId = $aRoute['id'];
              if(!array_key_exists($sHRMainId,$aHRs)){
                $aHRs[$sHRMainId]=array();
              }
              if(!array_key_exists($sDateDt,$aHRs[$sHRMainId])){
                $aHRs[$sHRMainId][$sDateDt]=array();
              }
              if(!array_key_exists($sTimeSlotId,$aHRs[$sHRMainId][$sDateDt])){
                $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId]=array();
              }
              if(!array_key_exists($sRouteId,$aHRs[$sHRMainId][$sDateDt][$sTimeSlotId])){
                $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId][$sRouteId]=array();
              } 
              if(!in_array($aPOI['id'],$aHRs[$sHRMainId][$sDateDt][$sTimeSlotId][$sRouteId])){
                $aHRs[$sHRMainId][$sDateDt][$sTimeSlotId][$sRouteId][]=$aPOI['id'];
              }
            }
          }
        }
      }
    }
    foreach($aHRs as $sHRMainId=>$aHR){
      foreach($aHR as $sDateDt=>$aHRDateDt){
        foreach($aHRDateDt as $sTimeSlotId=>$aRoutes){
          if(count($aRoutes)>0){
            // At least one route found for this hr/date/timeslot corresponding to no transport_calendar
            // For each found route and for each route POI concerned by the hr/date/timeslot, report an issue
            foreach($aRoutes as $sRouteId=>$aPOIs){
              foreach($aPOIs as $sSitePOIId){
                $aRet[] = [
                  "scenarioMainId"=>$scenario['id'],
                  'transportRouteId'=>$sRouteId,  
                  "sitePoiId"=>$sSitePOIId,            
                  'hrMainId'=>$sHRMainId
                ];  
              }
            }
          }
        }     
      }
    }
  }
  return $aRet;  
}

/**
*  
* 5 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_vehicle_missing_in_route($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){

    // Select all the calendars that are concerned by the scenario
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->list(["scenarioMainId"=>$scenario['id']]);

    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    
    foreach($aRoutes as $aRoute){
      if(!isset($aRoute['vehicleCategory']) || !isset($aRoute['vehicleCategory']['id'])){   
        $aRet[] = [
          "scenarioMainId"=>$scenario['id'],
          'transportRouteId'=>$aRoute['id'],  
          "vehicleCategoryId"=>$aRoute['vehicleCategory']['id']
        ]; 
      }
    }
  }
  return $aRet;  
}

/**
 * Compute a route load
 */
function computeLoad($aRoute){
  $aLoad=array();
  if($aRoute['bMorning']){
    for($i=0;$i<count($aRoute['POIs']);$i++){
      // For each POI, we compute the vehicle load before and after serving the POI, as well as 
      //   the number of descending passengers and of mounting passengers
      $aCurrentLoad = array("descending"=>array(),"before"=> array(),"after"=>array(),"mounting"=>array());
      if($i>0){
        // TODO : in php contraray to ts, i think we do not need a deep copy her
        $aCurrentLoad["before"]=$aLoad[$i-1]["after"];
      }
      if($aRoute['POIs'][$i]["site_type_code"] == 'HOME'){
        // This is the case of a passenger that is mounting in the vehicle
        $aCurrentLoad["after"]=$aCurrentLoad["before"];
        $aCurrentLoad["after"][]=$aRoute['POIs'][$i];
        $aCurrentLoad["mounting"][]=$aRoute['POIs'][$i];
      }
      else{
        // Case of a vehicle that arrives at an institution
        // Looking for the passengers that are descending at this institution
        foreach($aCurrentLoad["before"] as $aPOI){
          $bPassengerIsDescending = false;
          if(isset($aPOI["transport_demand_institution_poi_id"]) && $aPOI["transport_demand_institution_poi_id"] != ""){
            // Case of a passenger that has a transport demand
            if($aPOI["transport_demand_institution_poi_id"] == $aRoute['POIs'][$i]["id"]){
              // Passenger is descending here
              $aCurrentLoad["descending"][]=$aPOI;
              $bPassengerIsDescending = true;
            }
          }
          else{
            // Case of a passenger that has no transport demand (only in sandbox mode)
            foreach($aPOI["institutions"] as $aInstitution){
              if($aInstitution["poi_id"] == $aRoute['POIs'][$i]["id"]){
                // Passenger is descending here
                $aCurrentLoad["descending"][]=$aPOI;
                $bPassengerIsDescending = true;
                break;
              }
            }
          }
          if(!$bPassengerIsDescending){
            $aCurrentLoad["after"][]=$aPOI;
          }
        }              
      }
      $aLoad[$i]=$aCurrentLoad;
    }
  }
  else{
    // The case of a travel back to home is similar to a travel from home except that we browse
    //   POIs from the last one to the first one (and then the role of after and before arrays are switched)
    for($j=count($aRoute['POIs'])-1;$j>=0;$j--){
      // For each POI, we compute the vehicle load before and after serving the POI, as well as 
      //   the number of descending passengers and of mounting passengers
      $aCurrentLoad = array("descending"=>array(),"before"=> array(),"after"=>array(),"mounting"=>array());
      if($j<count($aRoute['POIs'])-1){
        $aCurrentLoad["after"]=$aLoad[$i-1]["before"];
      }        
      if($aRoute['POIs'][$j]["site_type_code"] == 'HOME'){
        // This is the case of a passenger that is descending from the vehicle
        $aCurrentLoad["before"]=$aLoad[$i-1]["after"];
        $aCurrentLoad["before"][]=$aRoute['POIs'][$j];
        $aCurrentLoad["descending"][]=$aRoute['POIs'][$j];     
      }
      else{
        // Case of a vehicle that leaves an institution
        // Looking for the passengers that are mounting at this institution
        foreach($aCurrentLoad["after"] as $aPOI){    
          $bPassengerIsMounting = false;
          if(isset($aPOI["transport_demand_institution_poi_id"]) && $aPOI["transport_demand_institution_poi_id"] != ""){
           // Case of a passenger that has a transport demand
           if($aPOI["transport_demand_institution_poi_id"] == $aRoute['POIs'][$j]["id"]){
             // Passenger is descending here
             $aCurrentLoad["mounting"][]=$aPOI;
             $bPassengerIsMounting = true;
           }
          }
          else{                      
            foreach($aPOI["institutions"] as $aInstitution){
              if($aInstitution["poi_id"] == $aRoute['POIs'][$j]["id"]){
                // Passenger is descending here
                $aCurrentLoad["mounting"][]=$aPOI;
                $bPassengerIsMounting = true;
                break;
              }
            }
          }
          if(!$bPassengerIsMounting){
            $aCurrentLoad["before"][]=$aPOI;
          }            
        }
      }
      $aLoad[$i]=$aCurrentLoad;
    }
  }
  return $aLoad;
}

/**
 * This function will first make sure the load computation for the route is up-to date
 * Then it will check that at any point of the route the vehicle capacity is respected
 */
function checkLoad($aRoute){
  $bCompatibleConfigurationFound = false;
  $aRouteLoad = computeLoad($aRoute);
  if(isset($aRoute['vehicleCategory']) && isset($aRoute['vehicleCategory']['id'])){
    $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
    $aVehicleCategory = $oVehicleCategoryCtrl->get($aRoute['vehicleCategory']['id']);
    if(isset($aVehicleCategory['configurations'])){
      // The vehicle category is defined, we have to check that the route load is compatible
      //   with at least one vehicle configuration
      foreach($aVehicleCategory['configurations'] as $aConfiguration){
        $bRouteCapacityOverflow = false;
        foreach($aRouteLoad as $aPOILoad){
          // for the current POI, compute the load per transport mode
          $bPOICapacityOverflow = false;
          // We also keep track of the total number of seats for the configuration
          $iTotalCount = 0;
          foreach($aConfiguration["capacities"] as $aCapacity){
            $count =0;
            // Considering load after operation on the POI (easier to understand for display on screen)
            foreach($aPOILoad["after"] as $aHRPOI){
              if($aHRPOI['transport_mode_code'] == $aCapacity["transported_code"]){
                $count++;
              }
            }
            $iTotalCount+=$count;
            if($count>$aCapacity["quantity"]){
              // Overflow detected on the POI !
              $bPOICapacityOverflow = true;
              break;
            }
          }
          // In case some capacities of the current configuration are missing, iTotalCount may differ from
          //   count($aPOILoad["after"]), which also indicates an overload
          if($bPOICapacityOverflow || count($aPOILoad["after"])>$iTotalCount){
            // Overflow detected on the route !
            $bRouteCapacityOverflow=true;
          }
        }
        if(!$bRouteCapacityOverflow){
          // Found at least one configuration without overflow
          // We can stop check here
          $bCompatibleConfigurationFound = true;
          break;
        }
      }
    }
  }
  return $bCompatibleConfigurationFound;
}

/**
*  
* 6 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_vehicle_overflow_in_route($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){

    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    
    foreach($aRoutes as $aRoute){
      if(isset($aRoute['vehicleCategory']) && isset($aRoute['vehicleCategory']['id'])){
        if(!checkLoad($aRoute)){
          // In the current version, we do not provide the details of the concerned users and POIs because this 
          //   implies too many cases : we would have to list every POIs with an overflow, every concerned HR 
          //   and describe the issues for every configurations of the vehicle categories
          $aRet[] = [
            "scenarioMainId"=>$scenario['id'],
            'transportRouteId'=>$aRoute['id'],  
            "vehicleCategoryId"=>$aRoute['vehicleCategory']['id']
          ]; 
        }
      }
    }
  }
  return $aRet;  
}

/**
*  
* 7 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_vehicle_fleet_overflow($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);

  foreach($scenarios as $scenario){

    // Select all the calendars dates that are concerned by the scenario
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $aCalendars = $oCalendarCtrl->computeScenarioCalendarDts($scenario);
    foreach($aCalendars as $aCalendar){
      foreach($aCalendar["timeslotIDs"] as $sTimeSlotId){
        // Here we get all the routes of the scenario with the details for a given date + direction concerned by the calendar.
        $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id'],"calendarDt"=>$aCalendar["dt"],"timeSlotId"=>$sTimeSlotId]);
        // Count the vehicles categories that are in use in the routes
        $aVehicleCategories = array();
        foreach($aRoutes as $aRoute){
          if(isset($aRoute['vehicleCategory']) && isset($aRoute['vehicleCategory']['id'])){
            if(!array_key_exists($aRoute['vehicleCategory']['id'],$aVehicleCategories)){
              $aVehicleCategories[$aRoute['vehicleCategory']['id']]=0;
            }
            $aVehicleCategories[$aRoute['vehicleCategory']['id']]++;
          }
        }
        // Now compare to the scenario fleet
        $aFleet = $oScenarioCtrl->get($scenario['id'])['fleet'];
        foreach($aVehicleCategories as $sVehicleCategorieId=>$iCount){
          $bVehicleCategoryOverflow = true;
          // If the vehicle category is found in fleet and has an unlimited quantity or a wide enough quantity, then
          //  we can tell there is no overuse for the current vehicle category
          foreach($aFleet as $aVehicleCategoryFromFleet){
            if($aVehicleCategoryFromFleet["data"]["id"]==$sVehicleCategorieId){
              if($aVehicleCategoryFromFleet["unlimited_yn"]=="Y" || $aVehicleCategoryFromFleet["quantity"]>=$iCount){
                $bVehicleCategoryOverflow = false;
              }
              break;
            }
          }
          // In case some overuse was detected for the current category
          if($bVehicleCategoryOverflow){
            $aRet[] = [
              "scenarioMainId"=>$scenario['id'],
              "vehicleCategoryId"=>$sVehicleCategorieId,
              "calendarDt"=>$aCalendar["dt"],
              "timeSlotId"=>$sTimeSlotId
            ];            
          }
        }
      }      
    }
  }
  return $aRet;  
}

/**
 * Computation of the delivery duration for a set of HRs on an institution
 * We need to compute first the set of HRs that have to be delivered to the institution
 * Then the delivery duration is the sum of all delivery durations (in the current version, there is no function
 *    for the delivery duration of several HRs on the same POI)
 * @param $aRoute : description of the route
 * @param $iInstitutionIndexInRoute : index of the institution in the route (from 0)
 */
function getDeliveryDurationOnInstitution($aRoute,$iInstitutionIndexInRoute){
  $iDeliveryDuration=0;
  // Browse all the HRs that are picked before reaching the institution
  for($iHRIndexInRoute=0;$iHRIndexInRoute<$iInstitutionIndexInRoute;$iHRIndexInRoute++){
    // Test whether the current POI corresponds to a HR picking and whether this HR subscribed at the current institution
    if($aRoute["POIs"][$iHRIndexInRoute]["site_type_code"] == 'HOME' &&
       $aRoute["POIs"][$iInstitutionIndexInRoute]["id"] == $aRoute["POIs"][$iHRIndexInRoute]["transport_demand_institution_poi_id"]){
      // Test whether the current HR is descending on an institution location before the current institution
      $bDescendingBefore=false;
      for($iOtherInstitutionIndexInRoute=$iHRIndexInRoute+1;$iOtherInstitutionIndexInRoute<$iInstitutionIndexInRoute;$iOtherInstitutionIndexInRoute++){
        if($aRoute["POIs"][$iOtherInstitutionIndexInRoute]["id"] == $aRoute["POIs"][$iHRIndexInRoute]["transport_demand_institution_poi_id"]){
          $bDescendingBefore = true;
          break;
        }
      }
      if(!$bDescendingBefore){
        $iDeliveryDuration+=$aRoute["POIs"][$iHRIndexInRoute]["hr_delivery_duration"];
      }
    }
  }  
  return $iDeliveryDuration;
}

/**
*  
* 8 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_time_windows_override($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $aOpeningHours = $oSiteCtrl->listHours(array());
  foreach($scenarios as $scenario){
    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    foreach($aRoutes as $aRoute){
      for($i=0;$i<count($aRoute["POIs"]);$i++){
        $aPOI=$aRoute["POIs"][$i];
        // TODO : if target_hr is not set, we have to set it : the target hr is the estimated arrival
        //        time on the poi according to :
        //     - the start hour or end hour for the route (if any) 
        //     - the driving duration estimations by Tomtom
        //     - the waiting durations that are requested on POIs
        //     - the passengers mounting/descending durations and the POI service duration
        if(isset($aPOI["target_hr"])){
          // Check whether target hr is in time window
          if($aPOI["site_type_code"] == 'HOME'){
            // Case of a HR poi : we have to check whether the target hr falls within the transport demand tw
            if(isset($aPOI["transport_demand_start_hr"]) && isset($aPOI["transport_demand_end_hr"])){
              if($aRoute["bMorning"]){
                if(
                  $aPOI["transport_demand_start_hr"]>($aPOI["target_hr"]+$aPOI["service_duration"]) || 
                  $aPOI["transport_demand_end_hr"]<($aPOI["target_hr"]+$aPOI["service_duration"])
                ){
                  // The times the passenger can start to embark is out of the defined time windows
                  $aRet[]=array(
                    "scenarioMainId"=>$scenario['id'],
                    'transportRouteId'=>$aRoute['id'],
                    "transportDemandId"=>$aPOI["transport_demand_id"],
                    "sitePoiId"=>$aPOI['id'],
                    "hrMainId"=>$aPOI['hr_id']
                  );
                }
              }
              else{
                if(
                  $aPOI["transport_demand_start_hr"]>($aPOI["target_hr"]+$aPOI["service_duration"]+$aPOI["hr_delivery_duration"]) || 
                  $aPOI["transport_demand_end_hr"]<($aPOI["target_hr"]+$aPOI["service_duration"]+$aPOI["hr_delivery_duration"])
                ){
                  // The times the passenger gets out of vehicle is out of the defined time windows
                  $aRet[]=array(
                    "scenarioMainId"=>$scenario['id'],
                    'transportRouteId'=>$aRoute['id'],
                    "transportDemandId"=>$aPOI["transport_demand_id"],
                    "sitePoiId"=>$aPOI['id'],
                    "hrMainId"=>$aPOI['hr_id']
                  );                  
                }
              }
            }
          }
          else{
            // Case of an institution POI : we ignore the time window on the depot
            if($aRoute["bMorning"]){
              // Ignore the depot
              if($i>0){
                // We have to compute the duration for hrs to get off the vehicle on that point
                $iDeliveryDuration=getDeliveryDurationOnInstitution($aRoute,$i);
                foreach($aOpeningHours as $aOpeningHour){
                  if($aOpeningHour["timeslot_th"]==$aRoute['timeslot_th'] &&
                     $aOpeningHour["site_main_id"]==$aPOI["site_main_id"]){
                    // We have found the opening hours
                    if($aOpeningHour["start_hr"]>($aPOI["target_hr"]+$aPOI["service_duration"]+$iDeliveryDuration) ||
                       $aOpeningHour["end_hr"]<($aPOI["target_hr"]+$aPOI["service_duration"]+$iDeliveryDuration)){
                      // The times the passenger gets out of vehicle is out of the defined time windows
                      $aRet[]=array(
                        "scenarioMainId"=>$scenario['id'],
                        'transportRouteId'=>$aRoute['id'], 
                        "sitePoiId"=>$aPOI['id']
                      );
                    }
                    break;
                  }
                }
              }
            }
            else{
              // Ignore the depot
              if($i<count($aRoute["POIs"])-1){
                foreach($aOpeningHours as $aOpeningHour){
                  if($aOpeningHour["timeslot_th"]==$aRoute['timeslot_th'] &&
                     $aOpeningHour["site_main_id"]==$aPOI["site_main_id"]){
                    // We have found the opening hours
                    if($aOpeningHour["start_hr"]>($aPOI["target_hr"]+$aPOI["service_duration"]) ||
                       $aOpeningHour["end_hr"]<($aPOI["target_hr"]+$aPOI["service_duration"])){
                      // The times the vehicle stops for embarking passengers is out of the defined time windows
                      $aRet[]=array(
                        "scenarioMainId"=>$scenario['id'],
                        'transportRouteId'=>$aRoute['id'], 
                        "sitePoiId"=>$aPOI['id']
                      );
                    }
                    break;
                  }
                }                
              }              
            }
          }
        }
      }
    }
  }
  return $aRet;  
}

/**
*  
* 9 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_time_acceptable_duration_override($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);
  foreach($scenarios as $scenario){
    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    foreach($aRoutes as $aRoute){
      for($i=0;$i<count($aRoute["POIs"]);$i++){
        if(isset($aRoute["POIs"][$i]["target_hr"]) && $aRoute["POIs"][$i]["site_type_code"] == 'HOME'){
          if($aRoute["bMorning"]){
            for($j=$i+1;$j<count($aRoute["POIs"]);$j++){
              if($aRoute["POIs"][$i]["transport_demand_institution_poi_id"]==$aRoute["POIs"][$j]["id"]){
                // Arrival point found
                // This is the total duration between arrival on point i and arrival on point j
                $iTotalDuration = $aRoute["POIs"][$j]["target_hr"]-$aRoute["POIs"][$i]["target_hr"];
                $iTravelDuration = $iTotalDuration - $aRoute["POIs"][$i]["hr_pickup_duration"]-$aRoute["POIs"][$i]["service_duration"];
                if($iTravelDuration>$aRoute["POIs"][$i]["home_to_institution_acceptable_duration"]){
                  $aRet[]=array(
                    "scenarioMainId"=>$scenario['id'],
                    'transportRouteId'=>$aRoute['id'],
                    "transportDemandId"=>$aRoute["POIs"][$i]["transport_demand_id"],
                    "sitePoiId"=>$aRoute["POIs"][$i]['id'],
                    "hrMainId"=>$aRoute["POIs"][$i]['hr_id']
                  );                  
                }
                break;
              }
            }
          }
          else{
            for($j=$i-1;$j>=0;$j--){
              if($aRoute["POIs"][$i]["transport_demand_institution_poi_id"]==$aRoute["POIs"][$j]["id"]){
                // Start point found
                // This is the total duration between arrival on point j and arrival on point i
                $iTotalDuration = $aRoute["POIs"][$i]["target_hr"]-$aRoute["POIs"][$j]["target_hr"];
                $iTravelDuration = $iTotalDuration - $aRoute["POIs"][$i]["hr_delivery_duration"]-$aRoute["POIs"][$i]["service_duration"];
                if($iTravelDuration>$aRoute["POIs"][$i]["institution_to_home_acceptable_duration"]){
                  $aRet[]=array(
                    "scenarioMainId"=>$scenario['id'],
                    'transportRouteId'=>$aRoute['id'],
                    "transportDemandId"=>$aRoute["POIs"][$i]["transport_demand_id"],
                    "sitePoiId"=>$aRoute["POIs"][$i]['id'],
                    "hrMainId"=>$aRoute["POIs"][$i]['hr_id']
                  );                  
                }
                break;
              }
            }            
          }
        }
      }
    }
  }
  return $aRet;  
}

/**
*  
* 10 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_time_travel_duration_override($context){
  
  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);
  foreach($scenarios as $scenario){
    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    foreach($aRoutes as $aRoute){
      for($i=0;$i<count($aRoute["POIs"]);$i++){
        // When not defined, the target_hr_manual is sometimes set to null, sometimes to 0
        if(isset($aRoute["POIs"][$i]["target_hr_manual"]) && isset($aRoute["POIs"][$i]["target_hr_auto"]) && 
          $aRoute["POIs"][$i]["target_hr_manual"]>0 &&
          $aRoute["POIs"][$i]["target_hr_manual"]<$aRoute["POIs"][$i]["target_hr_auto"]
        ){
          if(isset($aRoute["POIs"][$i]["hr_id"])){
            $aRet[]=array(
              "scenarioMainId"=>$scenario['id'],
              'transportRouteId'=>$aRoute['id'],
              "sitePoiId"=>$aRoute["POIs"][$i]['id'],
              "hrMainId"=>$aRoute["POIs"][$i]['hr_id']
            );
          }
          else{
            $aRet[]=array(
              "scenarioMainId"=>$scenario['id'],
              'transportRouteId'=>$aRoute['id'],
              "sitePoiId"=>$aRoute["POIs"][$i]['id']
            );            
          }
        }
      }
    }
  }
  return $aRet;  
}


/**
*  
* 11 
* 
* @param $context array : ['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]
* @return array of failed checks ["scenarioId"=>,'transportDemandId'=>,'calendarId'=>]
**/
function DataCheckerCtrl_run_time_route_with_waiting_duration($context){
  

  $scenarios=getScenariosList($context);
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

  $aRet = [];

  $oScenarioCtrl->log()->info(["method"=>__METHOD__,"message"=>"Start checks..."]);
  foreach($scenarios as $scenario){
    // Here we get all the routes of the scenario with the details.
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt(["scenarioMainId"=>$scenario['id']]);  
    foreach($aRoutes as $aRoute){
      for($i=0;$i<count($aRoute["POIs"]);$i++){
        if(isset($aRoute["POIs"][$i]["waiting_duration"]) && $aRoute["POIs"][$i]["waiting_duration"]>0 ){
          if(isset($aRoute["POIs"][$i]["hr_id"])){
            $aRet[]=array(
              "scenarioMainId"=>$scenario['id'],
              'transportRouteId'=>$aRoute['id'],
              "sitePoiId"=>$aRoute["POIs"][$i]['id'],
              "hrMainId"=>$aRoute["POIs"][$i]['hr_id']
            );
          }
          else{
            $aRet[]=array(
              "scenarioMainId"=>$scenario['id'],
              'transportRouteId'=>$aRoute['id'],
              "sitePoiId"=>$aRoute["POIs"][$i]['id']
            );            
          }
        }
      }
    }
  }
  return $aRet;  
}