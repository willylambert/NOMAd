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
 *  Access class to Postgres Database
 **/

namespace OSS;

use PDO;
use PDOException;

class Db extends \OSS\BaseObject{

  public $pdo;

  /**
   * Constructor : by default connect to the reference database
   * @param boolean $bAutoOpen : open db from constructor
  * @param string schema to selected
  * @param optional string dbhost
  * @param optional string dbport
  * @param optional string dbname
  * @param optional string dbuser
  * @param optional string dbpasswd
   **/
  function __construct($schema,$bAutoOpen=true,$dbhost="",$dbport="",$dbname="",$dbuser="",$dbpasswd=""){

    if($bAutoOpen){
      $this->open($schema,$dbhost,$dbport,$dbname,$dbuser,$dbpasswd);
    }
  }

  /**
  * Open database and select the schema $scenario
  * @param string scenario schema to selected
  * @param optional string dbhost
  * @param optional string dbport
  * @param optional string dbname
  * @param optional string dbuser
  * @param optional string dbpasswd
  **/
  function open($schema,$dbhost="",$dbport="",$dbname="",$dbuser="",$dbpasswd=""){
    if($dbhost==""){
      $dbhost = $this->config('DB_HOST');
    }

    if($dbport==""){
      $dbport = $this->config('DB_PORT');
    }

    if($dbname==""){
      $dbname = $this->config('DB_NAME');
    }

    if($dbuser==""){
      $dbuser = $this->config('DB_USER');
    }

    if($dbpasswd==""){
      $dbpasswd = $this->config('DB_PASSWD');
    }

    $conStr = "pgsql:host=".$dbhost.";port=".$dbport.";dbname=".$dbname;

    // Make sure db is closed
    $this->pdo = null;

    // Open DB
    $this->pdo = new \OSS\PDO($conStr,$dbuser,$dbpasswd);
    $this->pdo->setLogWriter($this::$log);
    $this->pdo->setConfig($this::$config);

    $this->pdo->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_EXCEPTION);

    // Select Schema
    $this->pdo->exec("SET search_path TO $schema,public;");
  }

  /**
   * close PDO connection
   */
  function close(){
    unset($this->pdo);
  }

}