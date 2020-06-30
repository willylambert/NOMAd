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
* Get groups list paginated and filtered
**/
$app->get('/group/list', function(Request $request, Response $response, array $args) {
  $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
  $oGroupCtrl->setResult($oGroupCtrl->list($request->getQueryParams()));
  $response->getBody()->write($oGroupCtrl->getResult());
  return $response;
})->setName("Lister des groupes de demandes de transport");

/**
* Get a group knowing its group ID
* @param GET groupId
**/
$app->get('/group/{groupId}', function($request,$response,$args) {
  $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
  $oGroupCtrl->setResult($oGroupCtrl->get($args['groupId']));
  $response->getBody()->write($oGroupCtrl->getResult());
  return $response;
})->setName("Afficher une groupe de demandes de transport");

/**
* Save a group (group creation or group update)
**/
$app->post('/group/save', function(Request $request, Response $response, array $args) {
  $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
  $oGroupCtrl->save($request->getParsedBody());
  $response->getBody()->write($oGroupCtrl->getResult());
  return $response;
})->setName("Enregistrer une groupe de demandes de transport");

/**
* Mark a group as removed
**/
$app->post('/group/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
  $oGroupCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oGroupCtrl->getResult());
  return $response;
})->setName("Supprimer une groupe de demandes de transport");

/**
* Delete a group
**/
$app->post('/group/delete', function(Request $request, Response $response, array $args) {
  $oGroupCtrl = new \OSS\Ctrl\GroupCtrl();
  $oGroupCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oGroupCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement une groupe de demandes de transport");