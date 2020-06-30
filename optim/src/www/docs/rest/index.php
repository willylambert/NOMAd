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

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
require('/var/lib/vendor/autoload.php');

function dumpRet($mixed = null) {
    ob_start();
    var_dump($mixed);
    $content = ob_get_contents();
    ob_end_clean();
    return $content;
  }

// Autoloader \OSS classes
function autoloaderOSS($class) {
  include dirname(__FILE__) . '/class/' . str_replace('\\', '/', $class) . '.class.php';
}
spl_autoload_register('autoloaderOSS');

$app = new \Slim\App([
    'settings' => [
        // Only set this if you need access to route within middleware
        'determineRouteBeforeAppMiddleware' => true
    ]]);

$logger = new \OSS\LogWriter();

// Middleware to add log before and after request
$app->add(function ($request, $response, $next) use($logger) {
  $logger->info(array("message"=>"*** REQUEST START " . $_SERVER["REQUEST_URI"]));
  $response = $next($request, $response);
  $logger->info(array("message"=>"### REQUEST END   " . $_SERVER["REQUEST_URI"]));
  return $response;
});

$app->get('/test', function(Request $request, Response $response, array $args) {
  $data = $request->getParsedBody();
  $response->getBody()->write("yes");
  return $response;
});

/**
* Launch an optimization (in background) and return the input run id without waiting the optimization results
* @param GET string runId : the optimization run id
* @param POST json_array : instance and parameters
* @return string $runId
**/
$app->post('/launch/{runId}', function(Request $request, Response $response, array $args) use($logger) {
  $logger->info(array("message"=>"Start solver for optim ".$args['runId']));
  
  $sRunId = $args['runId'];

  $data = $request->getParsedBody();
  // Write input to disk : we keep the data so that is is easier to search and 
  //   the run id to make sure there will be no 2 concurrent instances
  $instanceFolder = "/var/www/data/instance/" . date("Ymd_H_i_s")."_".$sRunId;
  mkdir($instanceFolder);

  $input = $instanceFolder . "/input.json";
  $param = $instanceFolder . "/param.json";
  $initialSol = $instanceFolder . "/initial_sol.json";
  $logs_out = $instanceFolder . "/logs_out";
  $logs_err = $instanceFolder . "/logs_err";

  // Override the provided parameters so that the output are written in the same directory as the input
  //   and with the expected names
  $data["parameters"]["path_export_best_sol"]=$instanceFolder."/best_sol.json";
  $data["parameters"]["path_stop_file"]=$instanceFolder."/output.json";

  file_put_contents($input, json_encode($data["instance"]));
  file_put_contents($param, json_encode($data["parameters"]));
 
  // Setup initial solution if provided
  if(isset($data["parameters"]["initialSolution"])){
    // Save it do disk
    file_put_contents($initialSol,json_encode($data["parameters"]["initialSolution"]));
  }

  // Make sure that the executable is compiled in release mode (flag NOMAD active), otherwise in case
  //   of error it will request user to press some keys for confirmation.
  exec("/opt/nomad/src/taxi_share_algo $input $param " . (isset($data["parameters"]["initialSolution"])?$initialSol:"") . " > $logs_out 2> $logs_err &");
  $logger->info(array("message"=>"Solver started for optim ".$args['runId']));
  $response->getBody()->write($sRunId);
  return $response;
});

/**
* Get information about running optimisation process
* Returned status will be false if no jobs are running or a json string containing
*   the startTime, duration and runId + a status field containing "running"
* In case several jobs are running, only the information for one of these jobs will be returned
* @return json string describing the status
**/
$app->get('/status', function(Request $request, Response $response, array $args) use($logger) {
  $logger->info(array("message"=>"Checking status "));

  $tblPs = array();
  exec("ps aux | grep taxi_share_algo",$tblPs);
  // Expected response format, for each returned line :
  // user PID CPU MEMORY XXXX XXXX X X start_time duration process param1 param2 param3 ...

  $bOptimJobFound = false;
  $tblRet=false;
  foreach($tblPs as $ps){
    // We assume we have at least 1 line in the exec response : the line that contains the grep process info
    //   (which we will discard). The other lines, if present, are likely to refer to a running taxi_shar_algo process
    if(strpos($ps,"grep")===false){
      // Get the different fields in the current line of the exec response
      $tblInfos = explode(" ",preg_replace('/\s+/', ' ',$ps));
      // Check that this is a running taxi_share_algo process
      if($tblInfos[10] == "/opt/nomad/src/build/taxi_share_algo"){
        // We have found one running optim job !
        $bOptimJobFound=true;
        // Retrieve the run id from the taxi_share_algo input command
        // First we retrieve the input file path in the first taxi_share_algo command parameter
        $sInputFilePath = $tblInfos[11];
        // The input file path is expected to be /var/www/data/instance/date_hh_mm_ss_runId/input.json
        $aInputFilePathElements = explode("/",$sInputFilePath);
        $sDateAndRunID = $aInputFilePathElements[5];
        $aDateAndRunIDElements = explode("_",$sDateAndRunID);
        $sRunID = $aDateAndRunIDElements[4];
        $tblRet = array("startTime"=>$tblInfos[8],'duration'=>$tblInfos[9],'runId'=>$sRunID);
        $tblRet['status'] = "running";
        $logger->info(array("message"=>"Optim Job #" . $sRunID . " is running"));      
      }
    }
    if($bOptimJobFound){
      // Assuming there can be only one such running job at a time, we will break the foreach loop      
      break;
    }
  }
  $response->getBody()->write(json_encode($tblRet));
  return $response;
});

