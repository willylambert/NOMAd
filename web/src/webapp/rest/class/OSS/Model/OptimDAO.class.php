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
 *  Class for optim handling optim in database
 *  @creationdate 2018-12-19
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class OptimDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /*
   * List Optimisation jobs
   * A filter on the jobs status code is available : one can use 'NULL' code to target optimization instances for
   *   which the status code is not set
   
   * @return array({object}) : array of Optim objects
   */
  public function list($aData){
    $sStatusCodeClause = "";
    if(isset($aData['status_code']) && $aData['status_code']!=''){
      if($aData['status_code']=='NULL'){
        $sStatusCodeClause= " AND optim_main.status_th IS NULL ";
      }
      else{
        $sStatusCodeQuoted = $this->db()->quote($aData['status_code']);
        $sStatusCodeClause= " AND util_thesaurus.cat='OPTIM_MAIN_STATUS' AND util_thesaurus.code=$sStatusCodeQuoted ";
      }
    }
    $sSearchPatternClause = $this->db()->getSearchClause($aData,array("optim_main.label","optim_main.code"));
    $sOrderByClause=" ORDER BY optim_main.start_dt ";
    if(isset($aData['descendingOrder']) && $aData['descendingOrder']){
      $sOrderByClause.= " DESC ";
    }

    $sScenarioMainIdClause = "";
    if(isset($aData["scenarioMainId"]) && $aData['scenarioMainId']!=''){
      $sScenarioMainIdQuoted = $this->db()->quote($aData["scenarioMainId"]);
      $sScenarioMainIdClause = " AND optim_main.scenario_main_id = $sScenarioMainIdQuoted ";
    }
    $sTimeslotThClause = "";
    if(isset($aData["timeSlotId"]) && $aData['timeSlotId']!=''){
      $sTimeslotThQuoted = $this->db()->quote($aData["timeSlotId"]);
      $sTimeslotThClause = " AND optim_main.timeslot_th = $sTimeslotThQuoted ";
    }
    $sCalendarDtClause = "";
    if(isset($aData["calendarDt"]) && $aData['calendarDt']!=''){
      $sCalendarDtQuoted = $this->db()->quote(round($aData["calendarDt"]/1000));
      $sCalendarDtClause = " AND optim_main.calendar_dt = $sCalendarDtQuoted ";
    }
    $sWithDetails = "";
    if(isset($aData["bWithDetails"]) && $aData['bWithDetails']){
      $sWithDetails .= "optim_main.matrix_blocks, ";
      $sWithDetails .= "optim_main.instance, ";
      $sWithDetails .= "optim_main.parameters, ";
      $sWithDetails .= "optim_main.solution, ";
    }
    $sStartDtClause = "";
    if(isset($aData["nbDays"]) && $aData['nbDays']!=''){
      $sStartDtClause = "AND optim_main.start_dt > ".(time()-intval($aData['nbDays'])*86400) ." ";
    }
    $query = "SELECT optim_main.id,
                     optim_main.code,
                     scenario_main.label as scenario_main_label,
                     CAST(optim_main.start_dt AS bigint)*1000 as start_dt,
                     CAST(optim_main.last_solution_dt AS bigint)*1000 as last_solution_dt,
                     CAST(optim_main.calendar_dt AS bigint)*1000 as calendar_dt,
                     optim_main.label,
                     CASE WHEN optim_main.instance->'timeMatrix' is null THEN false ELSE true END as with_time_matrix,
                     CASE WHEN optim_main.instance->'distanceMatrix' is null THEN false ELSE true END as with_distance_matrix,
                     CASE WHEN optim_main.solution is null THEN false ELSE true END as with_solution,
                     json_array_length(optim_main.solution->'routes') as routes_count,
                     optim_main.solution->'cost' as cost,
                     $sWithDetails
                     optim_main.status_th,
                     util_thesaurus.code as status_code,
                     util_thesaurus.label as status_label
              FROM optim_main
              LEFT JOIN scenario_main ON scenario_main.id = optim_main.scenario_main_id

              LEFT JOIN util_thesaurus ON util_thesaurus.id=optim_main.status_th
              WHERE optim_main.rec_st<>'D'
              $sStartDtClause
              $sScenarioMainIdClause
              $sTimeslotThClause
              $sCalendarDtClause
              $sStatusCodeClause
              $sSearchPatternClause
              $sOrderByClause";
    $result = $this->db()->query($query);
    $aOptims = $result->fetchAll(PDO::FETCH_ASSOC);
    if(isset($aData["bWithDetails"]) && $aData['bWithDetails']){
      foreach($aOptims as & $optim){
        $optim['solution'] = json_decode($optim['solution'],true);
        $optim['parameters'] = json_decode($optim['parameters'],true);
        $optim['instance'] = json_decode($optim['instance'],true);
        $optim['matrix_blocks'] = json_decode($optim['matrix_blocks'],true);
      }
    }
    return $aOptims;
  }

  /**
  * Return optim, containing the following fields :
  *   id,code,start_dt,last_solution_dt,label,instance,
  *   parameters,solution,logs,errors,status_th, status_code and matrix_blocks
  * @param string $id : id of the optim.
  * @return array an optimisation instance
  **/
  function get($id){
    $idQuoted = $this->db()->quote($id);
    $sSql = "SELECT
                    optim_main.id,
                    optim_main.code,
                    optim_main.scenario_main_id,
                    optim_main.timeslot_th,
                    CAST(optim_main.start_dt AS bigint)*1000 as start_dt,
                    CAST(optim_main.last_solution_dt AS bigint)*1000 as last_solution_dt,
                    optim_main.label,
                    optim_main.instance,
                    optim_main.parameters,
                    optim_main.solution,
                    optim_main.logs,
                    optim_main.errors,
                    optim_main.status_th,
                    optim_main.matrix_blocks,
                    util_thesaurus.code as status_code,
                    CAST(optim_main.calendar_dt AS bigint)*1000 as calendar_dt
               FROM optim_main
               LEFT JOIN util_thesaurus ON util_thesaurus.id=optim_main.status_th
              WHERE optim_main.id = $idQuoted";
    $oResult = $this->db()->query($sSql);
    $aOptim = $oResult->fetch(PDO::FETCH_ASSOC);
    $aOptim['instance'] = json_decode($aOptim['instance'],true);
    $aOptim['parameters'] = json_decode($aOptim['parameters'],true);
    $aOptim['solution'] = json_decode($aOptim['solution'],true);
    $aOptim['matrix_blocks'] = json_decode($aOptim['matrix_blocks'],true);
    return $aOptim;
  }

  /**
  * Add a new optim job in the FIFO
  * the status_th field is unset, which means the job is waiting for being processed
  * @param array ["id"=>string,"code",=>string,"label"=>string,"instance"=>string,parameters"=>string]
  * @return new user Id
  **/
  function add($optim){
    $codeQuoted = $this->db()->quote($optim["code"]);
    $labelQuoted = $this->db()->quote($optim["label"]);
    $sScenarioMainIDQuoted = $this->db()->quote($optim["scenario_main_id"]);
    $sMatrixBlocksQuoted = ($optim["matrix_blocks"]!="") ? $this->db()->quote(json_encode($optim["matrix_blocks"])) : "NULL";
    $sTimeslotThQuoted = $this->db()->quote($optim["timeslot_th"]);
    $parametersQuoted = ($optim["parameters"]!="" ? $this->db()->quote(json_encode($optim["parameters"])) : "NULL");
    $instanceQuoted = ($optim["instance"]!="" ? $this->db()->quote(json_encode($optim["instance"])) : "NULL");
    $calendarDtQuoted = ($optim["calendar_dt"]!="" ? $this->db()->quote(round($optim["calendar_dt"]/1000)) : "NULL");
    $sql = "INSERT INTO optim_main(
                          code,
                          label,
                          scenario_main_id,
                          matrix_blocks,
                          timeslot_th,
                          status_th,
                          instance,
                          parameters,
                          start_dt,
                          calendar_dt)
                 VALUES(
                          $codeQuoted,
                          $labelQuoted,
                          $sScenarioMainIDQuoted,
                          $sMatrixBlocksQuoted,
                          $sTimeslotThQuoted,
                          (SELECT util_thesaurus.id FROM util_thesaurus WHERE util_thesaurus.code = 'WAITING' AND util_thesaurus.cat='OPTIM_MAIN_STATUS'), 
                          $instanceQuoted,
                          $parametersQuoted,".
                          time().",
                          $calendarDtQuoted
                        )
            RETURNING id";

    $result = $this->db()->query($sql);
    $row = $result->fetch(PDO::FETCH_ASSOC);
    return $row["id"];
  }


  /**
  * Update an optim job in the FIFO
  * Field start_dt can not be updated because it indicates the date of creation of the optim job, which is
  *   giving the order of the FIFO.
  * @param array ["id"=>string,"code",=>string,"label"=>string,"instance"=>string,parameters"=>string, solution=>string]
  * @return boolean : true in case of success, false otherwise
  **/
  function update($optim){
    $idQuoted = $this->db()->quote($optim["id"]);
    $codeQuoted = $this->db()->quote($optim["code"]);
    $labelQuoted = $this->db()->quote($optim["label"]);
    $parametersQuoted = ($optim["parameters"]!="") ? $this->db()->quote(json_encode($optim["parameters"])) : "NULL";
    $instanceQuoted = ($optim["instance"]!="") ? $this->db()->quote(json_encode($optim["instance"])) : "NULL";
    $solutionQuoted = ($optim["solution"]!="") ? $this->db()->quote(json_encode($optim["solution"])) : "NULL";
    $sMatrixBlocksQuoted = ($optim["matrix_blocks"]!="") ? $this->db()->quote(json_encode($optim["matrix_blocks"])) : "NULL";
    $logsQuoted = ($optim["logs"]!="") ? $this->db()->quote($optim["logs"]) : 'NULL';
    $errorLogsQuoted = ($optim["errors"]!="") ? $this->db()->quote($optim["errors"]) : 'NULL';
    $lastSolutionDtQuoted = isset($optim["last_solution_dt"]) ? $this->db()->quote(round($optim["last_solution_dt"]/1000)) : 'NULL';
    $calendarDtQuoted = ($optim["calendar_dt"]!="" ? $this->db()->quote(round($optim["calendar_dt"]/1000)) : "NULL");
    // Handle the case where the status code is set
    $sStatusCodeUpdateClause = "";
    if(isset($optim["status_code"])){
      $statusCodeQuoted = $this->db()->quote($optim["status_code"]);
      $sStatusCodeUpdateClause = ",status_th = (
                                                 SELECT util_thesaurus.id
                                                   FROM util_thesaurus
                                                  WHERE util_thesaurus.code = $statusCodeQuoted
                                                    AND util_thesaurus.cat='OPTIM_MAIN_STATUS'
                                               ) ";
    }
    $sql = "UPDATE optim_main
               SET code = $codeQuoted,
                   label = $labelQuoted,
                   parameters = $parametersQuoted,
                   instance = $instanceQuoted,
                   solution = $solutionQuoted,
                   last_solution_dt = $lastSolutionDtQuoted,
                   logs = $logsQuoted,
                   errors = $errorLogsQuoted,
                   matrix_blocks = $sMatrixBlocksQuoted,
                   calendar_dt = $calendarDtQuoted
                   $sStatusCodeUpdateClause
             WHERE id = $idQuoted";
    $result = $this->db()->query($sql);
    $row = $result->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Return next job to process.
  * Jobs to process are retrieved thanks to their unset status_th.
  * The order is given by the start_dt field (date of job creation)
  * @return json_object
  **/
  function getNextJob(){
    $sql = "SELECT optim_main.id
            FROM optim_main
            INNER JOIN util_thesaurus ON optim_main.status_th=util_thesaurus.id AND util_thesaurus.cat='OPTIM_MAIN_STATUS'
            WHERE util_thesaurus.code='WAITING' AND optim_main.rec_st<>'D'
            ORDER BY start_dt ASC
            LIMIT 1";
    $result = $this->db()->query($sql);
    return $result->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Send order to optim server for killing an optimization job
  * @param array $aData : expected to contain a id field (the optimization job id)
  * @param string : "true" if killing succeeded and "false" if it failed
  */
  function stop($aData){
    $options = array(
        CURLOPT_POST => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_URL => $this->config('OPTIM_HOST_URL') . "/rest/kill",
        CURLOPT_PORT => $this->config('OPTIM_PORT'),
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_FAILONERROR => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_POSTFIELDS => json_encode(array("runId"=>$aData["id"]))
    );
    $ch = curl_init();
    curl_setopt_array($ch, ($options));
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
  }

  /**
   * Check whether a solution and other information are available for a given instance.
   * The information we are looking for :
   *  - whether the job is known by the optim server ("bFound" field)
   *  - whether the job is currently running or not ("bRunning" field)
   *  - the last available solution (optionnal - "solution" field)
   *  - some output logs (optionnal - "logs" field)
   *  - some error logs (optionnal - "errors" field)
   * @param array ["id"=>string]]
   * @return array : some data about the optimization instance if available (solution, status, logs, ...)
   */
  function check($data){
    $aResult=array();
    $options = array(
      CURLOPT_HEADER => 0,
      CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
      CURLOPT_URL => $this->config('OPTIM_HOST_URL') . "/rest/check/".$data["id"],
      CURLOPT_PORT => $this->config('OPTIM_PORT'),
      CURLOPT_FRESH_CONNECT => 1,
      CURLOPT_RETURNTRANSFER => 1,
      CURLOPT_FORBID_REUSE => 1,
      CURLOPT_FAILONERROR => true,
      CURLOPT_TIMEOUT => 30,
    );
    $ch = curl_init();
    curl_setopt_array($ch, ($options));
    $result = curl_exec($ch);
    if($result===false)
    {
      $sCurlError = curl_error($ch);
      $this->log()->error([
        "method"=>__METHOD__,
        "message"=>"Error while checking solutions for optim #{$data['id']} " . $sCurlError
      ]);
      // In case the server is down or unreachable, throw an exception
      if(strpos($sCurlError,"Failed to connect to")===0){
        curl_close($ch);
        throw new \OSS\AppException(
          "Optimization server seems to be down or unreachable.",
          \OSS\AppException::OPTIM_FAILED_SERVER_DOWN
        );
      }
      else{
        curl_close($ch);
        throw new \OSS\AppException(
          "Checking solution on optim #{$data['id']} failed.",
          \OSS\AppException::OPTIM_FAILED
        );
      }
    }
    else{
      //$this->log()->debug(["message"=>"check status","data"=>$result]);
      $aResult = json_decode($result,true);
    }
    curl_close($ch);
    return $aResult;
  }

  /**
  * Get status of solver server.
  * If no job is running on the opimization server, the function returns false
  * If a job is running on the optimization server, the function will return an array containing:
  *  - a startTime field indicating the job start time on the optimization server
  *  - a duration field indicating the job duration on the optimization server
  *  - a runId field indicating the job runId
  *  - a status field containing "running"
  * If several jobs are running at the same time, only the information about one of these
  *   jobs will be returned.
  * @return mixed : array of information about the running instance if any, false if there is no running instance
  **/
  function status(){
    $options = array(
        CURLOPT_HEADER => 0,
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_URL => $this->config('OPTIM_HOST_URL') ."/rest/status",
        CURLOPT_PORT => $this->config('OPTIM_PORT'),
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_FAILONERROR => true,
        CURLOPT_TIMEOUT => 5
    );

    $ch = curl_init();
    curl_setopt_array($ch, ($options));
    if( ! $result = curl_exec($ch))
    {
      throw new Exception(
        "Error Optim server : " . curl_error($ch) . " for " . $this->config('OPTIM_HOST_URL') ."/rest/status"
      );
    }else{
      //We have result
      $result = json_decode($result,true);
    }
    curl_close($ch);

    return $result;
  }

  /**
  * Launch an optimization job for an instance.
  * The returned value is just an acknowledgement from the optimization server to check that
  *   the optimization job was correctly launched.
  * Although several jobs can be run concurrently on the optimization server, only one should be lauched at a
  *   time for performance reasons. Therefore would should check wether there are running jobs on the optim server
  *   (using $this->status() function for instance) before calling this function
  * @param array $aOptimData : the optimization job in encapsulated in an array
  * @return mixed : the optimization job id when the optimization job was correctly launched and false otherwise
  **/
  function launch($aOptimData){
    $options = array(
        CURLOPT_POST => 1,
        CURLOPT_HEADER => 0,
        CURLOPT_HTTPHEADER => array('Content-Type:application/json'),
        CURLOPT_URL => $this->config('OPTIM_HOST_URL') . "/rest/launch/".$aOptimData["id"],
        CURLOPT_PORT => $this->config('OPTIM_PORT'),
        CURLOPT_FRESH_CONNECT => 1,
        CURLOPT_RETURNTRANSFER => 1,
        CURLOPT_FORBID_REUSE => 1,
        CURLOPT_FAILONERROR => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_POSTFIELDS => json_encode($aOptimData)
    );
    $ch = curl_init();
    curl_setopt_array($ch, ($options));
    $this->log()->info([
      "method"=>__METHOD__,
      "message"=>"Launching solver for optim #{$aOptimData['id']}..."
    ]);
    $result = curl_exec($ch);
    if($result===false)
    {
      $sCurlError = curl_error($ch);
      $this->log()->error([
        "method"=>__METHOD__,
        "message"=>"Error while launching solver for optim #{$aOptimData['id']} " . $sCurlError
      ]);
      // In case the server is down or unreachable, throw an exception
      if(strpos($sCurlError,"Failed to connect to")===0){
        curl_close($ch);
        throw new \OSS\AppException(
          "Optimization server seems to be down or unreachable.",
          \OSS\AppException::OPTIM_FAILED_SERVER_DOWN
        );
      }
      else{
        curl_close($ch);
        throw new \OSS\AppException(
          "Launching optimization failed on optim #{$aOptimData['id']} failed.",
          \OSS\AppException::OPTIM_FAILED
        );
      }
    }
    else{
      $this->log()->info([
        "method"=>__METHOD__,
        "message"=>"Solver succesfully launched for optim #{$aOptimData['id']}..."
      ]);
    }
    curl_close($ch);
    // Return the optimization job id
    return $result;
  }

  /**
  * Mark as removed
  * @param string $sOptimId : id of the hr to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sOptimId){
    $bResult=false;    
    if($this->hasAccess($sOptimId)){
      $query = "UPDATE optim_main SET rec_st='D' WHERE id=" . $this->db()->quote($sOptimId);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }

  /**
  * Delete a hr.
  * @param string $sOptimId : id of the optim to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sOptimId){
    $this->db()->beginTransaction();
    $query = "DELETE FROM optim_main WHERE id=" . $this->db()->quote($sOptimId);
    $this->db()->exec($query);
    return $this->db()->commit();
  }

}