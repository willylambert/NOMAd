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

/**
* Get demands list paginated and filtered
**/
$app->get('/demand/list', function(Request $request, Response $response, array $args) {
  $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
  $oDemandCtrl->list($request->getQueryParams());
  $response->getBody()->write($oDemandCtrl->getResult());
  return $response;
})->setName("Lister des demandes de transport");

/**
* Get a demand knowing its demand ID
* @param GET demandId
**/
$app->get('/demand/{demandId}', function($request,$response,$args) {
  $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
  $oDemandCtrl->get($args['demandId']);
  $response->getBody()->write($oDemandCtrl->getResult());
  return $response;
})->setName("Afficher une demande de transport");

/**
* Save a demand (demand creation or demand update)
**/
$app->post('/demand/save', function(Request $request, Response $response, array $args) {
  $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
  $oDemandCtrl->save($request->getParsedBody());
  $response->getBody()->write($oDemandCtrl->getResult());
    return $response;
})->setName("Enregistrer une demande de transport");

/**
* Mark a demand as removed
**/
$app->post('/demand/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
  $oDemandCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oDemandCtrl->getResult());
return $response;
})->setName("Supprimer une demande de transport");

/**
* Delete a demand
**/
$app->post('/demand/delete', function(Request $request, Response $response, array $args) {
  $oDemandCtrl = new \OSS\Ctrl\DemandCtrl();
  $oDemandCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oDemandCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement une demande de transport");