/**
* Kill the asked runId
* @param POST {rundId:runIdToKill}
* @return boolean true if process found, false otherwise
**/
$app->post('/kill', function(Request $request, Response $response, array $args) use($logger) {  
  $data = $request->getParsedBody();
  $logger->info(array("message"=>"Killing " . $data['runId']));

  $tblPs = array();
  exec("ps aux | grep taxi_share_algo | grep " . $data['runId'] ,$tblPs);
  // Expected response format, for each returned line :
  // user PID CPU MEMORY XXXX XXXX X X start_time duration process param1 param2 param3 ...

  $bRet = false;
  foreach($tblPs as $ps){
    // Get the different fields in the current line of the exec response
    $tblInfos = explode(" ",preg_replace('/\s+/', ' ',$ps));
    // Check that this is a running taxi_share_algo process
    if($tblInfos[10] == "/opt/nomad/src/build/taxi_share_algo"){
      // Retrieve the PID
      $pid = $tblInfos[1];
      exec("kill $pid");
      $bRet = true;
    }
  }
  $logger->info(array("message"=>"Result : " . $bRet));
  $response->getBody()->write($bRet);
  return $response;
});

/**
* Get information about running optimisation process.
* First it will look for a directory instance in /var/www/data/instance.
* If no directory for the instance is found, the script will return bRunning:false and bFound:false
* Otherwise, the script:
*   - will return a bFound:true field
*   - may return a solution field if a best_sol.json file is present in the instance directory
*   - may return a logs field if a log_out file is present in the instance directory
*   - may return a errors field if a log_err file is present in the instance directory
*   - will return a boolean bRunning field indicating whether the process is currently running
* @param GET runId : id of the process that we want to check
* @return json string
**/
$app->get('/check/{runId}', function(Request $request, Response $response, array $args) use($logger) {
  $logger->info(array("message"=>"Checking solutions for optim ".$args['runId']));
  $aResult=array("bRunning"=>false,"bFound"=>false);

  // Check for the presence of an instance corresponding to the runId. If not present, we consider
  //   that the runId and its data was not received by optimizer and that the optimization did not start
  $aDirectories = array();
  exec("ls /var/www/data/instance | grep _" . $args['runId'] ,$aDirectories);
  if(count($aDirectories)>0){
    $aResult["bFound"]=true;

    // Try to know wether the process corresponding to the input run ID is running or not
    $tblPs = array();
    exec("ps aux | grep taxi_share_algo  | grep " . $args['runId'] ,$tblPs);
    // Expected response format, for each returned line :
    // user PID CPU MEMORY XXXX XXXX X X start_time duration process param1 param2 param3 ...
    foreach($tblPs as $ps){
      // Get the different fields in the current line of the exec response
      $tblInfos = explode(" ",preg_replace('/\s+/', ' ',$ps));
      // Check that this is a running taxi_share_algo process
      if($tblInfos[10] == "/opt/nomad/src/taxi_share_algo"){
        $aResult["bRunning"] = true;
        break;
      }
    }

    $logger->info(array("message"=>$aDirectories[0]." running status : " . $aResult["bRunning"]));

    // In some case process is returned as ended by ps command bu best_sol.json is still not written on disk
    // Sleep helps to be sure that best_sol is written 
    sleep(2);

    // Check for the presence of a solution
    // We consider that there can not be 2 directories with the same run id
    $logger->info(array("message"=>"Looking for " . "/var/www/data/instance/".$aDirectories[0]."/best_sol.json"));
    if(file_exists("/var/www/data/instance/".$aDirectories[0]."/best_sol.json")){
      $aResult["solution"]=json_decode(file_get_contents("/var/www/data/instance/".$aDirectories[0]."/best_sol.json"),true);
    }else{
      $logger->info(array("message"=>"/var/www/data/instance/".$aDirectories[0]."/best_sol.json Not found"));
    }

    // Check for the presence of some logs
    // We consider that there can not be 2 directories with the same run id
    if(file_exists("/var/www/data/instance/".$aDirectories[0]."/logs_out")){
      $aResult["logs"]=file_get_contents("/var/www/data/instance/".$aDirectories[0]."/logs_out");
    }
    // Check for the presence of some errors
    // We consider that there can not be 2 directories with the same run id
    if(file_exists("/var/www/data/instance/".$aDirectories[0]."/logs_err")){
      $aResult["errors"]=file_get_contents("/var/www/data/instance/".$aDirectories[0]."/logs_err");
    }    
  }
  $response->getBody()->write(json_encode($aResult));
  return $response;
});

// Catch-all route to serve a 404 Not Found page if none of the routes match
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function($req, $res) {
  $handler = $this->notFoundHandler; // handle using the default Slim page not found handler
  return $handler($req, $res);
});

$app->run();
