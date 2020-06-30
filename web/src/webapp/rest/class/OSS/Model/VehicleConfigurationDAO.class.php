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
 *  Class to handle DB access for vehicle configuration
 **/
namespace OSS\Model;

use PDO;

class VehicleConfigurationDAO extends \OSS\BaseObject{

  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of vehicle configuration
  * @param array $filters : an array of filters
  * @return array of vehicle configurations
  **/
  public function list($filters){
    $sVehicleCategoryIdClause = "";
    if(isset($filters['vehicleCategoryId']) && $filters['vehicleCategoryId']!= null && $filters['vehicleCategoryId']!= ""){
      $sVehicleCategoryIdQuoted = $this->db()->quote($filters['vehicleCategoryId']);
      $sVehicleCategoryIdClause = " WHERE (vehicle_category_id = $sVehicleCategoryIdQuoted ) ";
    }
    $sSql = "SELECT
              id,
              code,
              label,
              vehicle_category_id
              rec_st
            FROM vehicle_configuration
            $sVehicleCategoryIdClause";
    $result = $this->db()->query($sSql);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Add a vehicle configuration
  * @param array $aData : data of the vehicle configuration to be inserted.
  * @return array created site with an id field
  */
  public function add($aData){
    $aReplacement = array(
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':vehicle_category_id'=>$aData['vehicle_category_id'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "INSERT INTO vehicle_configuration (
                           code,
                           label,
                           vehicle_category_id,
                           rec_st )
                  VALUES (
                           :code,
                           :label,
                           :vehicle_category_id,
                           :rec_st )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute($aReplacement);
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Vehicle configuration with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a vehicle configuration
  * @param array $aData : data of the vehicle configuration to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "UPDATE vehicle_configuration
                SET
                    code=:code,
                    label=:label,
                    rec_st=:rec_st
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    $bResult=false;
    try{
      $bResult= $oQuery->execute($aReplacement);
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Vehicle configuration with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $bResult;
  }

  /**
  * Mark a vehicle configuration as removed
  * @param string $sVehicleConfigurationID : id of the vehicle configuration to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sVehicleConfigurationID){
    $query = "UPDATE vehicle_configuration SET rec_st='D' WHERE id=" . $this->db()->quote($sVehicleConfigurationID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a vehicle configuration.
  * @param string $sVehicleConfigurationID : id of the vehicle configuration to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sVehicleConfigurationID){
    $query = "DELETE FROM vehicle_configuration WHERE id=" . $this->db()->quote($sVehicleConfigurationID);
    return $this->db()->exec($query);
  }

  /**
  * Get a list of vehicle capacities
  * @param array $filters : an array of filters
  * @return array of vehicle capacities
  **/
  public function listCapacities($filters){
    $sVehicleConfigurationIdClause = "";
    if(isset($filters['vehicleConfigurationId']) && $filters['vehicleConfigurationId']!= null && $filters['vehicleConfigurationId']!= ""){
      $sVehicleConfigurationIdQuoted = $this->db()->quote($filters['vehicleConfigurationId']);
      $sVehicleConfigurationIdClause = " WHERE (vehicle_configuration_id = $sVehicleConfigurationIdQuoted ) ";
    }
    $sSql = "SELECT
              id,
              vehicle_configuration_id,
              quantity,
              unit_th,
              transported_th,
              rec_st
            FROM vehicle_capacity
            $sVehicleConfigurationIdClause";
    $result = $this->db()->query($sSql);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Add a vehicle capacity
  * @param array $aData : data of the vehicle capacity to be inserted.
  * @return array created site with an id field
  */
  public function addCapacity($aData){
    $aReplacement = array(
      ':transported_code'=>$aData['transported_code'],
      ':quantity'=>$aData['quantity'],
      ':vehicle_configuration_id'=>$aData['vehicle_configuration_id'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "INSERT INTO vehicle_capacity (
                           vehicle_configuration_id,
                           quantity,
                           unit_th,
                           transported_th,
                           rec_st )
                  VALUES (
                           :vehicle_configuration_id,
                           :quantity,
                           ( SELECT id FROM util_thesaurus WHERE cat='VEHICLE_CAPACITY_UNIT' AND code='CHILD' ),
                           ( SELECT id FROM util_thesaurus WHERE cat='VEHICLE_CAPACITY_TRANSPORTED' AND code=:transported_code ),
                           :rec_st )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    $oQuery->execute($aReplacement);
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a vehicle capacity
  * @param array $aData : data of the vehicle capacity to be updated.
  * @return boolean : true in case of success
  */
  public function updateCapacity($aData){
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':quantity'=>$aData['quantity'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "UPDATE vehicle_capacity
                SET
                    quantity=:quantity,
                    rec_st=:rec_st
              WHERE id=:id";
    $oQuery = $this->db()->prepare($sSQL);
    return $oQuery->execute($aReplacement);
  }

  /**
  * Mark a vehicle capacity as removed
  * @param string $sVehicleCapacityID : id of the vehicle capacity to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markCapacityAsRemoved($sVehicleCapacityID){
    $query = "UPDATE vehicle_capacity SET rec_st='D' WHERE id=" . $this->db()->quote($sVehicleCapacityID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a vehicle capacity.
  * @param string $sVehicleCapacityID : id of the vehicle capacity to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function deleteCapacity($sVehicleCapacityID){
    $bResult = false;
    if($this->isAdmin()){  
      $query = "DELETE FROM vehicle_capacity WHERE id=" . $this->db()->quote($sVehicleCapacityID);
      $bResult = $this->db()->exec($query);
    }
    return $bResult;
  }
}