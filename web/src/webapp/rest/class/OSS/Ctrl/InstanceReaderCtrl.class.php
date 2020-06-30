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
 *  REST service to read an instance as a JSON and to convert it to a set of routes
 *  @creationdate 2018-12-19
 **/

namespace OSS\Ctrl;

use Exception;

use OSS\BaseObject;

class InstanceReaderCtrl extends BaseObject{

  /**
   * Retrieve a POI database identifier based on some node data extracted from the optimization result.
   * The node data contains a point identifier (identifier used during optimization)
   * @param array $aInstance : the optimisation input data
   * @param array $aNode : a node from the optimization output data
   * @return string : a POI database identifier
   */
  function retrievePOIId($aInstance,$aNode){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aNode]);
    $sResult="";
    foreach($aInstance["points"] as $aInstancePoint){
      if($aInstancePoint["id"]==$aNode["idPoint"]){
        $sResult=$aInstancePoint["tempId"];
        break;
      }
    }
    return $sResult;
  }

  /**
   * Retrieve a HR database identifier based on some node data extracted from the optimization result.
   * The node data contains a user identifier (identifier used during optimization)
   * @param array $aInstance : the optimisation input data
   * @param array $aNode : a node from the optimization output data
   * @return string : a HR database identifier
   */
  function retrieveHRId($aInstance,$aNode){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aNode]);
    $sResult="";
    foreach($aInstance["users"] as $aInstanceUser){
      if($aInstanceUser["id"]==$aNode["idUser"]){
        $sResult = $aInstanceUser["tempId"];
        break;
      }
    }
    return $sResult;
  }

  /**
   * Retrieve a transport demand database identifier based on some node data extracted from the optimization result.
   * The node data contains a user identifier and an itinerary identifier (identifiers used during optimization)
   * @param array $aInstance : the optimisation input data
   * @param array $aNode : a node from the optimization output data
   * @return string : a transport demand database identifier
   */
  function retrieveTransportDemandId($aInstance,$aNode){
    $sResult="";
    foreach($aInstance["users"] as $aInstanceUser){
      if($aInstanceUser["id"]==$aNode["idUser"]){
        foreach($aInstanceUser["itineraries"] as $aInstanceItinerary){
          if($aInstanceItinerary["id"]==$aNode["idItinerary"]){
            $sResult=$aInstanceItinerary["tempId"];
            break;
          }
        }
        if($sResult!=""){
          break;
        }
      }
    }
    return $sResult;
  }

  /**
   * Retrieve a vehicle category database identifier based on some route data extracted from the optimization result.
   * The route data contains a vehicle type identifier (identifier used during optimization)
   * @param array $aInstance : the optimisation input data
   * @param array $aRoute : a route from the optimization output data
   * @return string : a vehicle category database identifier
   */
  function retrieveVehicleCategoryId($aInstance,$aRoute){
    $sResult="";
    foreach($aInstance["vehicleTypes"] as $aInstanceVehicleType){
      if($aInstanceVehicleType["id"]==$aRoute["idVehicle"]){
        $sResult = $aInstanceVehicleType["tempId"];
        break;
      }
    }
    return $sResult;
  }

  /**
   * Create a lookup table for all the users involved in the route.
   * This helps minimize the number of calls to HRCtrl::get
   * TODO : instead of calling HRCtrl::get, we should call a sort of HRCtrl::list
   * @param array $aOptim : the optimisation instance, parameters and output
   * @return array : a lookup table in which key is a user database id and value is some user data
   */
  function createHRLookupTable($aOptim){
    $this->log()->info(["method"=>__METHOD__]);
    $aResult = array();
    $oHRCtrl = new \OSS\Ctrl\HRCtrl();
    
    // First collect userId list
    $aUserId = [];
    foreach($aOptim["solution"]["routes"] as $aOptimRoute){
      $this->log()->info(["method"=>__METHOD__,"message"=>"Number of nodes : " . count($aOptimRoute["nodes"]) ]);

      foreach($aOptimRoute["nodes"] as $aNode){
        $sUserId = $this->retrieveHRId($aOptim["instance"],$aNode);
        if($sUserId!=""){
          $aUserId[] = $sUserId;
        }
      }      
    }

    // Then, get data for each collected userId
    //  Build lookup
    $aHRs = $oHRCtrl->list(["aUserId"=>$aUserId]);
    foreach($aHRs as $hr){
      if(!isset($aResult[$hr["id"]])){
        $aResult[$hr["id"]] = $hr;
      }
    }

    return $aResult;
  }

  /**
   * Create a lookup table for all the POIs involved in the route.
   * This helps minimize the number of calls to POICtrl::get
   * TODO : instead of calling POICtrl::get, we should call a sort of POICtrl::list
   * @param array $aOptim : the optimisation instance, parameters and output
   * @return array : a lookup table in which key is a poi database id and value is some poi data
   */
  function createPOILookupTable($aOptim){
    $this->log()->info(["method"=>__METHOD__]);
    $aResult = array();
    $oPOICtrl = new \OSS\Ctrl\POICtrl();

    // First collect poiId list
    $aPoiId = [];
    foreach($aOptim["solution"]["routes"] as $aOptimRoute){
      foreach($aOptimRoute["nodes"] as $aNode){
        $sPOIId = $this->retrievePOIId($aOptim["instance"],$aNode);
        if($sPOIId!=""){
          if(!isset($aPoiId[$sPOIId])){
            $aPoiId[] = $sPOIId;
          }
        }
      }
    }

    // Then, get data for each collected poiId
    //  Build lookup
    $aPOIs = $oPOICtrl->list(["aPoiId"=>$aPoiId]);
    foreach($aPOIs as $poi){
      if(!isset($aResult[$poi["id"]])){
        $aResult[$poi["id"]] = $poi;
      }
    }

    return $aResult;
  }

  /**
   * Structure conversion : in the output structure from the algorithm, 2 following nodes
   *   can be at the same point. In the route structure that is going to be displayed on
   *   client side, 2 following POIs must be different.
   * This function will aggregate the information for following nodes having the same point id :
   *   - there will be a time field indicating the point entering and a lastTime field indicating the point leaving
   *   - there will be a pickupDuration and a deliveryDuration respectively indicating the time spent on pickup
   *       and the time spent on delivery on the point.
   * Other data are no aggregated so far : we keep the data for the first node of each node group
   * @param array $aOptimRoute : a route for which we want to remove duplicated nodes
   * @param array $aInstance : the input data for the optimization (helps linking hr database ids to user optimizer ids)
   * @param array $aHRLookup : a HRlookup table to avoid querying to much the HR table
   * @return array : the collection of nodes for the route without nodes duplication and with aggregated data
   */
  function removeDuplicatedNodes($aOptimRoute,$aInstance,$aHRLookup){
    $aDistinctNodes = array();
    $sLastNodeId = "";
    foreach($aOptimRoute["nodes"] as $aNode){
      // Retrieve the pickup duration and delivery duration for the user associated to the node
      $iPickupDuration = 0;
      $iDeliveryDuration = 0;
      $sUserId=$this->retrieveHRId($aInstance,$aNode);
      if($sUserId!=""){
        if($aNode['type']=='pickup'){
          $iPickupDuration=$aHRLookup[$sUserId]['pickup_duration'];
        }
        if($aNode['type']=='delivery'){
          $iDeliveryDuration=$aHRLookup[$sUserId]['delivery_duration'];
        }
      }
      // Add a lastTime field : the difference between lastTime and time fields will give the
      //   time spent on the same location.
      //   - $aNode['time'] : arrival on the node (expressed in seconds)
      //   - between the 2 dates : pickup or delivery operations
      //   - $aNode['lastTime'] : departure from the node (expressed in milliseconds)
      if($sLastNodeId !== $aNode['idPoint']){
        $aNode['pickupDuration'] = $iPickupDuration;
        $aNode['deliveryDuration'] = $iDeliveryDuration;
        $aNode['lastTime'] = $aNode['time']*1000+$iPickupDuration+$iDeliveryDuration;
        $aDistinctNodes[] = $aNode;
      }
      else{
        $aLastNode = array_pop($aDistinctNodes);
        $aLastNode['pickupDuration'] += $iPickupDuration;
        $aLastNode['deliveryDuration'] += $iDeliveryDuration;
        $aLastNode['lastTime'] = $aNode['time']*1000+$iPickupDuration+$iDeliveryDuration;
        $aDistinctNodes[] = $aLastNode;
      }
      $sLastNodeId = $aNode['idPoint'];
    }
    return $aDistinctNodes;
  }

  /**
   * Given a list of distinct nodes (2 following node have a different point id) representing a route
   *   compute a waiting duration for each node. This waiting duration represents the time that the driver has to
   *   wait before reaching the node
   * @param array $aDistinctNodes : list of nodes (input / output : a waitingDuration field will be added to each node)
   * @param array $aInstance : the input data for the optimization (helps linking poi database ids to point optimizer ids)
   * @param array $aPOILookup : a POI lookup table to avoid querying to much the POI table
   */
  function computeWaitingDurations(&$aDistinctNodes,$aInstance,$aPOILookup){
    // Copy of some data from the last node that was visited during the main foreach loop
    $aLastNode = array();
    foreach($aDistinctNodes as &$aNode){
      $sPOIId=$this->retrievePOIId($aInstance,$aNode);
      $aPOI = $aPOILookup[$sPOIId];
      // Waiting duration computation
      if(isset($aLastNode['idPoint'])){
        // Time difference between the time for the current node and the lastTime for the previous node
        // Make sure we work with miliseconds
        $iNodesTimeDiff = $aNode['time']*1000-$aLastNode['lastTime'];
        // Travel duration as obtained by the duration matrix
        // Make sure we work with miliseconds (knowing that some travel durations can be provided by the
        //   routers in seconds but with some decimals)
        $iTravelDuration = round($aInstance["timeMatrix"][$aLastNode['idPoint']][$aNode['idPoint']])*1000;
        // Manoeuver duration is the service duration on the node + for the first node after the depot the
        //   duration for leaving the depot (this rule is given by the optimizer)
        $iManoeuverDuration = $aPOI["service_duration"]+$aLastNode['depotOutDuration'];
        // The waiting duration is obtained by counting the time difference between the POIs and removing all
        //    the operations on the road for which we know the duration :
        //     - duration spent on driving
        //     - duration spent in manoeuver before reaching the POI
        $aNode["waitingDuration"] = $iNodesTimeDiff-$iTravelDuration-$iManoeuverDuration;
        // Except on the first node, the duration for exiting the depot is always 0
        $aLastNode['depotOutDuration'] = 0;
      }
      else{
        // Waiting duration before the depoutOut step will always be 0
        $aNode["waitingDuration"] = 0;
        $aLastNode['depotOutDuration'] = $aPOI["service_duration"];
      }
      $aLastNode['idPoint'] = $aNode['idPoint'];
      $aLastNode['lastTime'] = $aNode['lastTime'];
    }
  }

  /**
   * Create a set of routes from an instance for which a solution is available
   * @param array $aOptim : the optimisation
   * @return string : an optimized set of routes
   */
  function toRoutes($aOptim){
    $this->log()->info(["method"=>__METHOD__,"data"=>count($aOptim["solution"]["routes"])]);
    $aRoutes=array();
    // Even when the solution is unfeasible, create routes (requested by spec)
    if(isset($aOptim["solution"]) && isset($aOptim["solution"]["feasible"])){
      // Create some HR an POI lookup tables to avoid calling to much database
      $aHRLookup = $this->createHRLookupTable($aOptim);
      $aPOILookup = $this->createPOILookupTable($aOptim);

      $oPOICtrl = new \OSS\Ctrl\POICtrl();
      foreach($aOptim["solution"]["routes"] as $aOptimRoute){
        $this->log()->info(["method"=>__METHOD__,"message"=>"Route ","data"=>$aOptimRoute]);
        $aRoute=array(
          "bMorning"=>$aOptim["instance"]["period"]=="AM",
          "label"=>"Tournée optimisée ".count($aRoutes),
          "timeslot_th"=>$aOptim["timeslot_th"],
          "scenario_main_id"=>$aOptim["scenario_main_id"],
          "POIs"=>array(),
          "optim_main_id"=>$aOptim['id']
        );

        // Make sure that 2 following route nodes will always be distinct (client route display assumption)
        $aDistinctNodes = $this->removeDuplicatedNodes($aOptimRoute,$aOptim["instance"],$aHRLookup);
        
        // Compute the waiting durations for each node
        $this->computeWaitingDurations($aDistinctNodes,$aOptim["instance"],$aPOILookup);
        
        // Conversion from nodes list to POIs list
        foreach($aDistinctNodes as $aNode){
          $sPOIId = $this->retrievePOIId($aOptim["instance"],$aNode);
          $aPOI = $aPOILookup[$sPOIId];
          $aPOI["waiting_duration"] = $aNode['waitingDuration'];
          $sUserId = $this->retrieveHRId($aOptim["instance"],$aNode);
          if($sUserId!="" && $aPOI["site_type_code"]=='HOME'){
            
            // This is a home POI : add the fields that concern the corresponding HR
            $aPOI["hr_id"]=$aHRLookup[$sUserId]["id"];
            $aPOI["hr_lastname"]=$aHRLookup[$sUserId]["lastname"];
            $aPOI["hr_firstname"]=$aHRLookup[$sUserId]["firstname"];
            $aPOI["hr_gender_label"]=$aHRLookup[$sUserId]["gender_label"];
            $aPOI["hr_birthday_dt"]=$aHRLookup[$sUserId]["birthday_dt"];
            $aPOI["hr_crisis_risk"]=$aHRLookup[$sUserId]["crisis_risk"];
            $aPOI["hr_specific_arrangement"]=$aHRLookup[$sUserId]["specific_arrangement"];
            $aPOI["hr_pickup_duration"]=$aHRLookup[$sUserId]["pickup_duration"];
            $aPOI["hr_delivery_duration"]=$aHRLookup[$sUserId]["delivery_duration"];
            $aPOI["transport_mode_code"]=$aHRLookup[$sUserId]["transportmode_code"];
           
            // Add the fields that concern the corresponding transport demand
            $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
            $aTransportDemand = $oDemandCtrl->get($this->retrieveTransportDemandId($aOptim["instance"],$aNode),false);
            $aPOI["transport_demand_id"]=$aTransportDemand["id"];
            $aPOI["transport_demand_institution_id"]=$aTransportDemand["institutionPOI"]["site_main_id"];
            $aPOI["transport_demand_institution_label"]=$aTransportDemand["institutionPOI"]["site_main_label"];
            $aPOI["transport_demand_institution_poi_id"]=$aTransportDemand["institutionPOI"]["id"];
            $aPOI["home_to_institution_acceptable_duration"]=$aTransportDemand["home_to_institution_acceptable_duration"];
            $aPOI["institution_to_home_acceptable_duration"]=$aTransportDemand["institution_to_home_acceptable_duration"];
            $aPOI["timeslots"]=$aTransportDemand["timeslots"];

            foreach($aPOI["timeslots"] as &$aTimeslot){
              $aTimeslot["pickupStartHour"] = $aRoute["bMorning"] ? $aTimeslot['start_hr'] : NULL;
              $aTimeslot["pickupEndHour"] = $aRoute["bMorning"] ? $aTimeslot['end_hr'] : NULL;
              $aTimeslot["deliveryStartHour"] = $aRoute["bMorning"] ? NULL : $aTimeslot['start_hr'];
              $aTimeslot["deliveryEndHour"] = $aRoute["bMorning"] ? NULL : $aTimeslot['end_hr'];
            }
            
            // Add the fields that concern the institutions linked to the POI (the list of institutions the HR linked to
            //   the current POI has subscribed to)
            $aPOI["institutions"] = $oPOICtrl->getInstitutions($sPOIId);            
          }
          else{
            // Get the institutions opening hours
            $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
            $aPOI["opening_hours"] = $oSiteCtrl->listHours(array(
              "siteId"=>$aPOI['site_main_id'],
              "timeslotId"=>$aOptim["timeslot_th"]
            ));
          }
          $aRoute["POIs"][]=$aPOI;
        }

        // Retrieve the corresponding input vehicle type
        $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
        $aVehicleCategory = $oVehicleCategoryCtrl->get($this->retrieveVehicleCategoryId($aOptim["instance"],$aOptimRoute));
        $aRoute['vehicleCategory']=array(
          'id'=>$aVehicleCategory['id'],
          'code'=>$aVehicleCategory['code'],
          'label'=>$aVehicleCategory['label'],
          'daily_cost' => $aVehicleCategory['daily_cost'],
          'hourly_cost' => $aVehicleCategory['hourly_cost'],
          'kilometric_cost' => $aVehicleCategory['kilometric_cost'],
          'co2_quantity' => $aVehicleCategory['co2_quantity']
        );

        // Set the start time for the route
        $aRoute['start_hr']=reset($aDistinctNodes)['time']*1000;
        $aRoutes[]=$aRoute;
      }
    }
    return $aRoutes;
  }

}