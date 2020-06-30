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
 *  REST service to retrieve optimisation runs
 *  @creationdate 2018-12-19
 **/

namespace OSS\Ctrl;

use Exception;

use OSS\BaseObject;

class OptimCtrl extends BaseObject{

  /**
  * Get the optim run lists
  * Notice that the scenarioMainId filter is mandatory for non admin users, otherwise an empty list will be returned
  * This is mostly for checking data access rights while keeping performances in terms of server response time
  * @param array $aData : filtering data status_code, scenarioMainId, timeSlotId, calendarDt, bWithDetails, nbDays
  * @param boolean $bDoNotCheckRights : used if called from processFIFO, where an optim associated to a scenario not owned by current user could be start
  * @return array({object}) : array of Optim object
  **/
  function list($aData,$bDoNotCheckRights=false){
    $aResult=array();
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    // In the current version, the access to the list of optimizations is restricted to administrators and
    //   to users that have access to the provided scenario. If no scenario filter is provided, access will
    //   be granted to adminstrators only. We do this because filtering access based on the scenarioMainId is
    //   too much time-consuming.
    // Notice that for each returned optimization object, some fields may contain some private data :
    //   - instance
    //   - solution
    //   - logs
    //   - errors
    // There is no check on the content of such fields and therefore in the current version we can not make sure
    //   that they contain only information that the current user is granted access to.
    if($this->isAdmin() || $bDoNotCheckRights || (isset($aData['scenarioMainId']) && $oScenarioCtrl->hasAccess($aData['scenarioMainId']))){
      $oOptimDAO = new \OSS\Model\OptimDAO();  
      $aResult = $oOptimDAO->list($aData);
    }
    return $aResult;
  }

