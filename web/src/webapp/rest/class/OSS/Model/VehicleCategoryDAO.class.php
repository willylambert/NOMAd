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
 *  Class to handle DB access for vehicle category
 **/
namespace OSS\Model;

use PDO;

class VehicleCategoryDAO extends \OSS\BaseObject{

  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of vehicle categories
  * @param array $filters : an array of filters
  * @return array of vehicle categories
  **/
  function list($filters){

    $sLimitClause = $this->db()->getLimitClause($filters);
    $sOffsetClause = $this->db()->getOffsetClause($filters);
    $sSearchClause = $this->db()->getSearchClause($filters,array("vehicle_category.code","vehicle_category.label"));

    // TODO imbricated SQL query to be reworked
    $sql = "SELECT
              vehicle_category.id,
              vehicle_category.code,
              vehicle_category.label,
              vehicle_category.axles_count,
              vehicle_category.fuel_consumption,
              vehicle_category.daily_cost,
              vehicle_category.hourly_cost,
              vehicle_category.kilometric_cost,
              vehicle_category.co2_quantity,
              json_agg(json_build_object(
                'id',configuration.id,
                'code',configuration.code,
                'label',configuration.label,
                'capacities',configuration.capacities
                )) as configurations
            FROM vehicle_category
            LEFT JOIN (
                SELECT
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id,
                  json_agg(json_build_object(
                    'id',vehicle_capacity.id,
                    'quantity',vehicle_capacity.quantity,
                    'unit_th',vehicle_capacity.unit_th,
                    'unit_code',th_unit.code,
                    'unit_label',th_unit.label,
                    'transported_label',th_transported.label,
                    'transported_code',th_transported.code,
                    'transported_th',vehicle_capacity.transported_th
                  )) as capacities
                FROM vehicle_configuration
                INNER JOIN vehicle_capacity on vehicle_capacity.vehicle_configuration_id = vehicle_configuration.id
                INNER JOIN util_thesaurus as th_transported on vehicle_capacity.transported_th = th_transported.id
                INNER JOIN util_thesaurus as th_unit on vehicle_capacity.unit_th = th_unit.id
                GROUP BY
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id
            ) as configuration on configuration.vehicle_category_id = vehicle_category.id
            WHERE rec_st<>'D'
                  $sSearchClause
            GROUP BY vehicle_category.id,
                     vehicle_category.code,
                     vehicle_category.label,
                     vehicle_category.axles_count,
                     vehicle_category.fuel_consumption,
                     vehicle_category.daily_cost,
                     vehicle_category.hourly_cost,
                     vehicle_category.kilometric_cost,
                     vehicle_category.co2_quantity
            ORDER BY id
                     $sLimitClause
                     $sOffsetClause";

    $result = $this->db()->query($sql);
    $vehicleCategories = $result->fetchAll(PDO::FETCH_ASSOC);

    foreach ($vehicleCategories as &$vehicleCategory) {
      $vehicleCategory["configurations"]=json_decode($vehicleCategory["configurations"],true);
    }
    return $vehicleCategories;
  }

  /**
  * Get a vehicle category
  * @param string $sVehicleCategoryId : identifier for a vehicle category
  * @return array a vehicle category
  **/
  function get($sVehicleCategoryId){

    $sVehicleCategoryIdQuoted = $this->db()->quote($sVehicleCategoryId);

    // TODO imbricated SQL query to be reworked
    $sql = "SELECT
              vehicle_category.id,
              vehicle_category.code,
              vehicle_category.label,
              vehicle_category.axles_count,
              vehicle_category.fuel_consumption,
              vehicle_category.daily_cost,
              vehicle_category.hourly_cost,
              vehicle_category.kilometric_cost,
              vehicle_category.co2_quantity,
              json_agg(json_build_object(
                'id',configuration.id,
                'code',configuration.code,
                'label',configuration.label,
                'capacities',configuration.capacities
                )) as configurations
            FROM vehicle_category
            LEFT JOIN (
                SELECT
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id,
                  json_agg(json_build_object(
                    'id',vehicle_capacity.id,
                    'quantity',vehicle_capacity.quantity,
                    'unit_th',vehicle_capacity.unit_th,
                    'unit_code',th_unit.code,
                    'unit_label',th_unit.label,
                    'transported_label',th_transported.label,
                    'transported_code',th_transported.code,
                    'transported_th',vehicle_capacity.transported_th
                  )) as capacities
                FROM vehicle_configuration
                INNER JOIN vehicle_capacity on vehicle_capacity.vehicle_configuration_id = vehicle_configuration.id
                INNER JOIN util_thesaurus as th_transported on vehicle_capacity.transported_th = th_transported.id
                INNER JOIN util_thesaurus as th_unit on vehicle_capacity.unit_th = th_unit.id
                WHERE vehicle_capacity.rec_st <> 'D' AND vehicle_configuration.rec_st<>'D'
                GROUP BY
                  vehicle_configuration.id,
                  vehicle_configuration.code,
                  vehicle_configuration.label,
                  vehicle_configuration.vehicle_category_id
            ) as configuration on configuration.vehicle_category_id = vehicle_category.id
            WHERE vehicle_category.id = $sVehicleCategoryIdQuoted
            GROUP BY vehicle_category.id,
                     vehicle_category.code,
                     vehicle_category.label,
                     vehicle_category.axles_count,
                     vehicle_category.fuel_consumption,
                     vehicle_category.daily_cost,
                     vehicle_category.hourly_cost,
                     vehicle_category.kilometric_cost,
                     vehicle_category.co2_quantity";

    $result = $this->db()->query($sql);
    $vehicleCategory = $result->fetch(PDO::FETCH_ASSOC);
    $vehicleCategory["configurations"]=json_decode($vehicleCategory["configurations"],true);
    return $vehicleCategory;
  }

