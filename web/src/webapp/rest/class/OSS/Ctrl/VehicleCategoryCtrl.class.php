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
 *  Service REST for vehicle categories
 **/
namespace OSS\Ctrl;

class VehicleCategoryCtrl extends \OSS\BaseObject{

  /**
  * Get a list of vehicle categories
  * @param array $filters : an array of filters
  * @return array of vehicle categories
  **/
  function list($filters){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$filters]);
    $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
    $vehicleCategories = $oVehicleCategoryDAO->list($filters);
    $this->setResult($vehicleCategories);

    return $vehicleCategories;
  }

  /**
  * Get a vehicle category
  * @param string $sVehicleCategoryId : identifier for a vehicle category
  * @return array a vehicle category
  **/
  function get($sVehicleCategoryId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sVehicleCategoryId]);
    $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
    $vehicleCategory = $oVehicleCategoryDAO->get($sVehicleCategoryId);
    $this->setResult($vehicleCategory);
    return $vehicleCategory;
  }

  /**
  * Save a vehicle category (creation or update)
  * @param array $aData : data of the vehicle category to be saved.
  * @return array : with an id field (empty array in case of failure)
  */
  public function save($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aResult=array();
    // Set the optional fields
    if(!isset($aData['axles_count'])){
      $aData['axles_count']=NULL;
    }
    if(!isset($aData['fuel_consumption'])){
      $aData['fuel_consumption']=NULL;
    }
    if(!isset($aData['daily_cost'])){
      $aData['daily_cost']=NULL;
    }
    if(!isset($aData['hourly_cost'])){
      $aData['hourly_cost']=NULL;
    }
    if(!isset($aData['kilometric_cost'])){
        $aData['kilometric_cost']=NULL;
    }
    if(!isset($aData['co2_quantity'])){
      $aData['co2_quantity']=NULL;
    }
    if(isset($aData['id'])){
      if($this->update($aData)){
        $aResult['id']=$aData['id'];
      }
    }
    else{
      $aResult = $this->add($aData);
    }
    $this->setResult($aResult);
    return $aResult;
  }

  /**
  * Add a vehicle category
  * @param array $aData : data of the vehicle category to be added.
  * @return array : with an id field containing the id of the created vehicle category
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='C';
    $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
    $aNewData = $oVehicleCategoryDAO->add($aData);
    if(isset($aNewData['id'])){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aNewData['id'],'vehicle_category');
      // Handle the insertion for the new configurations
      if(isset($aData['configurations'])){
        foreach($aData['configurations'] as $aConfiguration){
          $aConfiguration['vehicle_category_id']=$aNewData['id'];
          $oVehicleConfigurationCtrl = new \OSS\Ctrl\VehicleConfigurationCtrl();
          $oVehicleConfigurationCtrl->add($aConfiguration);
        }
      }
    }
    else{
      throw new \OSS\AppException(
        "Vehicle category insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    $this->setResult($aNewData);
    return $aNewData;
  }

  /**
  * Update a vehicle category
  * @param array $aData : data of the vehicle category to be updated.
  * @return boolean true in case update succeded
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'vehicle_category');
    $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
    $bResult = $oVehicleCategoryDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'vehicle_category');
      // Handle the update for the list of existing configurations
      if(isset($aData['configurations'])){
        foreach($aData['configurations'] as &$aConfiguration){
          $aConfiguration['vehicle_category_id']=$aData['id'];
        }
        $oVehicleConfigurationCtrl = new \OSS\Ctrl\VehicleConfigurationCtrl();
        $bResult &= $oVehicleConfigurationCtrl->updateByVehicleCategory($aData['configurations'],$aData['id']);
      }
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Mark a vehicle category as removed
  * @param string $sVehicleCategoryID : id of the vehicle category to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sVehicleCategoryID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleCategoryID]);
    $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
    $bResult = $oVehicleCategoryDAO->markAsRemoved($sVehicleCategoryID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sVehicleCategoryID,'vehicle_category');
    }
    $this->setResult($bResult);
    return $bResult;
  }

  /**
  * Delete a vehicle category
  * @param string $sVehicleCategoryID : id of the vehicle category to be deleted.
  * @return boolean : true in case of success
  */
  public function delete($sVehicleCategoryID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sVehicleCategoryID]);
    $bResult = false;
    if($this->isAdmin()){      
      // Delete configurations associated to the vehicle category
      $oVehicleConfigurationCtrl = new \OSS\Ctrl\VehicleConfigurationCtrl();
      $aConfigurationsToDelete = $oVehicleConfigurationCtrl->list(array("vehicleCategoryId"=>$sVehicleCategoryID));
      foreach($aConfigurationsToDelete as $aConfigurationToDelete){
        $oVehicleConfigurationCtrl->delete($aConfigurationToDelete['id']);
      }
      // Delete the vehicle category itself
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->beforeDataDelete($sVehicleCategoryID,'vehicle_category');
      $oVehicleCategoryDAO = new \OSS\Model\VehicleCategoryDAO();
      $bResult = $oVehicleCategoryDAO->delete($sVehicleCategoryID);
    }
    $this->setResult($bResult);
    return $bResult;
  }

}