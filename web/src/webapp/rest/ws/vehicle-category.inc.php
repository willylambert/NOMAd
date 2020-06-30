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

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;

$app->get('/vehiclecategory/list', function(Request $request, Response $response, array $args) {
  $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
  $oVehicleCategoryCtrl->list($request->getQueryParams());
  $response->getBody()->write($oVehicleCategoryCtrl->getResult());
  return $response;
})->setName("Lister des catégories véhicules");

$app->get('/vehiclecategory/{id}', function(Request $request, Response $response, array $args) {
  $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
  $oVehicleCategoryCtrl->get($args['id']);
  $response->getBody()->write($oVehicleCategoryCtrl->getResult());
  return $response;
})->setName("Afficher une catégorie de véhicule");

/**
* Save a vehicle category (vehicle category creation or vehicle category update)
**/
$app->post('/vehiclecategory/save', function(Request $request, Response $response, array $args) {
  $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
  $oVehicleCategoryCtrl->save($request->getParsedBody());
  $response->getBody()->write($oVehicleCategoryCtrl->getResult());
    return $response;
})->setName("Enregistrer une catégorie de véhicules");

/**
* Mark a vehicle category as removed
**/
$app->post('/vehiclecategory/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
  $oVehicleCategoryCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oVehicleCategoryCtrl->getResult());
return $response;
})->setName("Supprimer une catégorie de véhicules");

/**
* Delete a vehicle category
**/
$app->post('/vehiclecategory/delete', function(Request $request, Response $response, array $args) {
  $oVehicleCategoryCtrl = new \OSS\Ctrl\VehicleCategoryCtrl();
  $oVehicleCategoryCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oVehicleCategoryCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement une catégorie de véhicules");