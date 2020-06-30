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
* Get checkers list and filtered
**/
$app->get('/datachecker/list', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->list($request->getQueryParams());
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Lister des contrôles de cohérence");

/**
* Get a datachecker knowing its datachecker ID
* @param GET checkerId
**/
$app->get('/datachecker/{checkerId}', function($request,$response,$args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->get($args['checkerId']);
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Afficher un contrôle de cohérence");

/**
* Save a datachecker (datachecker creation or datachecker update)
**/
$app->post('/datachecker/save', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->save($request->getParsedBody());
  $response->getBody()->write($oDataCheckerCtrl->getResult());
    return $response;
})->setName("Enregistrer un contrôle de cohérence");

/**
* Mark a datachecker as removed
**/
$app->post('/datachecker/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oDataCheckerCtrl->getResult());
return $response;
})->setName("Supprimer un contrôle de cohérence");

/**
* Delete a datachecker
**/
$app->post('/datachecker/delete', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un contrôle de cohérence");

/**
* Run checks
* @params : body : {id: <datacheker_id} context:['scenario_main_id':<scenario id>,'transport_route_id':<transport route id>, ...]}
**/
$app->post('/datachecker/run', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->run($request->getParsedBody());
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Exécuter un contrôle de cohérence");

/**
* Get checkers list details and filtered
**/
$app->get('/datacheckerdetail/list', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->listDetails($request->getQueryParams());
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Lister les résultats de l'exécution des contrôles de cohérence");

/**
* Delete a datacheckerdetail
**/
$app->post('/datacheckerdetail/delete', function(Request $request, Response $response, array $args) {
  $oDataCheckerCtrl = new \OSS\Ctrl\DataCheckerCtrl();
  $oDataCheckerCtrl->deleteDetail($request->getParsedBody()['id']);
  $response->getBody()->write($oDataCheckerCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un résultat de contrôle de cohérence");