  /**
  * Get optim
  * @param $id string
  * @return [id,code,label,instance,parameters,solution]
  **/
  function get($id){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$id]);
    $oOptimDAO = new \OSS\Model\OptimDAO();
    $aOptim = $oOptimDAO->get($id);
    // Now we will check access to the optim datagit
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    // The access to the optimization object is granted for admin users, and also for non admin users
    //   as long as a scenario is associated to the optimization and the current user has access to this scenario.
    // In the current version, we can not give access to an optimization that is non associated to a scenario, because
    //   this would imply a search into the following parameters that may contain some private data :
    //   - instance
    //   - solution
    //   - logs
    //   - errors
    // There is no check on the content of such fields and therefore in the current version we can not make sure
    //   that they contain only information that the current user is granted access to.
    if($this->isAdmin() || (isset($aOptim['scenario_main_id']) && $oScenarioCtrl->hasAccess($aOptim['scenario_main_id']))){
      // Access granted to the optim !! Now we will separate real errors from warnings and others
      $aErrors = json_decode($aOptim['errors'],true);
      $aOptim["real_errors"]=array();
      $aOptim["other_errors"]=array();
      foreach($aErrors as $aError){
        if($aError["type"]=="error"){
          $aOptim["real_errors"][]=$aError;
        }
        else{
          $aOptim["other_errors"][]=$aError;
        }
      }
    }
    else{
      // Access NOT granted to the optim
      $aOptim=array();
    }
    return $aOptim;
  }

  /**
  * Save an optimization to database.
  * If the input parameter has no "id" field, this means that this is a new optimization job creation, or in other
  *    words that we are inserting a new job in the optimization processing FIFO
  * @param array ["id"=>string,"login"=>string,"firstname"=>string,"lastname"=>string,"roles"=>["id","code","label"]]
  * @return string : optimId
  **/
  function save($optim){
    $this->log()->info(["method"=>__METHOD__]);
    $optimId = null;
    $oOptimDAO = new \OSS\Model\OptimDAO();
    // calendar_dt field is optional
    if(!isset($optim["calendar_dt"])){
      $optim["calendar_dt"]=NULL;
    }
    // If record Id is provide, update record, otherwise create new one
    $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
    if(isset($optim["id"])){
      // Get the optimization details from database to get the scenario_main_id (that is not mandatory in the input data)
      // The scenario_main_id is necessary for data access control in case user is not an administrator
      $aOptimDetails = $this->get($optim["id"]);
      if($this->isAdmin() || (isset($aOptimDetails['scenario_main_id']) && $oScenarioCtrl->hasAccess($aOptimDetails['scenario_main_id']))){
        $oOptimDAO->update($optim);
        $optimId = $optim["id"];
      }
    }
    else{
      // Adding an optim is granted to admin users even if 'scenario_main_id' field is not provided
      // If 'scenario_main_id' is provided, adding the optim is granted to all users that have access to the scenario
      if($this->isAdmin() || (isset($optim['scenario_main_id']) && $oScenarioCtrl->hasAccess($optim['scenario_main_id']))){
        // Insertion of a new job in the FIFO
        $optimId = $oOptimDAO->add($optim);
      }
    }
    return $optimId;
  }

  /**
   * Parse the next JSON block of the provided logs.
   * The input logs are modified : we keep the part that is located after the found logs.
   * If no JSON block is found, an empty array is returned
   * @param string $sLogs : the input logs, will be modified if a JSON block is found
   * @return array the first JSON block decoded in an array (with 3 fields : bNextBlockFound,raw and decoded )
   */
  function parseNextJSONBlock(&$sLogs){
    $aResult = array("bBlockFound"=>false,"raw"=>"","decoded"=>"","unparsed"=>"");
    $strposStart = strpos($sLogs,'<json>');
    if($strposStart!==false){
      // Make sure the search for the closing json tag starts after the json opening tag
      $strposEnd = strpos($sLogs,'</json>',$strposStart+6);
      // Keep only the text inside the <json>...</json>
      if($strposEnd !==false){        
        $sBeforeJSON = substr($sLogs,0,$strposStart);
        $sInsideJSON = substr($sLogs,$strposStart+6,$strposEnd-$strposStart-6);
        $sAfterJSON = substr($sLogs,$strposEnd+7);
        $sLogs = $sAfterJSON; 
        // whether a JSON block was found or not
        $aResult["bBlockFound"]=true;
        // the raw content of the JSON block
        $aResult["raw"]=$sInsideJSON;
        // the decoded content of the JSON block (may be null in case of invalid JSON)
        $aResult["decoded"]=json_decode($sInsideJSON,true);
        // the part of the logs located before the JSON block will not be parsed again
        $aResult["unparsed"]=$sBeforeJSON;
      }
    }
    return $aResult;
  }

  /**
   * Check whether a solution is available for a given instance and update the instance accordingly
   * Instances that are not in RUNNING state will be returned without any check or update
   * For instances that are in a RUNNING, the optimization server will be called to check for some info.
   * @param array $data : optim job id encapsulated in an array ["id"=>string]]
   * @return array : the available information about the job
   */
  function check($data){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$data]);
    // First get the data stored in database about the optim job
    $optim = $this->get($data["id"]);
    // If the current status is RUNNING, we will call optimization server for more information
    if($optim["status_code"]=="RUNNING"){
      $oOptimDAO = new \OSS\Model\OptimDAO();
      $aResult = $oOptimDAO->check($data);
      if(isset($aResult["bFound"])){
        // The optimization server replied
        if($aResult["bFound"]){
          // Some information about the job was found on the optimisation server
          if($aResult["bRunning"]){
            // Status that is reserved for optim jobs that were sent to the optim server
            //   and that are currently running on the optim server
            $optim["status_code"]="RUNNING";
          }
          else{
            // Status that is reserved for optim jobs that were sent to the optim server
            //   and that are no longer running on the optim server
            $optim["status_code"]="FINISHED";
          }
          if(isset($aResult["solution"])){
            // Copy new solution only if there are some changes
            if(json_encode($aResult["solution"])!=json_encode($optim["solution"])){
              $optim["solution"]=$aResult["solution"];
              $optim["last_solution_dt"]=time()*1000;
            }
          }
          if(isset($aResult["logs"])){
            $optim["logs"]=$aResult["logs"];
          }       
          if(isset($aResult["errors"])){
            $this->log()->info(["method"=>__METHOD__,"message"=>"start error parsing"]);
            $aErrors = array();
            $bParsingComplete = false;
            $sNotParsedText = "";
            while(!$bParsingComplete){
              $aParsingResult = $this->parseNextJSONBlock($aResult["errors"]);
              $sNotParsedText .= $aParsingResult["unparsed"];
              // Looping will end when no JSON block is found
              $bParsingComplete = !$aParsingResult["bBlockFound"];
              // Ignore warnings and ignore ill-formatted logs
              if(isset($aParsingResult["decoded"]["type"]) && $aParsingResult["decoded"]["type"] == "error"){
                $aErrors[]=$aParsingResult["decoded"];
              }
            }
            $this->log()->info(["method"=>__METHOD__,"message"=>"end of error parsing"]);
            $optim["errors"]="";
            if(count($aErrors)>0){
              $optim["errors"]=json_encode($aErrors);
            }
            else{
              // Add a security to make sure there will be at least one message when no solution is found
              if(!isset($aResult["solution"])){
                $optim["errors"]=$sNotParsedText.$aResult["errors"];
              }
            }            
          }
        }
        else{
          // In that case, it seems that the job is unknown from the optimization server
          // We use a LOST status that is reserved for optim jobs that were marked as running in database
          //   but for which we can not find the corresponding directory on the optim server. This may occur
          //   is case the optimization server restarted, flushing some instances directories.
          $optim["status_code"]="LOST";
        }
        $this->log()->info([
          "method"=>__METHOD__,
          "message"=>"Updating job #{$data['id']} after checking the optimization server"
        ]);
        $this->save($optim);
        // Refresh the optim object since the status_th may have changed
        $optim = $this->get($optim["id"]);
      }
    }
    // Return the available information
    return $optim;
  }

  /**
  * Processing optimization requests that are stored in db;
  * If the optimization server is not busy, pop the last entry out of FIFO table optim_main and launch it.
  * Then check for new solutions or logs that could be available for all RUNNING jobs
  **/
  public function processFIFO(){
    $this->log()->debug(["method"=>__METHOD__,"message"=>"Processing optim FIFO"]);
    // First test : are there any running optimizations ?
    $oOptimDAO = new \OSS\Model\OptimDAO();

    $status = null;
    try{
      $status = $oOptimDAO->status();
    }catch(Exception $e){
      // Optim server is not reachable
      $this->log()->warn(["method"=>__METHOD__,"message"=>$e->getMessage()]);
      $this->setResult("unreachable");
      return false;
    }

    // We have a response from optim server
    $this->setResult("connected");

    if(!$status){
      // No running job, get next job from optim_main
      $aNextOptim = $oOptimDAO->getNextJob();      
      if(isset($aNextOptim["id"])){
        $this->log()->info(["method"=>__METHOD__,"message"=>"Start New Optim Job","data"=>$aNextOptim]);
        // Get the details about the next optimization to launch
        $aOptim = $this->get($aNextOptim["id"]);
        // We check that the time and distance matrices are available
        // (due to data access control, we may get an empty array here in $aOptim variable )
        if(isset($aOptim["id"]) && isset($aOptim["instance"]["timeMatrix"]) && isset($aOptim["instance"]["distanceMatrix"]) && 
           $aOptim["instance"]["timeMatrix"] && $aOptim["instance"]["distanceMatrix"] ){
          // Launch the optimization and check the result code
          $this->log()->info(["method"=>__METHOD__,"message"=>"Launch Optim Job","data"=>$aNextOptim]);
          if($oOptimDAO->launch($aOptim) == $aNextOptim["id"]){
            // Launch was successfull, so we can pop the run out of the FIFO by changing its status
            $aOptim["status_code"]="RUNNING";
            $this->save($aOptim);
          }
        }
      }
    }

    // Check that the distance and time matrices are available for the instances that have not been started yet
    $aOptims = $this->list(array("status_code"=>"WAITING","bWithDetails"=>true),true);
    if(count($aOptims)>0){
      $this->log()->info(["method"=>__METHOD__,"message"=>"There are optim jobs in queue","data"=>count($aOptims)]);
    }
    foreach($aOptims as $aOptim){      
      if(!$aOptim["with_time_matrix"] || !$aOptim["with_distance_matrix"]){
        $this->log()->info(["method"=>__METHOD__,"message"=>"Get Matrix Distance","data"=>$aOptim]);
        // Try to download the matrix blocks and save the download results
        $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
        $aDownload = $oRoutingCtrl->downloadMatrixTomtomAsynchronous($aOptim["instance"]["points"],$aOptim["matrix_blocks"]);
        // After each download the input block information may be modified so we have to save it
        $aNewOptim = $this->get($aOptim["id"]);
        $aNewOptim["matrix_blocks"]["blocks"] = $aDownload["blocks"];
        
        // For debugging and progression purpose
        $aNewOptim["instance"]["matrix_blocks_info"] = $aOptim["matrix_blocks"];
        
        if(isset($aDownload["distances"]) && isset($aDownload["durations"])){
          $aNewOptim["instance"]["distanceMatrix"] = $aDownload["distances"];
          $aNewOptim["instance"]["timeMatrix"] = $aDownload["durations"];
        }
        $this->save($aNewOptim);
      }
    }
    // Now we will check the solutions for all the jobs that are marked as RUNNING
    // Temporarily, there can be several optim jobs marked as RUNNING in database
    $aOptims = $this->list(array("status_code"=>"RUNNING"));
    foreach($aOptims as $aOptim){
      $this->check(array("id"=>$aOptim["id"]));
    }    
  }

  /**
  * Send order to optim server for killing an optimization job
  * @param array $aData : expected to contain one id field
  * @return array : the available information about the job
  */
  function stop($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $oOptimDAO = new \OSS\Model\OptimDAO();
    // Send order for killing the job on the optim server if necessary
    $oOptimDAO->stop($aData);
    // Check whether the order was executed, update the job data in database and return the job info
    return $this->check($aData);
  }

  /**
  * Stop the checks on a optimization job that would be in a RUNNING state.
  * Restart the checks on a optimization job that would be in a PAUSED state.
  * This will update the job status_code to PAUSED or RUNNING in the database
  * This will NOT have any effects on the optimization job on the optimization server.
  * @param array $aData : expected to contain one id field
  * @return array : the available information about the job
  */
  function pause($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aOptim = $this->get($aData["id"]);
    // We can only pause a RUNNING optimization job or restart a PAUSED optimization
    if($aOptim['status_code']=="RUNNING" || $aOptim['status_code']=="PAUSED"){
      $aOptim['status_code'] = ($aOptim['status_code']=="PAUSED") ? "RUNNING" : "PAUSED";
      $this->save($aOptim);
      // Refresh the optim object since the status_th may have changed
      $aOptim = $this->get($aOptim["id"]);
    }
    // In case the job is awaken, check immediately for new results
    if($aOptim['status_code'] == "RUNNING"){
      $aOptim = $this->check($aData);
    }
    return $aOptim;
  }

  /**
   * Create an instance from an existing scenario, save it to database and return the optimization id
   * The expected input filters should contain :
   *   timeSlotId: the considered time slot id (string),
   *   scenarioMainId: the considered scenario id (string),
   *   calendarDt: the considered day (integer, expressed as ms),
   *   options: router, timeLimit : parameters for the optimization
   * @param array $aData : some filters that enables to get the scenario
   * @return string : an optimization id
   */
  function fromScenario($aData){
    $this->log()->info(["method"=>__METHOD__]);
    $oInstanceWriterCtrl = new \OSS\Ctrl\InstanceWriterCtrl();
    $aOptim = $oInstanceWriterCtrl->fromScenario($aData);
    $aOptim["calendar_dt"]=$aData["calendarDt"];
    // Save the instance input parameters into database : this results in the instance to be inserted in
    //   the optimization processing FIFO.
    return $this->save($aOptim);
  }

  /**
   * Create an instance from existing routes, save it to database and return the optimization id
   * The expected input filters should contain :
   *   institutions: the list of institutions involved in the routes
   *   timeSlotId: the considered time slot id (string),
   *   scenarioMainId: the considered scenario id (string),
   *   options: router, timeLimit : parameters for the optimization
   * @param array $aData : some filters that enables to get a set of routes
   * @return string : an optimization id
   */
  function fromRoutes($aData){
    $oInstanceWriterCtrl = new \OSS\Ctrl\InstanceWriterCtrl();
    // Save the instance input parameters into database : this results in the instance to be inserted in
    //   the optimization processing FIFO.
    return $this->save($oInstanceWriterCtrl->fromRoutes($aData));
  }

  /**
   * Create a set of routes from an instance for which a solution is available
   * @param string $sOptimId : the optimisation id
   * @return string : an optimized set of routes
   */
  function toRoutes($sOptimId){
    $oInstanceReaderCtrl = new \OSS\Ctrl\InstanceReaderCtrl();
    $aOptim = $this->get($sOptimId);
    $aRoutes = $oInstanceReaderCtrl->toRoutes($aOptim);
    return $aRoutes;
  }


  /**
   * Get the default parameters for the optimization server
   * @return array : the default parameters for the optimization server
   */
  function getDefaultParams(){
    $oInstanceWriterCtrl = new \OSS\Ctrl\InstanceWriterCtrl();
    return $oInstanceWriterCtrl->getDefaultParams();
  }

  /**
  * Mark as removed
  * @param string $sOptimId : id of the hr to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sOptimId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sOptimId]);
    $oOptimDAO = new \OSS\Model\OptimDAO();
    $bResult = $oOptimDAO->markAsRemoved($sOptimId);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sOptimId,'optim_main');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete
  * @param string $sOptimId : id of the hr to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sOptimId){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sOptimId]);
    $bResult = false;
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sOptimId,'optim_main');
    $oOptimDAO = new \OSS\Model\OptimDAO();
    $bResult = $oOptimDAO->delete($sOptimId);
    $this->setResult($bResult);
    return $bResult;
  }

}