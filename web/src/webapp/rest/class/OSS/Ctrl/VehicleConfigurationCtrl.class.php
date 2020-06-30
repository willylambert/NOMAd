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
 *  Service REST for vehicle configurations
 **/
namespace OSS\Ctrl;

class VehicleConfigurationCtrl extends \OSS\BaseObject{

  /**
  * Get a list of vehicle configurations based on search criteria
  * The input data array is expected to contain the following field : vehicleCategoryId
  * @param array $aData : filtering data
  * @return array({object}) : array of Vehicle Configuration object
  **/
  public function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $aConfigurations = $oVehicleConfigurationDAO->list($aData);
    $this->setResult($aConfigurations);
    return $aConfigurations;
  }

  /**
  * Add a vehicle configuration
  * @param array $aData : data of the vehicle configuration to be added.
  * @return array : new vehicle configuration with id field
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $aNewConfiguration = $oVehicleConfigurationDAO->add($aData);
    if(isset($aNewConfiguration['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewConfiguration['id'],'vehicle_configuration');
      // Handle the insertion for the new capacities
      if(isset($aData['capacities'])){
        foreach($aData['capacities'] as $aCapacity){
          $aCapacity['vehicle_configuration_id']=$aNewConfiguration['id'];
          $this->addCapacity($aCapacity);
        }
      }
    }
    else{
      throw new \OSS\AppException(
        "Vehicle configuration insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewConfiguration);
    return $aNewConfiguration;
  }

  /**
  * Update a vehicle configuration
  * @param array $aData : data of the vehicle configuration to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'vehicle_configuration');
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $bResult = $oVehicleConfigurationDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'vehicle_configuration');
      // Handle the update for the list of existing capacities
      if(isset($aData['capacities'])){
        foreach($aData['capacities'] as &$aCapacity){
          $aCapacity['vehicle_configuration_id']=$aData['id'];
        }
        $bResult &= $this->updateCapacitiesByVehicleConfiguration($aData['capacities'],$aData['id']);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Update all the vehicle configurations over a vehicle category
   * @param array $aConfigurations : the updated vehicle configurations
   * @param string $sVehicleCategoryID : the concerned vehicle category id
   * @return boolean : true if the update succeeded
   */
  public function updateByVehicleCategory($aConfigurations,$sVehicleCategoryID){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aConfigurations,$sVehicleCategoryID)]);
    $bResult = true;
    // Get the list of existing vehicle configurations for the current vehicle category, for comparison
    $aOldConfigurations = $this->list(array('vehicleCategoryId'=>$sVehicleCategoryID));
    foreach($aOldConfigurations as $aOldConfiguration){
      $bOldConfigurationFound = false;
      foreach($aConfigurations as $aConfiguration){
        if(isset($aConfiguration['id']) && $aConfiguration['id'] == $aOldConfiguration['id']){
          // Handle an updated vehicle configuration
          $bResult &= $this->update($aConfiguration);
          $bOldConfigurationFound = true;
          break;
        }
      }
      if(!$bOldConfigurationFound){
        // Handle a deleted vehicle configuration
        $bResult &= $this->markAsRemoved($aOldConfiguration['id']);
      }
    }
    // Now handle new vehicle configurations insertion
    foreach($aConfigurations as $aConfiguration){
      if(!isset($aConfiguration['id'])){
        $this->add($aConfiguration);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a vehicle configuration as removed
  * @param string $sVehicleConfigurationID : id of the vehicle configuration to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sVehicleConfigurationID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleConfigurationID]);
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $bResult = $oVehicleConfigurationDAO->markAsRemoved($sVehicleConfigurationID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sVehicleConfigurationID,'vehicle_configuration');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a vehicle configuration.
  * @param string $sVehicleConfigurationID : id of the vehicle configuration to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function delete($sVehicleConfigurationID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleConfigurationID]);
    $bResult = false;
    if($this->isAdmin()){      
      // Delete capacities associated to the vehicle configuration
      $aVehicleCapacitiesToDelete = $this->listCapacities(array("vehicleConfigurationId"=>$sVehicleConfigurationID));
      foreach($aVehicleCapacitiesToDelete as $aVehicleCapacityToDelete){
        $this->deleteCapacity($aVehicleCapacityToDelete['id']);
      }
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sVehicleConfigurationID,'vehicle_configuration');
      $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
      $bResult = $oVehicleConfigurationDAO->delete($sVehicleConfigurationID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Get a list of vehicle capacities based on search criteria
  * The input data array is expected to contain the following fields : vehicleConfigurationId
  * @param array $aData : filtering data
  * @return array({object}) : array of Vehicle capacity object
  **/
  public function listCapacities($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $aVehicleCapacities = $oVehicleConfigurationDAO->listCapacities($aData);
    $this->setResult($aVehicleCapacities);
    return $aVehicleCapacities;
  }

  /**
  * Add a vehicle capacity
  * @param array $aData : data of the vehicle capacity to be added.
  * @return array : new vehicle capacity with id field
  */
  public function addCapacity($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $aNewVehicleCapacity = $oVehicleConfigurationDAO->addCapacity($aData);
    if(isset($aNewVehicleCapacity['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewVehicleCapacity['id'],'vehicle_capacity');
    }
    else{
      throw new \OSS\AppException(
        "Vehicle capacity insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewVehicleCapacity);
    return $aNewVehicleCapacity;
  }

  /**
  * Update a vehicle capacity
  * @param array $aData : data of the vehicle capacity to be updated.
  * @return boolean : true in case of success
  */
  public function updateCapacity($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'vehicle_capacity');
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $bResult = $oVehicleConfigurationDAO->updateCapacity($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'vehicle_capacity');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
   * Update all the vehicle capacities over a vehicle configuration
   * @param array $aVehicleCapacities : the updated vehicle capacities
   * @param string $sVehicleConfigurationID : the concerned vehicle configuration id
   * @return boolean : true if the update succeeded
   */
  public function updateCapacitiesByVehicleConfiguration($aVehicleCapacities,$sVehicleConfigurationID){
    $this->log()->info(["method"=>__METHOD__,"data"=>array($aVehicleCapacities,$sVehicleConfigurationID)]);
    $bResult = true;
    // Get the list of existing vehicle capacities for the current vehicle configuration, for comparison
    $aOldVehicleCapacities = $this->listCapacities(array('vehicleConfigurationId'=>$sVehicleConfigurationID));
    foreach($aOldVehicleCapacities as $aOldVehicleCapacity){
      $bOldVehicleCapacityFound = false;
      foreach($aVehicleCapacities as $aVehicleCapacity){
        if(isset($aVehicleCapacity['id']) && $aVehicleCapacity['id'] == $aOldVehicleCapacity['id']){
          // Handle an updated vehicle capacity
          $bResult &= $this->updateCapacity($aVehicleCapacity);
          $bOldVehicleCapacityFound = true;
          break;
        }
      }
      if(!$bOldVehicleCapacityFound){
        // Handle a deleted vehicle capacity
        $bResult &= $this->markCapacityAsRemoved($aOldVehicleCapacity['id']);
      }
    }
    // Now handle new vehicle capacities insertion
    foreach($aVehicleCapacities as $aVehicleCapacity){
      if(!isset($aVehicleCapacity['id'])){
        $this->addCapacity($aVehicleCapacity);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a vehicle capacity as removed
  * @param string $sVehicleCapacityID : id of the vehicle capacity to be removed.
  * @return boolean : true in case of success
  */
  public function markCapacityAsRemoved($sVehicleCapacityID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleCapacityID]);
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $bResult = $oVehicleConfigurationDAO->markCapacityAsRemoved($sVehicleCapacityID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sVehicleCapacityID,'vehicle_capacity');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a vehicle capacity.
  * @param string $sVehicleCapacityID : id of the vehicle capacity to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function deleteCapacity($sVehicleCapacityID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleCapacityID]);
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $oAuditTrailCtrl->beforeDataDelete($sVehicleCapacityID,'vehicle_capacity');
    $oVehicleConfigurationDAO = new \OSS\Model\VehicleConfigurationDAO();
    $bResult = $oVehicleConfigurationDAO->deleteCapacity($sVehicleCapacityID);
    $this->setResult($bResult);
    return $bResult;
  }
}