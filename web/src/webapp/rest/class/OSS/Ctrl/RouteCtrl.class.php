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
 *  REST service to handle Routes
 *  @creationdate 2018-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class RouteCtrl extends BaseObject{

  /**
   * Filter a set of route to make sure we keep only those the current user is authorized to access
   * @param array $aRoutes : the routes to check
   * @return array : only the routes the current user is authorized to access
   */
  public function filterRoutesWithRestrictions($aRoutes){
    $aResult = array();
    // For admin users, we can bypass this step
    if(!$this->isAdmin()){
      $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
      $aScenarios = $oScenarioCtrl->list(array());
      foreach($aRoutes as $aRoute){
        // Now we will check whether the current route is associated to a scenario for which the
        //   current user is granted access
        $bScenarioFound=false;
        if(isset($aRoute['scenario_main_id'])){
          foreach($aScenarios as $aScenario){
            if(isset($aScenario['id']) && $aScenario['id']==$aRoute['scenario_main_id']){
              $bScenarioFound=true;
              break;
            }
          }
        }
        // The route is associated to a scenario for which we have access
        if($bScenarioFound){
          $aResult[]=$aRoute;
        }
      }
    }
    else{
      $aResult = $aRoutes;
    }
    return $aResult;
  }

  /**
   * Get a list of POIs that can be displayed as selectable POIs in the route computation menu
   * @param $aData array : contains an institutionId filter
   * @return array : set of POIs that can be used to build routes
   */
  public function listPOIForTransport($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    if(isset($aData["demands"]) && $aData["demands"]=="true"){
      $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
      $aPOIs = $oDemandCtrl->listForRoutes($aData);
    }
    else{
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $aPOIs = $oRouteDAO->listPOIForTransport($aData);
    }
    $this->setResult($aPOIs);
    return $aPOIs;
  }

  /**
   * List existing routes
   * The list of input filters is the following
   *   timeSlotId : the target timeslot id,
   *   institutions : the target list of institution ids,
   *   demands : whether we work with demands or nod,
   *   bOnlyActiveHRs : whether we work only with active HRs or not,
   *   scenarioMainId : target scenario (optional)
   *   onGoingStatus : 'S' => Started, 'E' => Ended
   * @param $aData array : filters
   * @param boolean $bWithoutOptimizedRoutes : if true, will only use routes that do not result from optimization
   */
  public function list($aData,$bWithoutOptimizedRoutes=false){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oRouteDAO = new \OSS\Model\RouteDAO();
    
    if(isset($aData['onGoingStatus']) && $aData['onGoingStatus']!=""){
      // ListStarted is aimed to replace old list function
      $aRoutes = $oRouteDAO->listStarted($aData,$bWithoutOptimizedRoutes);
    }else{
      $aRoutes = $oRouteDAO->list($aData,$bWithoutOptimizedRoutes);
    }

    // Restrict the list of routes to the routes current user is autorized to access
    //$aRoutes = $this->filterRoutesWithRestrictions($aRoutes);

    // If a hr_main filter is defined, use it to discard routes that do not contain the target hr_main_id
    if(isset($aData['hr_main_id']) && $aData['hr_main_id']!=''){
      $aFilteredRoutes = array();
      foreach($aRoutes as $aRoute){
        $bHrMainFound = false;
        foreach($aRoute["POIs"] as $aPOI){
          if($aPOI["hr_id"]==$aData['hr_main_id']){
            $bHrMainFound = true;
            break;
          }
        }
        if($bHrMainFound){
          $aFilteredRoutes[]=$aRoute;
        }
      }
      $aRoutes = $aFilteredRoutes;
    }

    // Data postprocessing
    foreach($aRoutes as &$aRoute){
      if(isset($aRoute['timeslot_code'])){
        $sTimeslotCodeEnd = substr($aRoute['timeslot_code'],strlen($aRoute['timeslot_code'])-2,2);
        $aRoute['bMorning'] = $sTimeslotCodeEnd == 'AM';
      }
      $aRoute['vehicleCategory']=array(
        'id'=>$aRoute['vehicle_category_id'],
        'code'=>$aRoute['vehicle_category_code'],
        'label'=>$aRoute['vehicle_category_label'],
        'daily_cost'=>$aRoute['vehicle_category_daily_cost'],
        'hourly_cost'=>$aRoute['vehicle_category_hourly_cost'],
        'kilometric_cost'=>$aRoute['vehicle_category_kilometric_cost'],
        'co2_quantity'=>$aRoute['vehicle_category_co2_quantity']
      );
      // For each POI, set the time windows.
      // Notice that start_hr (respectively end_hr) are supposed to be the same for every morning timeslot associated
      //   with the POI. And so does start_hr and end_hr for the afternoon timeslots associated with the POI
      foreach($aRoute["POIs"] as &$aPOI){
        if(isset($aPOI['timeslots'])){
          $aPOI['bPickupTimeWindow'] = false;
          $aPOI['bDeliveryTimeWindow'] = false;
          foreach($aPOI['timeslots'] as &$aTimeslot){
            if($aTimeslot["timeslot_th"] == $aRoute["timeslot_th"]){
              $sTimeslotCodeEnd = substr($aTimeslot["code"],strlen($aTimeslot["code"])-2,2);
              if($sTimeslotCodeEnd == 'AM'){
                $aPOI['pickupStartHour']=$aTimeslot['start_hr'];
                $aPOI['pickupEndHour']=$aTimeslot['end_hr'];
                $aPOI['bPickupTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
              }else{
                $aPOI['deliveryStartHour']=$aTimeslot['start_hr'];
                $aPOI['deliveryEndHour']=$aTimeslot['end_hr'];
                $aPOI['bDeliveryTimeWindow'] = isset($aTimeslot['start_hr']) && isset($aTimeslot['end_hr']);
              }
            }
          }
        }
      }

      unset($aRoute['timeslot_code']);
      unset($aRoute['vehicle_category_id']);
      unset($aRoute['vehicle_category_code']);
      unset($aRoute['vehicle_category_label']);
    }

    $this->setResult($aRoutes);
    return $aRoutes;
  }

  /**
   * Given a hrMainId, returns all pickup/delivery events
   */
  public function listRoutesByUserMainId($hrMainId){  
    $this->log()->debug(["method"=>__METHOD__,"data"=>$hrMainId]);
    $oRouteDAO = new \OSS\Model\RouteDAO();
    $aRoutePois = $oRouteDAO->listRoutesByUserMainId($hrMainId);
    $this->setResult($$aRoutePois);
    return $aRoutePois;
  }

  /**
   * Return some information about a route
   * @param string $sRouteId : the route identifier
   * @return array : a route with id and scenario_main_id fields or empty array if no access to the route granted
   */
  public function get($sRouteId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sRouteId]);
    $oRouteDAO = new \OSS\Model\RouteDAO();
    $aResult = array();
    $aRoute = $oRouteDAO->get($sRouteId);
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    if(isset($aRoute['scenario_main_id']) && $oScenarioCtrl->hasAccess($aRoute['scenario_main_id'])){
      // We consider that the access to the route can be granted when the access to the surrounding scenario can be granted
      $aResult=$aRoute;
    }
    else{
      // If the current user has no access to the scenario, the only case where the access to the route can be granted is
      //  the case of the driver requesting a route that was assigned to him. 
      // This enables data access from mobile application
      $oHRCtrl = new \OSS\Ctrl\HRCtrl();
      if(isset($aRoute['hr_main_id_driver']) && $oHRCtrl->hasAccess($aRoute['hr_main_id_driver'])){
        $aResult=$aRoute;
      }
    }
    return $aResult;
  }  

  /**
   * Update or insert a route (a route without an id will be inserted, a route with an id will be updated)
   * @param $aData array : a route to save
   * @return array : the saved route
   */
  public function save($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oRouteDAO = new \OSS\Model\RouteDAO();
    $aRoute = array();
    // transport scenario id is optional
    if(!isset($aData['scenarioMainId'])){
      $aData['scenarioMainId']=NULL;
    }
    // calendar_dt is optional
    if(!isset($aData['calendarDt'])){
      $aData['calendarDt']=NULL;
    }
    if(isset($aData['route'])){
      // optmization instance id is optional
      if(!isset($aData['route']['optimMainId'])){
        $aData['route']['optimMainId']=NULL;
      }
      // driver id is optional
      if(!isset($aData['route']['driverId'])){
        $aData['route']['driverId']=NULL;
      }
      // vehicle category is optional
      if(isset($aData['route']['vehicleCategory']) && isset($aData['route']['vehicleCategory']['id'])){
        $aData['route']['vehicleCategoryId']= $aData['route']['vehicleCategory']['id'];
      }
      else{
        $aData['route']['vehicleCategoryId']=NULL;
      }
      if(isset($aData['route']['id'])){
        if($this->hasAccess($aData['route']['id'])){
          $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
          $aOldData = $oAuditTrailCtrl->getRecordData($aData['route']['id'],'transport_route');
          $aRoute = $oRouteDAO->update($aData);
          $oAuditTrailCtrl->afterDataUpdate($aData['route']['id'],$aOldData,'transport_route');
          // Delete and insert route POIs in a brutal way (not optimal from a performance point of view)
          // TODO : Handle audit trail
          $oRouteDAO->deletePOIs($aData['route']);
          $oRouteDAO->insertPOIs($aData['route']);
        }
      }
      else{
        $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
        // At route creation time, scenario id is optional for admins but mandatory for other users
        if($this->isAdmin() || (isset($aData['scenarioMainId']) && $oScenarioCtrl->hasAccess($aData['scenarioMainId']))){        
          $aRoute = $oRouteDAO->add($aData);
        }
        if(isset($aRoute['id'])){
          $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
          $oAuditTrailCtrl->afterDataInsert($aRoute['id'],'transport_route');
          // TODO : Handle audit trail
          $oRouteDAO->insertPOIs($aRoute);
        }
        else{
          throw new \OSS\AppException(
            "Route insertion into database failed.",
            \OSS\AppException::SAVE_INTO_DATABASE_FAILED
          );
        }
      }
    }  
    $this->setResult($aRoute);
    return $aRoute;
  }

  /**
  * Mark a route as removed
  * @param string $sRouteID : id of the route to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sRouteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sRouteID]);
    $bResult = false;
    if($sRouteID!="" && $this->hasAccess($sRouteID)){
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $bResult = $oRouteDAO->markAsRemoved($sRouteID);
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sRouteID,'transport_route');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a route
  * @param string $sRouteID : id of the route to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sRouteID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sRouteID]);
    $bResult = false;
    if($sRouteID!=null && $sRouteID!="" && $this->isAdmin()){
      $oRouteDAO = new \OSS\Model\RouteDAO();
      // Find the POIs associated to the route and delete them one by one
      $aSitePOIs = $oRouteDAO->listSitePOIs($sRouteID);
      foreach($aSitePOIs as $aSitePOI){
        $this->deleteSitePOI($aSitePOI['id']);
      }
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sRouteID,'transport_route');
      $bResult = $oRouteDAO->delete($sRouteID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a route POI
  * @param string $sRoutePOIID : id of the route POI to be deleted.
  * @return boolean : true in case of success
  */
  public function deleteSitePOI($sRoutePOIID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sRoutePOIID]);
    $oRouteDAO = new \OSS\Model\RouteDAO();
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sRoutePOIID,'transport_routesitepoi');
    $bResult = $oRouteDAO->deleteSitePOI($sRoutePOIID);
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Copy an existing route into an existing scenario
   * The input param may contain the following fields :
   *   - routeId : the id of the route that will be copied
   *   - newDateDt (optional)
   *   - newTimeslotTh (optional)
   *   - newScenarioMainId (optional)
   *   - newOptimMainId (optional)
   * @param array : with the created route in an id field
   */
  public function copy($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aNewRoute = array();
    if($this->hasAccess($aData["routeId"])){
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $aNewRoute = $oRouteDAO->copy($aData["routeId"],$aData);
    }
    if(isset($aNewRoute['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewRoute['id'],'transport_route');
      // Now we copy the route POIs from the old route to the new route
      $this->copyPOIs($aData["routeId"],$aNewRoute['id']);
    }
    else{
      throw new \OSS\AppException(
        "Route insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewRoute);
    return $aNewRoute;
  }

  /**
   * Copy all the POIs from a route into another route
   * @param string $sOldRouteId : the id of the route from which the route POIs will be copied
   * @param string $sNewRouteId : the id of the route into which the route POIs will be copied
   * @param array : list of inserted POIs (array with ids fields)
   */
  public function copyPOIs($sOldRouteId,$sNewRouteId){
    $oRouteDAO = new \OSS\Model\RouteDAO();
    $aNewRoutePOIs = $oRouteDAO->copyPOIs($sOldRouteId,$sNewRouteId);
    foreach($aNewRoutePOIs as $aNewRoutePOI){
      if(isset($aNewRoutePOI['id'])){
        $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
        $oAuditTrailCtrl->afterDataInsert($aNewRoutePOI['id'],'transport_routesitepoi');
      }
      else{
        throw new \OSS\AppException(
          "Route POI insertion into database failed.",
          \OSS\AppException::SAVE_INTO_DATABASE_FAILED
        );
      }
    }
    $this->setResult($aNewRoutePOIs);
    return $aNewRoutePOIs;
  }

  /**
   * Restore the set of routes coming from an optimization run
   * This function will delete the routes on the selected scenario/day/direction and return a new set of routes
   * @param string $sOptimId : the optimization for which we want restore the result
   * @return array routes to restore
   */
  public function restore($sOptimId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sOptimId]);
    $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
    $aOptim = $oOptimCtrl->get($sOptimId);
    $aRoutes = false;
    // The restore is enabled only if the optim instance is associated to a calendar/timeslot/scenario
    if(isset($aOptim["calendar_dt"]) && isset($aOptim["timeslot_th"]) && isset($aOptim["scenario_main_id"])){
      // Delete all the routes for the calendar/timeslot/scenario
      $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
      $oScenarioCtrl->deleteRoutes(array(
        "calendarDt"=>$aOptim["calendar_dt"],
        "timeSlotId"=>$aOptim["timeslot_th"],
        "scenarioMainId"=>$aOptim["scenario_main_id"]
      ));
      // Create some new routes from an optim instance
      $aRoutes = $oOptimCtrl->toRoutes($sOptimId);
      
    }
    return $aRoutes;
  }

  /**
   * List the routes, restricted to a scenario + a day of week + a direction
   * This function will list all the weeks within the scenario and for each week, the
   *    count of routes matching the given day of week and direction.
   * The day of week is provided through $aData["calendarDt"] parameter (this is a timestamp but only
   *    the "day of week" part of this timestamp will be used here)
   * The direction is provided through $aData["timeSlotId"] (this is a timeslot id, it enable to target
   *    either a travel forward or backward)
   * @param $aData : array with scenarioMainId,timeSlotId and calendarDt (ms) fields
   * @return : array with count and date_dt (ms) (one row per week)
   */
  function listForCalendar($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=array();
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    if($oScenarioCtrl->hasAccess($aData["scenarioMainId"])){
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $aResult =$oRouteDAO->listForCalendar($aData);
    }
    return $aResult;
  }

  /**
   * Compare 2 route POIs based on the route order
   * This function enables to sort POIs by route order
   * @param array $a : routePOI
   * @param array $b : routePOI
   * @return integer 0 if the POIs have the same order, 1 if $a["orderroute"] is greater than $b["orderroute"], -1 otherwise
   */
  function routePOIsCompare($a, $b){
    if ($a["orderroute"] == $b["orderroute"]) {
        return 0;
    }
    return ($a["orderroute"] < $b["orderroute"]) ? -1 : 1;
  }

  /**
   * Insert some location data from mobile device.
   * Input data should contain the following fields :
   *  - transport_route_id : the current route
   *  - user_main_id : the id of the connected user
   *  - next_pois : array containing the duration to the next pois : each field may contain the following subfields
   *     - site_poi_id : the id of a coming POI in the route
   *     - duration_to_poi : estimated duration before reaching the POI in ms
   *     - orderroute : integer that gives the order of the pois in the route
   *  - dt : current timestamp in ms
   *  - lng : in degrees
   *  - lat : in degrees
   *  - h, s, e, a : heading (integer, degrees), speed (integer, m per s), events (json ), accuracy (integer)
   * In the next_pois array, we have to keep the same order as in the route
   * @param array $aData : the input location data
   * @return array : status of what was done
   */
  function insertLocation($aData){
    $this->log()->info(["method"=>__METHOD__,"message"=>"insert new routes location","data"=>$aData]);
    $aResult = array();
    if($this->hasAccess($aData["transport_route_id"])){
      $oRouteDAO = new \OSS\Model\RouteDAO();
      // Sort iput pois by order in the route
      usort($aData["next_pois"],"routePOIsCompare");
      // Set site_poi_id_next and duration_to_next_poi fields
      foreach($aData["next_pois"] as $aNextPOI){
        if(!isset($aData["duration_to_next_poi"]) || $aNextPOI["duration_to_poi"]<$aData["duration_to_next_poi"] ){
          $aData["duration_to_next_poi"]=$aNextPOI["duration_to_poi"];
          $aData["site_poi_id_next"]=$aNextPOI["site_poi_id"];
        }
      }
      if(!isset($aData["duration_to_next_poi"])){
        $aData["duration_to_next_poi"]=null;
      }
      if(!isset($aData["site_poi_id_next"])){
        $aData["site_poi_id_next"]=null;
      }
      if($oRouteDAO->insertTransportRouteLocation($aData)){
        $aResult['location_inserted']=true;
        $aResult['next_pois']=array();
        // Retrieve some information about the route POIs :
        //   - phonenumber and notice delay of the HR associated to the POI (if any)
        //   - whether the HR associated to the POI (if any) was already notified or not
        $aRouteSitePOIs = $oRouteDAO->listRouteSitePOIs($aData["transport_route_id"]);
        // Assuming the end of $aRouteSitePOIs matches $aData["next_pois"]
        $oMessengerCtrl = new \OSS\Ctrl\MessengerCtrl();
        for($i = 0; $i<count($aData["next_pois"]);$i++){
          $aNextPOIResult=array();
          // Index of the ith element in $aData["next_pois"] array starting from the last element
          $j = count($aData["next_pois"])-$i-1;
          // Index of the ith element in $aRouteSitePOIs array starting from the last element
          $k = count($aRouteSitePOIs)-$i-1;
          // Check that the POIs are the same. If they are not the same, there is a problem
          /*
          if($aRouteSitePOIs[$k]['site_poi_id'] != $aData["next_pois"][$j]['site_poi_id']){
            throw new \OSS\AppException(
              "Route location insertion into database failed.",
              \OSS\AppException::SAVE_INTO_DATABASE_FAILED
            );
          }*/
          // Compute the estimated arrival time on the poi
          $aRouteSitePOIs[$k]['arrival_dt'] = $aData['dt'] + $aData["next_pois"][$j]['duration_to_poi'];
          // Compare the duration to the poi and the notice delay
          // We can send a notification only when the hr has not been notified or visited.
          if($aRouteSitePOIs[$k]['notice_delay'] >= $aData["next_pois"][$j]['duration_to_poi'] &&
             $aRouteSitePOIs[$k]['notify_yn']=='Y' && 
             $aRouteSitePOIs[$k]['visited_yn']!='Y' && $aRouteSitePOIs[$k]['notified_yn']!='Y' ){
            $aNextPOIResult['notification_should_be_sent']=true;
            // We are getting very close to the POI, a notification was requested by HR and no notification was sent yet: send it now
            $iNumberOfMinutes = round($aRouteSitePOIs[$k]['notice_delay']/60000);
            $sNoticeDelay = $iNumberOfMinutes." minutes.";
            if($iNumberOfMinutes==0){
              $sNoticeDelay = "moins de 1 minute.";
            }
            if($iNumberOfMinutes==1){
              $sNoticeDelay = "1 minute.";
            }
            $aNewMessage = $oMessengerCtrl->add(array(
              'content'=>"L'arrivée de votre transporteur est prévue dans $sNoticeDelay",
              'phonenumber'=>$aRouteSitePOIs[$k]['phonenumber'],
              'hr_main_id'=>$aRouteSitePOIs[$k]['hr_main_id']
            ));
            $bNotificationSent = false;
            if(isset($aNewMessage["id"])){
              $bNotificationSent = $oMessengerCtrl->send($aNewMessage["id"]);
            }
            if($bNotificationSent){
              $this->log()->info(["method"=>__METHOD__,"message"=>"A notification shall be sent to hr","data"=>$aRouteSitePOIs[$k]]);   
              //if notification was sent, pass notified_yn to Y
              $aRouteSitePOIs[$k]['notified_yn']='Y';
              $aNextPOIResult['notification_succeeded']=true;
            }
            else{
              $this->log()->warn(["method"=>__METHOD__,"message"=>"Impossible to send notification to a hr.","data"=>$aRouteSitePOIs[$k]]);   
              $aNextPOIResult['notification_succeeded']=false;
            }
          }
          else{
            $aNextPOIResult['notification_should_be_sent']=false;
          }
          $aResult['next_pois'][]=array_merge($aNextPOIResult,$aRouteSitePOIs[$k],$aData["next_pois"][$j]);
        }
        // Update the estimated arrival_dt and the notify_yn flags for each POIs of the route
        $aResult['arrival_dt_updated']= $oRouteDAO->updateArrivalDt($aRouteSitePOIs);
      }
      else{
        $aResult['location_inserted']=false;
      }
      // Get updated data for all poi (used to know if notification was sent)
      $aRouteSitePOIs = $oRouteDAO->listRouteSitePOIs($aData["transport_route_id"]);
      $this->log()->debug(["message"=>"notification return","data"=>$aRouteSitePOIs]);
    }
    return $aResult;
  }

  /**
   * Notify that a route was started
   * Typically triggered from mobile app when drivers starts following a route
   * As a side effect, this function will erase any progress information about the route if any
   * The input parameter shouls contain a transport_route_id field
   * @param array $aData : the input transport_route_id
   * @return boolean : true if the update is successful
   */
  function routeStart($aData){
    $this->log()->info(["method"=>__METHOD__,"message"=>"Starting following a route","data"=>$aData]);    
    $bResult = false;
    if($this->hasAccess($aData['transport_route_id'])){    
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $bResult = $oRouteDAO->setStartHrDriver($aData['transport_route_id'],time());
      $bResult &= $oRouteDAO->setEndHrDriver($aData['transport_route_id'],null);
      $bResult &= $oRouteDAO->resetProgressData($aData['transport_route_id']);
    }
    return $bResult;
  }

  /**
   * Reset route progression
   * The input parameter shouls contain a transport_route_id field
   * @param array $aData : the input transport_route_id
   * @return boolean : true if the update is successful
   */
  function resetProgression($aData){
    $this->log()->info(["method"=>__METHOD__,"message"=>"reset route progression","data"=>$aData]);    
    $bResult = false;
    if($this->hasAccess($aData['transport_route_id'])){     
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $bResult = $oRouteDAO->setStartHrDriver($aData['transport_route_id'],null);
      $bResult &= $oRouteDAO->setEndHrDriver($aData['transport_route_id'],null);
      $bResult &= $oRouteDAO->resetProgressData($aData['transport_route_id']);
    }
    return $bResult;
  }

  /**
   * Notify that a route was ended
   * Typically triggered from mobile app when drivers ends following a route
   * The input parameter shouls contain a transport_route_id field
   * @param array $aData : the input transport_route_id
   * @return boolean : true if the update is successful
   */
  function routeEnd($aData){
    $this->log()->info(["method"=>__METHOD__,"message"=>"Ending following a route","data"=>$aData]);    
    $bResult = false;
    if($this->hasAccess($aData['transport_route_id'])){     
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $bResult = $oRouteDAO->setEndHrDriver($aData['transport_route_id'],time());
    }
    return $bResult;
  }

  /**
   * Notify that a POI route was visited and update some informations as the HR absence or presence and some other comments.
   * The input array shall contain the following information :
   *   id : (string) id of the visited transport_routesitepoi
   *   missing : (boolean) whether the visited HR was missing or not
   *   comments : (string) some free comments about the visit
   * @param array $aData : the visited POI + some data to insert about the visited POI
   * @return boolean : whether the update succeeded or not
   */
  function routePOIVisit($aData){
    $this->log()->info(["method"=>__METHOD__,"message"=>"visiting a route POI","data"=>$aData]);    
    $bResult = false;
    if($this->hasAccess($aData['transportRouteId'])){   
      if(isset($aData["comments"])){
        $aData["comments"]="";
      }
      $oRouteDAO = new \OSS\Model\RouteDAO();
      $bResult = $oRouteDAO->routePOIVisit($aData);
    }
    return $bResult;
  }
}