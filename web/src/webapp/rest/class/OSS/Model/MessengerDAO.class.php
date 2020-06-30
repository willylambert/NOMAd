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
 *  Class to handle DB access for Messengers (Points of Interest)
 *  @creationdate 2019-oct-11
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

/**
* Class for handling requests to the Messenger table in the database.
*/
class MessengerDAO extends BaseObject{

  /**
  * Constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of Messengers based on search criteria.
  * The input data array is expected to contain the following fields : ...
  * @param array $aData : filtering data
  * @return array({object}) : array of Messenger object
  **/
  public function list($aData){
    $sSQL = "SELECT
                   hr_messenger.id,
                   hr_messenger.content,
                   hr_messenger.dt,
                   hr_messenger.phonenumber,
                   hr_messenger.hr_main_id,
                   hr_messenger.rec_st
              FROM hr_messenger
             WHERE hr_messenger.rec_st<>'D'                  
          ORDER BY hr_messenger.dt";
    $oQuery = $this->db()->query($sSQL);
    return $oQuery->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Get some details about an Messenger
  * @param string $sMessengerID : Messenger identifier
  * @return array with the following fields : ...
  */
  public function get($sMessengerID){
    $sMessengerIDQuoted = $this->db()->quote($sMessengerID);
    $sSQL = "SELECT
                   hr_messenger.id,
                   hr_messenger.content,
                   hr_messenger.dt,
                   hr_messenger.phonenumber,
                   hr_messenger.hr_main_id,
                   hr_messenger.rec_st
              FROM hr_messenger
             WHERE hr_messenger.id = $sMessengerIDQuoted ";
    $oQuery = $this->db()->query($sSQL);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Add a new Messenger
  * @param array $aData : data of the Messenger to be added.
  * @return array created messenger with an id field
  */
  public function add($aData){
    if(!isset($aData['phonenumber'])){
      $aData['phonenumber']=NULL;
    }
    if(!isset($aData['hr_main_id'])){
      $aData['hr_main_id']=NULL;
    }
    $sSQL = "INSERT INTO hr_messenger (content,phonenumber,dt,hr_main_id)
              VALUES (:content,:phonenumber,:dt,:hr_main_id)
              RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
      ':content'=>$aData['content'],
      ':phonenumber'=>$aData['phonenumber'],
      ':dt'=>$aData['dt'],
      ':hr_main_id'=>$aData['hr_main_id']
    ));
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a Messenger
  * @param array $aData : data of the Messenger to be updated.
  * @return boolean : true if the update succeeded
  */
  public function update($aData){
    if(!isset($aData['phonenumber'])){
      $aData['phonenumber']=NULL;
    }
    if(!isset($aData['hr_main_id'])){
      $aData['hr_main_id']=NULL;
    }
    // Encode geometry again before saving
    $aData["geom"]=json_encode($aData["geom"]);
    $sSQL = "UPDATE hr_messenger
                SET
                   content=:content,
                   phonenumber=:phonenumber,
                   dt=:dt,
                   hr_main_id=:hr_main_id    
              WHERE id=" . $this->db()->quote($aData['id']);
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute(array(
        ':content'=>$aData['content'],
        ':phonenumber'=>$aData['phonenumber'],
        ':dt'=>$aData['dt'],
        ':hr_main_id'=>$aData['hr_main_id']
    ));
    return true;
  }

  /**
  * Mark a Messenger as removed
  * @param string $sMessengerID : id of the Messenger to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sMessengerID){
    $query = "UPDATE hr_messenger SET rec_st='D' WHERE id=" . $this->db()->quote($sMessengerID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a Messenger.
  * @param string $sMessengerID : id of the Messenger to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sMessengerID){
    $query = "DELETE FROM hr_messenger WHERE id=" . $this->db()->quote($sMessengerID);
    return $this->db()->exec($query);
  }

}
