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

class BaseObject{

  protected static $log;
  protected static $db;
  protected static $config;
  protected static $sessionUserId;
  protected static $sessionUserType;
  protected static $sessionData;

  protected $restResult;

  // Count the number of access restriction clauses that were generated in the same instance
  protected $iAccessRestrictionClauseCounter;

  /**
  * Constructor
  * @param optional boolean $bNeedDBAccess - set to true if child class need access to database. default value : false
  **/
  function __construct($bNeedDBAccess=false){
    if(self::$log==null){
      self::$log = new LogWriter();
    }

    $tblConfig = include('/var/www/config/config-default.inc.php');
    $this::$config = $tblConfig;

    // PDO Instance - initialised with current schema stored in user session
    if($bNeedDBAccess && self::$db==null){
      self::$db = new \OSS\Db($this->config("DB_DEFAULT_SCHEMA"));
    }

    // This counter helps generating SQL access restriction clauses that uses different table aliases.
    $this->iAccessRestrictionClauseCounter =0;

    $this->saveResult = new CrudSaveResult();
  }

  /**
  * helper function for child class to get configuration
  * @param $param : configuration parameter to retrieve
  * @return array
  **/
  function config($param){
    return self::$config[$param];
  }

  /**
  * helper function for child class to get db instance
  * @return \OSS\Db
  **/
  function db(){
    return self::$db->pdo;
  }

  /**
   * Helper function to start a transaction
   * Could be called from Controller
   */
  function beginTransaction(){
    self::$db->pdo->beginTransaction();
  }

   /**
   * Helper function to commit a transaction
   * Could be called from Controller
   */
  function commitTransaction(){
    self::$db->pdo->commit();
  }

  /**
  * helper function for child class to get logger instance
  * @return \OSS\Db
  **/
  function log(){
    return self::$log;
  }

  /**
  * Set Session User Id for all child instance
  **/
  function setSessionUserId($userId){
    self::$log->setUserId($userId);
    self::$sessionUserId = $userId;
  }

  /**
   * Set Session User type for all child instance
   */
  function setSessionUserType($userType){
    self::$sessionUserType = $userType;
  }

  /**
  * Set Session Data for all child instance
  **/
  function setSessionData($sessionData){
    self::$sessionData = $sessionData;
  }

  /**
  * Get Session User Id for all child instance
  **/
  function getSessionUserId(){
    return self::$sessionUserId;
  }

  /**
  * Get Session User type for all child instance
  **/
  function getSessionUserType(){
    return self::$sessionUserType;
  }

  /**
  * Get Session Data for all child instance
  **/
  function getSessionData(){
    return self::$sessionData;
  }

  /**
   * Tell whether current user is admin or not
   */
  function isAdmin(){
    return self::$sessionUserType == 'ADMIN';
  }

  /**
  * Set save call REST to success
  **/
  function setResult($result){
    $this->restResult = new CrudSaveResult();
    $this->restResult->setData($result);
  }

  /**
  * Get the result of the rest service
  **/
  public function getResult() {
    return json_encode($this->restResult);
  }

  /**
  * get variable as text for debugging
  **/
  static function dumpRet($mixed = null) {
    ob_start();
    var_dump($mixed);
    $content = ob_get_contents();
    ob_end_clean();
    return $content;
  }

  /**
  * Compare two input objects, assuming that both input objects to compare contain an id field of string type
  * @param array $aObject1 : must contain an id string field
  * @param array $aObject2 : must contain an id string field
  * @return integer : 0 if equal, 1 or -1 otherwise
  */
  public function compareAOIs($aObject1,$aObject2){
    return strcmp($aObject1['id'],$aObject2['id']);
  }

  /**
   * Compute the difference between 2 arrays using id field for comparison
   * @param array $array1 : first array to compare
   * @param array $array2 : second array to compare
   * @return array difference between $array1 and $array2
   */
  public function diffOnID($array1,$array2){
    return array_udiff($array1,$array2,array($this,'compareAOIs'));
  }

  /**
   * Generate a suffix string to append after the alias of a SQL table.
   * @return string : a suffix string.
   */
  public function getAccessRestrictionSuffix(){
    $sSuffix = "access";
    if($this->iAccessRestrictionClauseCounter>1){
      $sSuffix .= "_".$this->iAccessRestrictionClauseCounter;
    }
    return $sSuffix;
  }

  /**
   *  Generate a INNER JOIN SQL cause to insert in a SQL SELECT query so as to restrict access
   *    to a list of data feature some items from site_main table.
   * In order to decide whether the access to an item from site_main table is granted or not to the current
   *    user, we use user_mainsite table.
   * @param string $sSiteMainTableName : name of the site_main table as used in the SELECT SQL query
   * @param string $sSiteMainFieldName : name of the site_main field as used in the SELECT SQL query
   * @return string : a INNER JOIN SQL clause to insert in a SQL query
   */
  public function getAccessRestrictionClause($sSiteMainTableName='site_main',$sSiteMainFieldName='id'){
    $sResult = "";
    // There are no restrictions for admin user.
    if(!$this->isAdmin()){
      $this->iAccessRestrictionClauseCounter++;
      $sResult = $this->db()->getAccessRestrictionClause(
        $this->getSessionUserId(),
        $this->getAccessRestrictionSuffix(),
        $sSiteMainTableName,
        $sSiteMainFieldName
      );
    }
    return $sResult;
  }

