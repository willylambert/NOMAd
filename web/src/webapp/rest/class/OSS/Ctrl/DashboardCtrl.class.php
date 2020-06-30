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
 *  REST service to retrieve demands
 *  @creationdate 2018-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class DashboardCtrl extends BaseObject{

  /**
   * Get Scenario Dashboard for a date range
   * $aData array ["scenarioMainId","startDt" => timestamp in ms, "endDt" => timestamp in ms]
   * @return array dashboard data
   */
  function getScenarioDateRange($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);

    // Get scenario
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();

    $aResult = [];
    $weekStats = [];
    $aRegularityAM = [];
    $aRegularityPM = [];

    // Select all the calendars that are concerned by the scenario
    $aServedPOIs = array();
    $aRoutes = $oScenarioCtrl->listRoutesByCalendarDt([
      "scenarioMainId"=>$aData['scenarioMainId'],
      "startDt"=>$aData['startDt'],
      "endDt"=>$aData['endDt']
    ]);

    $this->log()->info(["method"=>__METHOD__,"message"=> count($aRoutes) . " routes found"]);

    foreach($aRoutes as $route){
      $day = date('w',$route["date_dt"]/1000);
      $startOfWeek = date('U', strtotime('-'.$day.' days',$route["date_dt"]/1000))*1000;
      $weekId = date("Y-W",$startOfWeek/1000);      

      if(!isset($weekStats["$weekId"])){
        $weekStats["$weekId"] = ["duration"=>0,
                                 "distance"=>0,
                                 "cost"=>0,
                                 "co2"=>0,
                                 "poiCount"=>0,
                                 "dt"=>$startOfWeek,
                                 "week"=>date("W",$route["date_dt"]/1000),
                                 "year"=>date("Y",($route["date_dt"]/1000)+3600*24*5),
                                 "yearWeek"=>intval(date("Y",(($route["date_dt"]/1000)+3600*24*5))) * 100 + intval(date("W",$route["date_dt"]/1000)),
                                 "label"=>"S" . date("W",$route["date_dt"]/1000)];
      }
      
      $weekStats["$weekId"]["duration"] += $route["duration"];
      $weekStats["$weekId"]["distance"] += $route["distance"];
      $weekStats["$weekId"]["cost"] += $route["cost"];
      $weekStats["$weekId"]["co2"] += $route["co2"];

      // Build regularity dashboard
      foreach($route['POIs'] as $poi){
        $weekStats["$weekId"]["poiCount"]++;
        if($poi['hr_id']!=null){
          $aRegularity = [  "name"=>$poi["hr_lastname"] . " " . $poi["hr_firstname"],
                           "value"=>$poi["target_hr"],
                              "dt"=>$route["date_dt"]];
          if($route["bMorning"]){
            $aRegularityAM[] = $aRegularity;
          }else{
            $aRegularityPM[] = $aRegularity;
          }
        }
      }
    }

    foreach($weekStats as $weekId=>$weekStat){
      $aResult["weekStats"][] = $weekStat;
    }

    usort($aRegularityAM,[$this,"cmpRegularity"]);
    usort($aRegularityPM,[$this,"cmpRegularity"]);

    $aResult["regularityAMStats"] = $aRegularityAM;
    $aResult["regularityPMStats"] = $aRegularityPM;

    $this->setResult($aResult);
    return $aResult;
  }

  function cmpRegularity($a,$b){
    return $a["dt"]-$b["dt"];
  }

}