  /**
  * Add a vehicle category
  * @param array $aData : data of the vehicle category to be inserted.
  * @return array created site with an id field
  */
  public function add($aData){
    $aReplacement = array(
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':axles_count'=>$aData['axles_count'],
      ':fuel_consumption'=>$aData['fuel_consumption'],
      ':daily_cost'=>$aData['daily_cost'],
      ':hourly_cost'=>$aData['hourly_cost'],
      ':kilometric_cost'=>$aData['kilometric_cost'],
      ':co2_quantity'=>$aData['co2_quantity'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "INSERT INTO vehicle_category (
                           code,
                           label,
                           axles_count,
                           fuel_consumption,
                           daily_cost,
                           hourly_cost,
                           kilometric_cost,
                           co2_quantity,
                           rec_st )
                  VALUES (
                           :code,
                           :label,
                           :axles_count,
                           :fuel_consumption,
                           :daily_cost,
                           :hourly_cost,
                           :kilometric_cost,
                           :co2_quantity,
                           :rec_st )
               RETURNING id";
    $oQuery = $this->db()->prepare($sSQL);
    try{
      $oQuery->execute($aReplacement);
    }
    catch(Exception $e){
      if($e->getCode()==23505){
        throw new \OSS\AppException(
          "Vehicle category with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $oQuery->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Update a vehicle category
  * @param array $aData : data of the vehicle category to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $aReplacement = array(
      ':id'=>$aData['id'],
      ':code'=>$aData['code'],
      ':label'=>$aData['label'],
      ':axles_count'=>$aData['axles_count'],
      ':fuel_consumption'=>$aData['fuel_consumption'],
      ':daily_cost'=>$aData['daily_cost'],
      ':hourly_cost'=>$aData['hourly_cost'],
      ':kilometric_cost'=>$aData['kilometric_cost'],
      ':co2_quantity'=>$aData['co2_quantity'],
      ':rec_st'=>$aData['rec_st']
    );
    $sSQL = "UPDATE vehicle_category
                SET
                    code=:code,
                    label=:label,
                    axles_count=:axles_count,
                    fuel_consumption=:fuel_consumption,
                    daily_cost=:daily_cost,
                    hourly_cost=:hourly_cost,
                    kilometric_cost=:kilometric_cost,
                    co2_quantity=:co2_quantity,
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
          "Vehicle category with code " . $aData['code'] . " already exists in database.",
          \OSS\AppException::ALREADY_EXISTS
        );
      }else{
        throw $e;
      }
    }
    return $bResult;
  }

  /**
  * Mark a vehicle category as removed
  * @param string $sVehicleCategoryID : id of the vehicle category to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function markAsRemoved($sVehicleCategoryID){
    $query = "UPDATE vehicle_category SET rec_st='D' WHERE id=" . $this->db()->quote($sVehicleCategoryID);
    return $this->db()->exec($query);
  }

  /**
  * Delete a vehicle category.
  * @param string $sVehicleCategoryID : id of the vehicle category to be removed.
  * @return boolean : true if the operation succeeded
  */
  public function delete($sVehicleCategoryID){
    $query = "DELETE FROM datachecker_detail WHERE vehicle_category_id=" . $this->db()->quote($sVehicleCategoryID);
    $this->db()->exec($query);     
    $query = "DELETE FROM vehicle_category WHERE id=" . $this->db()->quote($sVehicleCategoryID);
    return $this->db()->exec($query);
  }
}