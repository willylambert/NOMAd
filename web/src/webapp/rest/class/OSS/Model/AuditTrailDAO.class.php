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
 *  Class to handle DB access for Audit trail
 *  @creationdate 2018-09-24
 **/

namespace OSS\Model;

use PDO;

use OSS\BaseObject;

class AuditTrailDAO extends BaseObject{

  /**
  * default constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get the all the fields for a specific record in the asked table
  * @param string $sRecordId : id of the record to be retrieved
  * @param string $sTableName : name of the table in which the row has to be retrieved
  * @return array : data concerning the target record
  */
  public function getRecordData($sRecordId,$sTableName){
    $sSQL = "SELECT * FROM $sTableName WHERE id=".$this->db()->quote($sRecordId);
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }

  /**
   * Check data for insertion in audit trail, assuming several items will be inserted in the audit trail in the same time.
   * Input data is an array of items to be inserted into the audit trail
   * Each item must have the following fields : table_name,column_name,record_id,event_code,column_value,dt,user_main_id
   * @param array $aData: array of items to be inserted in audit trail
   * @return boolean : true in case of success
   */
  public function checkParams($aData){
    $bResult = true;
    foreach($aData as &$aItem){
      // Check for the presence of all expected fields in the current audit trail item
      foreach(array('table_name','column_name','record_id','event_code','column_value','dt','user_main_id') as $sFieldName){
        if(!array_key_exists($sFieldName,$aItem)){
          $this->log()->warn([
            "method"=>__METHOD__,
            "data"=>$aItem,
            "message"=>"Can not find $sFieldName when writing the audit trail"
          ]);
          $bResult = false;
          break;
        }
      }
      // If some fields are missing in the current audit trail, then we abort all checks.
      if($bResult==false){
        break;
      }
    }
    return $bResult;
  }

  /**
   * Insert some new items in the audit trail.
   * For more efficiency, this function will insert several audit trail items in the same time.
   * Input data is an array of items to be inserted into the audit trail
   * Each item must have the following fields : table_name,column_name,record_id,event_code,column_value,dt,user_main_id
   * @param array $aData: array of items to be inserted in audit trail
   * @return boolean : true in case of success
   */
  public function add($aData){
    $bResult = false;
    if($this->checkParams($aData)){
      // Prepare a SQL query for several INSERT in one SQL call
      $sValues = '';
      $aValues = array();
      for($i=0; $i<count($aData);$i++){
        if($sValues != ""){
          $sValues.=',';
        }
        $sValues.="(:table_name$i,:column_name$i,:record_id$i,:event_code$i,:column_value$i,:dt$i,:user_main_id$i)";
        $aValues=array_merge($aValues,array(
          ":table_name$i"=> $aData[$i]['table_name'],
          ":column_name$i"=> $aData[$i]['column_name'],
          ":record_id$i"=> $aData[$i]['record_id'],
          ":event_code$i"=> $aData[$i]['event_code'],
          ":column_value$i"=> json_encode($aData[$i]['column_value']),
          ":dt$i"=> $aData[$i]['dt'],
          ":user_main_id$i"=> $aData[$i]['user_main_id']
        ));
      }
      if($sValues != ""){
        $sSQL = "INSERT INTO audit_trail (table_name,column_name,record_id,event_code,column_value,dt,user_main_id)
                      VALUES $sValues";
        $oQuery = $this->db()->prepare($sSQL);
        $bResult = $oQuery->execute($aValues);
      }
      else{
        // There is no value to insert in the audit trail, which may happen
        $bResult = true;
      }
    }
    return $bResult;
  }

}