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

namespace OSS;

use Gelf\Transport\UdpTransport;
use Gelf\Publisher;
use Gelf\Message;

class LogWriter{

  protected $logFile,$logLevel,$userId;
  protected static $config;
  protected static $requestId;

  function __construct(){

    $tblConfig = include('/var/www/config/config.inc.php');
    $this::$config = $tblConfig;

    if($this::$requestId==null){
      $this::$requestId = substr(uniqid(),5);
    }
    $this->requestUri = $_SERVER["REQUEST_URI"];

    //Create log file if needed
    if(!file_exists($this->config('LOG')['FILE'])){
      touch($this->config('LOG')['FILE']);
    }

    //Disable log to file if we can't write into it
    if(!is_writable($this->config('LOG')['FILE'])){
      $this->logFile = "";
    }else{
      $this->logFile = $this->config('LOG')['FILE'];
    }

    $this->logLevel = $this->config('LOG')['LEVEL'];
  }

  /**
  * helper function for child class to get configuration
  * @param $param : configuration parameter to retrieve
  * @return array
  **/
  function config($param){
    return self::$config[$param];
  }

  public function error($message){
    if($this->logLevel>=4){
      $this->write($message,4);
    }
  }

  public function warn($message){
    if($this->logLevel>=5){
      $this->write($message,5);
    }
  }

  public function notice($message){
    if($this->logLevel>=6){
      $this->write($message,6);
    }
  }

  public function info($message){
    if($this->logLevel>=7){
      $this->write($message,7);
    }
  }

  public function debug($message){
    if($this->logLevel>=8){
      $this->write($message,8);
    }
  }

  /**
  * @param mixed $message : array or string. String are allowed during transition period from file logging to graylog
  * if array allowed fields are "method","data","query"
  * @param int $level From 1 (Emergency) to 7 (Info) Full list : EMERGENCY,ALERT,CRITICAL,ERROR,WARN,NOTICE,INFO
  **/
  public function write($message,$level){

    //if we don't have message, fill it anyway
    if(is_array($message) && !isset($message['message'])){
      $message['message'] = "";
    }

    if(!isset($message["data"])){
      $message["data"] = "";
    }

    if(!isset($message["method"])){
      $message["method"] = "";
    }

    //We need a message - if not, we have nothing to log
    if(is_string($message) && $message!="" || is_array($message) && isset($message['message'])){

      $timeOffset = microtime(true) - $_SERVER['REQUEST_TIME'];

      if($this->config('LOG')['TO_FILE'] && $this->logFile!=""){

        $fileMessage = "";

        if(!is_array($message)){
          $fileMessage = $message;
        }else{
          $fileMessage = $message["method"] . " " . $message["message"];
          if(is_array($message["data"])){
            // array fields are converted into readable strings
            $fileMessage.=" ".json_encode($message["data"]);
          }else{
            $fileMessage.=" ".$message["data"];
          }
        }

        $dt = date('c') . " " . substr($timeOffset,0,4) . " " . $this::$requestId;
        error_log("$dt " . $fileMessage . "\n",3,$this->logFile);
      }
    }
  }
}