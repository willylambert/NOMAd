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
* Get hrs list paginated and filtered
**/
$app->get('/hr/list', function(Request $request, Response $response, array $args) use($logger) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->list($request->getQueryParams());
  $response->getBody()->write($oHRCtrl->getResult());
  return $response;
})->setName("Lister des usagers");

/**
* List the routes associated to a driver
**/
$app->get('/hr/routes', function(Request $request, Response $response, array $args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->setResult($oHRCtrl->listRoutes($request->getQueryParams()));
  $response->getBody()->write($oHRCtrl->getResult());
  return $response;
})->setName("Lister les tournées affectées à un chauffeur");

/**
* Get a hr knowing its hr ID
* @param GET hrId
**/
$app->get('/hr/{hrId}', function($request,$response,$args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->get($args['hrId']);
  $response->getBody()->write($oHRCtrl->getResult());
  return $response;
})->setName("Afficher un usager");

/**
* Save a hr (hr creation or hr update)
**/
$app->post('/hr/save', function(Request $request, Response $response, array $args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->save($request->getParsedBody());
  $response->getBody()->write($oHRCtrl->getResult());
    return $response;
})->setName("Enregistrer un usager");

/**
* Mark a hr as removed
**/
$app->post('/hr/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oHRCtrl->getResult());
return $response;
})->setName("Supprimer un usager");

/**
* Delete a hr
**/
$app->post('/hr/delete', function(Request $request, Response $response, array $args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oHRCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un usager");

/**
* Update the pickup and delivery durations for a set of HRs
**/
$app->post('/hr/update-durations', function(Request $request, Response $response, array $args) {
  $oHRCtrl = new \OSS\Ctrl\HRCtrl();
  $oHRCtrl->setResult($oHRCtrl->updateDurations($request->getParsedBody()));
  $response->getBody()->write($oHRCtrl->getResult());
  return $response;
})->setName("Changer les durées de montée et de descente d'usagers");
