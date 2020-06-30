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

/**
* Class to handle query logging and circuit breaker
**/
class PDO extends \PDO
{

  //Handle to LogWriter class
  protected $log;

  //Handle to settings
  protected $config;

  /**
  * Set logger
  * @param object \OSS\LogWriter
  */
  public function setLogWriter($log){
    $this->log = $log;
  }

  /**
  * Set config
  * @param array
  */
  public function setConfig($config){
    $this->config = $config;
  }


  /**
  * Wrapper to PDO::query method
  * @param string $sql : the sql query to execute
  * @return see PDO::query
  */
  public function query($sql){

    $this->log->debug(["method"=>__METHOD__,"data"=>$sql]);

    $time_start = microtime(true);
    $result = parent::query($sql);
    $time_end = microtime(true);

    $time = $time_end - $time_start;

    if($time >= $this->config['LOG_SLOW_QUERY_DURATION']){
      $this->log->warn(array("message"=>"slow query","method"=>__METHOD__,"data"=>substr($sql,0,1024),"duration"=>$time));
    }

    return $result;
  }

  /**
  * Return the number of active connections to db server
  * @return int number of active connections
  **/
  function getNbConnections(){
    $sql = "SELECT sum(numbackends) FROM pg_stat_database";
    $result = parent::query($sql);
    $line = $result->fetch();
    return $line[0];
  }

  /**
  * This function will generate a search clause that can be append to WHERE clause.
  * In the current version the research is case insentive.
  * Example: if $aData['search'] == "a" and $aFields=["TABLE.FIELD1", "TABLE.FIELD2"] then this function will generate the
  *   following string : " AND ( TABLE.FIELD1 ILIKE %a% OR TABLE.FIELD2 ILIKE %a% ) "
  * @param string $aData : array containing a 'search' field which is the research pattern
  * @param array $aFields : array of fields, if possible include table
  * @return string : a part of WHERE clause in a SQL query
  */
  function getSearchClause($aData,$aFields){
    $sResult = "";
    if(isset($aData['search']) && $aData['search']!= null && $aData['search']!= ""){
      $sPatternQuoted = $this->quote("%".$aData['search']."%");
      $sLikes = "";
      foreach($aFields as $sField){
        if($sLikes!=""){
          $sLikes .= " OR ";
        }
        $sLikes .= " $sField ILIKE $sPatternQuoted ";
      }
      if($sLikes!=""){
        $sResult = " AND ( ".$sLikes." ) ";
      }
    }
    return $sResult;
  }

  /**
  * This function will generate a OFFSET clause.
  * @param array $aData : array with a "startIndex" item : offset in the list of results (use "" or 0 for no offset)
  * @return string : a SQL OFFSET clause
  */
  function getOffsetClause($aData){
    $sResult = "";
    if(isset($aData['startIndex']) && is_int($aData['startIndex']) && $aData['startIndex'] != 0){
      $sResult = " OFFSET ".$this->quote($aData['startIndex']). " ";
    }
    return $sResult;
  }

  /**
  * This function will generate a LIMIT clause.
  * @param array $aData : array with a "length" item :  limit in the number of results (use "" or 0 for no limits)
  * @return string : a SQL LIMIT clause
  */
  function getLimitClause($aData){
    $sResult = "";
    if(isset($aData['length']) && is_int($aData['length']) && $aData['length'] != 0){
      $sResult = " LIMIT ".$this->quote($aData['length']). " ";
    }
    return $sResult;
  }

  /**
  * This function will generate a ORDER BY clause.
  * @param aFields $aFields list of fields that will appear in the ORDER BY clause
  * @return string : a SQL ORDER BY clause
  */
  function getOrderByClause($aFields){
    $sFields = "";
    foreach($aFields as $sField){
      if($sFields!=""){
        $sFields .= ",";
      }
      $sFields .= $sField;
    }
    $sResult = "";
    if($sFields!=""){
       $sResult = " ORDER BY $sFields ";
    }
    return $sResult;
  }

  /**
  * This function will generate the SET clause of a SQL prepared request for an update.
  * Example : if the input is [':alias1'=>'FIELD1',':alias2'=>'FIELD2'] then the output will be
  *   " SET FIELD1=:alias1 , FIELD2=:alias2 "
  * @param array $aPreparedFields : list of fields that will appear in the SET clause (as alias=>field)
  * @return string : a prepared SQL SET clause
  */
  function getPreparedSetClause($aPreparedFields){
    $sFields = "";
    foreach($aPreparedFields as $sAlias=>$sField){
      if($sFields != ""){
        $sFields.=" , ";
      }
      $sFields .= " $sField=$sAlias ";
    }
    $sResult = "";
    if($sFields != ""){
      $sResult = " SET $sFields ";
    }
    return $sResult;
  }

  /**
   *  Generate a INNER JOIN SQL cause to insert in a SQL SELECT query so as to restrict access
   *    to a list of data feature some items from site_main table.
   * In order to decide whether the access to an item from site_main table is granted or not to the current
   *    user, we use user_mainsite table.
   * @param string $sUserId : current user id
   * @param string $sSuffix : suffix to append at the end of aliases (to avoid using twice an alias in a SQL query)
   * @param string $sSiteMainTableName : name of the site_main table as used in the SELECT SQL query
   * @param string $sSiteMainFieldName : name of the site_main field as used in the SELECT SQL query
   * @return string : a INNER JOIN SQL clause to insert in a SQL query
   */
  public function getAccessRestrictionClause($sUserId,$sSuffix,$sSiteMainTableName='site_main',$sSiteMainFieldName='id'){
    $sResult = "";
    if($sUserId==''){
      // Forbid any data access if user is not logged in
      $sResult = "INNER JOIN user_mainsite user_mainsite_$sSuffix ON false";
    }
    else{
      // Restrict access to site_main table based on the items found in user_mainsite table
      // This restriction does not take into account the user type (CLIENT / INSTITUTION)
      $sUserIdQuoted = $this->quote($sUserId);
      $sResult = "
        INNER JOIN site_main site_main_$sSuffix
                ON site_main_$sSuffix.id = $sSiteMainTableName.$sSiteMainFieldName
               AND site_main_$sSuffix.rec_st<>'D'
        INNER JOIN user_mainsite user_mainsite_$sSuffix
                ON site_main_$sSuffix.id = user_mainsite_$sSuffix.site_main_id
               AND user_mainsite_$sSuffix.rec_st<>'D'
               AND user_mainsite_$sSuffix.user_main_id = $sUserIdQuoted
        INNER JOIN user_main user_main_$sSuffix
                ON user_main_$sSuffix.id = user_mainsite_$sSuffix.user_main_id
               AND user_main_$sSuffix.rec_st <> 'D'
        INNER JOIN util_thesaurus th_user_main_status_$sSuffix
                ON th_user_main_status_$sSuffix.id=user_main_$sSuffix.status_th
               AND th_user_main_status_$sSuffix.code<>'DISABLED'";
    }
    return $sResult;
  }
}