  /**
   * When requesting a list of objects, compare the list obtained with restrictions to the list obtained
   *   without restrictions.
   * The output list contains items that are identical when listing with or without restrictions.
   * This function gets useful when some of the listed objects may be only partially restricted : they are
   *   declared totally restricted.
   * Example : a group of demands contains a list of demands : if some demands are unreachable, the whole
   *   group of demands is declared unreachable.
   * The second parameter is a DAO function listing objects, it must take 2 input parameters :
   *   - an array input parameter, which value is brought by the $aFunctionData third argument
   *   - a boolean input parameter indicating whether we list with or without restrictions
   * @param object $oDAO : an instance from the concerned DAO
   * @param string $sFunctionName : name of a function listing objects in the concerned DAO
   * @param array $aFunctionData : data to be injected in the $sFunctionName first parameter
   * @return array : a list of objects for which access is totally enabled
   */
  public function listWithRestrictions($oDAO,$sFunctionName,$aFunctionData){
    $aResult = array();
    if($this->isAdmin()){
      // In case of a admin user, no need to check access rights, so we use the quickest way
      $aResult = call_user_func_array(array($oDAO,$sFunctionName),array($aFunctionData,false));
    }
    else{
      $aResult = call_user_func_array(array($oDAO,$sFunctionName),array($aFunctionData,true));
    }
    return $aResult;
  }

  /**
   * When requesting an object, compare the object obtained with restrictions to the object obtained
   *   without restrictions. If there are some difference, an empty array will be returned
   * The second parameter is a DAO function listing objects, it must take 2 input parameters :
   *   - an array input parameter, which value is brought by the $aFunctionData third argument
   *   - a boolean input parameter indicating whether we list with or without restrictions
   * Example :
   *   When requesting a group, the access to some transport demands involved by the group may be restricted
   *   Trying to get the group with restrictions will provide the group with a list of demands from which restricted
   *     demands were removed, which is not the expected behavior. Instead, we want the whole group to be declared as
   *     restricted.
   *   Comparing the group obtained without restrictions with the group obtained with restrictions will indicate
   *     wheter the group is restricted or not
   * @param object $oDAO : an instance from the concerned DAO
   * @param string $sFunctionName : name of a function listing objects in the concerned DAO
   * @param array $aFunctionData : data to be injected in the $sFunctionName first parameter
   * @return array : an object for which no access restrictions were detected
   */
  public function getWithRestrictions($oDAO,$sFunctionName,$aFunctionData){
    $aResult = array();
    if($this->isAdmin()){
      // In case of a admin user, no need to check access rights, so we use the quickest way
      $aResult = call_user_func_array(array($oDAO,$sFunctionName),array($aFunctionData,false));
    }
    else{
      // The behavior described above may be hard to achieve in just one SQL query. Instead we propose
      //   the following (costing 2 SQL queries instead of one)
      //  1) get the object with access restrictions
      //  2) get the object without access restrictions
      //  3) compare the 2 objects : If 2 fields are different, the access to the item may not be enabled
      $aItemWithRestrictions = call_user_func_array(array($oDAO,$sFunctionName),array($aFunctionData,true));
      $aItemWithoutRestrictions = call_user_func_array(array($oDAO,$sFunctionName),array($aFunctionData,false));
      // Check the difference by checking every fields
      $bAccessEnabled = true;
      foreach($aItemWithRestrictions as $key=>$value){
        // Ignore fields that are not present in the non restricted version
        if(isset($aItemWithoutRestrictions[$key])){
          if(is_array($value)){
            // For fields of array type, the comparison will not be recursive, be only compare the counts
            if(count($aItemWithRestrictions[$key]) != count($aItemWithoutRestrictions[$key]) ){
              $bAccessEnabled = false;
              break;
            }
          }
          else{
            if($aItemWithRestrictions[$key] != $aItemWithoutRestrictions[$key]){
              $bAccessEnabled = false;
              break;
            }
          }
        }
      }
      if($bAccessEnabled){
        $aResult=$aItemWithoutRestrictions;
      }
    }
    return $aResult;
  }

  /**
   * Default get function. Should be overwritten in subclasses.
   * This function enables to check the access to the undelying object in inheriting DAOs
   * Notice that this method signature can be overriden in child classes as long as the parameters that are
   *   present only in child classes have a default value, for instance get($param1,$param2="defaultvalue")
   * @param string $id : an object id
   * @return array : empty array, behavior to be redefined in subclasses
   */
  public function get($id){
    return array();
  }

  /**
   * Test access to the object which id is passed in the input parameter
   * This function makes the assumption that if the object targeted by the input id is available, then
   *   the get method will return an array with an id field.
   * This function is typically expected to be located in DAOs
   * A call to this function is likely to cost a SQL request, please do not use in a large loop.
   * @param string $id : object id, makes sense according to the actual subclass calling hasAccess function
   * @return boolean : true if the input $id can give access to an array with an id field
   */
  public function hasAccess($id){
    $aObject = $this->get($id);
    return isset($aObject["id"]);
  }

  /**
  * @desc Try to call asked hook, if defined
  * @param string $methodName calling method name
  * @param string $hookName
  * @param array $tblParam array of paramaters passed to hook function
  **/
  protected function callHook($methodName,$hookName,$tblParam){
    $tblClassName = explode("\\",get_class($this));
    $functionName = end($tblClassName)."_".$methodName."_".$hookName;
    if(function_exists($functionName) && $this->config('CUSTOM')){
      $tblParam[] = $this;
      return call_user_func_array($functionName,$tblParam);
    }else{
      return false;
    }
  }


}