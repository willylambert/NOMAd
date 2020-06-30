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

namespace OSS\Ctrl;

use OSS\BaseObject;

/**
 * Audit trail : keep a trace of most changes in database.
 *
 * HOW TO USE :
 *
 * for a data INSERT :
 *  - after the call to data insert function, call afterDataInsert
 * for a data UPDATE :
 *  - before the call to data update function, call getRecordData so as to get a copy of the data before update
 *  - store the data returned by getRecordData in a temporary variable
 *  - after the call to data update function, call afterDataUpdate with the temporary variable as the 2nd parameter
 * for a data DELETE :
 *  - before the call to data insert function, call beforeDataDelete
 * for a data MARK AS REMOVED
 *  - after the call to markAsRemoved function, call afterMarkAsRemoved
 */
class AuditTrailCtrl extends BaseObject{

  /**
  * Get the all the fields for a specific record in the asked table
  * @param string $sRecordId : id of the record to be retrieved
  * @param string $sTableName : name of the table in which the row has to be retrieved
  * @return array : data concerning the target record
  */
  public function getRecordData($sRecordId,$sTableName){
    $oAuditTrailDAO = new \OSS\Model\AuditTrailDAO();
    return $oAuditTrailDAO->getRecordData($sRecordId,$sTableName);
  }

  /**
  * Function that will compare two objects, the old and the new version.
  * Both objects are stored in arrays, that are supposed to be obtained using AuditTrailCtrl::getRecordData function.
  * The function is recursive, so that it can handle subfields of array type in the objects to compare.
  * The returned values is a list of fields for which a difference has been detected
  * @param array $aOld : old version of the object
  * @param array $aNew : new version of the object
  * @param integer $iLevel : recursion level (0 by default)
  **/
  public static function compare($aOld,$aNew,$iLevel = 0){
    $aResult = array();
    foreach($aOld as $key=>$value){
      if(is_array($aOld["$key"])){
        // Case of a field of array type, we have to compare it recursively
        if(isset($aNew["$key"])){
          $aSubResult = AuditTrailCtrl::compare($aOld["$key"],$aNew["$key"],$iLevel+1);
          if(count($aSubResult)>0){
            $aResult["$key"] = $aSubResult;
          }
        }
      }
      else {
        // Case of a field that is not of array type : we can check the difference by using = operator
        if(isset($aNew["$key"]) && $aOld["$key"]!=$aNew["$key"]) {
          $aResult["$key"] = $aNew["$key"];
        }
      }
    }
    return $aResult;
  }

  /**
   * Function to be called after any update on the input data, it will keep audit trail up-to-date
   * @param string $sRecordId : id of the update record
   * @param array $aOldData : data as found before record update
   * @param string $sTableName : name for the concerned table in database
   * @return boolean : true in case of success
   */
  public function afterDataUpdate($sRecordId,$aOldData,$sTableName){
    $oAuditTrailDAO = new \OSS\Model\AuditTrailDAO();
    $aNewData = $oAuditTrailDAO->getRecordData($sRecordId,$sTableName);
    $aDifferences = $this->compare($aOldData,$aNewData);
    $aAuditTrailItems = array();
    foreach($aDifferences as $key=>$value){
      $aAuditTrailItems[]=array(
        'table_name'=>$sTableName,
        'column_name'=>$key,
        'record_id'=>$sRecordId,
        'event_code'=>'U',
        'column_value'=>$value
      );
    }
    // Perform several audit trail insertions in the same call for more efficiency
    return $this->add($aAuditTrailItems);
  }

  /**
   * Function to be called after marking input data as removed, it will keep audit trail up-to-date
   * This function is a shortcut to avoid using the more complex afterDataUpdate function
   * @param string $sRecordId : id of the update record
   * @param string $sTableName : name for the concerned table in database
   * @return boolean : true in case of success
   */
  public function afterMarkAsRemoved($sRecordId,$sTableName){
    return $this->add(array(array(
      'table_name'=>$sTableName,
      'column_name'=>'REC_ST',
      'record_id'=>$sRecordId,
      'event_code'=>'U',
      'column_value'=>'D'
    )));
  }

  /**
   * Function to be called after any insert of an input data, it will keep audit trail up-to-date
   * @param string $sRecordId : identifier for the record that was inserted
   * @param string $sTableName : name for the concerned table in database
   * @return boolean : true in case of success
   */
  public function afterDataInsert($sRecordId,$sTableName){
    $oAuditTrailDAO = new \OSS\Model\AuditTrailDAO();
    $aNewData = $oAuditTrailDAO->getRecordData($sRecordId,$sTableName);
    $aAuditTrailItems = array();
    foreach($aNewData as $key=>$value){
      $aAuditTrailItems[]=array(
        'table_name'=>$sTableName,
        'column_name'=>$key,
        'record_id'=>$sRecordId,
        'event_code'=>'C',
        'column_value'=>$value
      );
    }
    // Perform several audit trail insertions in the same call for more efficiency
    return $this->add($aAuditTrailItems);
  }

  /**
   * Function to be called before any deletion of an input data, it will keep audit trail up-to-date
   * @param string $sRecordId : identifier for the record that was deleted
   * @param string $sTableName : name for the concerned table in database
   * @return boolean : true in case of success
   */
  public function beforeDataDelete($sRecordId,$sTableName){
    $oAuditTrailDAO = new \OSS\Model\AuditTrailDAO();
    $aDeletedData = $oAuditTrailDAO->getRecordData($sRecordId,$sTableName);
    $aAuditTrailItems = array();
    foreach($aDeletedData as $key=>$value){
      $aAuditTrailItems[]=array(
        'table_name'=>$sTableName,
        'column_name'=>$key,
        'record_id'=>$sRecordId,
        'event_code'=>'D',
        'column_value'=>""
      );
    }
    // Perform several audit trail insertions in the same call for more efficiency
    return $this->add($aAuditTrailItems);
  }

  /**
   * Insert some new items in the audit trail.
   * For more efficiency, this function will insert several audit trail items in the same time.
   * Input data is an array of items to be inserted into the audit trail
   * Each item must have the following fields : table_name,column_name,record_id,event_code,column_value
   * @param array $aData: array of items to be inserted in audit trail
   * @return boolean : true in case of success
   */
  public function add($aData){
    foreach($aData as &$aItem){
      $aItem['dt']=time();
      $aItem['user_main_id']=$this->getSessionUserId();
    }
    $oAuditTrailDAO = new \OSS\Model\AuditTrailDAO();
    return $oAuditTrailDAO->add($aData);
  }
}