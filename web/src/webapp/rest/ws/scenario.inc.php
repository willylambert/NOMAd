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
* Get scenarios list paginated and filtered
**/
$app->get('/scenario/list', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->setResult($oScenarioCtrl->list($request->getQueryParams()));
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Lister des scénarios");

/**
* Get a scenario minimap
**/
$app->get('/scenario/minimap/{scenarioId}', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->getMinimap($args['scenarioId']);
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Localiser les routes du scénario");

/**
* Get a scenario knowing its scenario ID
* @param GET scenarioId
**/
$app->get('/scenario/{scenarioId}', function($request,$response,$args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->setResult($oScenarioCtrl->get($args['scenarioId']));
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Afficher un scénario");

/**
* Save a scenario (scenario creation or scenario update)
**/
$app->post('/scenario/save', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->save($request->getParsedBody());
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Enregistrer un scénario");

/**
* Duplicate a scenario (scenario creation from an already existing scenario)
**/
$app->post('/scenario/duplicate', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->duplicate($request->getParsedBody());
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Dupliquer un scénario");

/**
* Duplicate a route (route creation in a scenario from route in an already existing scenario )
**/
$app->post('/scenario/duplicate-route', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->copy($request->getParsedBody());
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Dupliquer une route vers un scénario");

/**
* Mark a scenario as removed
**/
$app->post('/scenario/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Supprimer un scénario");

/**
* Delete a scenario
**/
$app->post('/scenario/delete', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un scénario");

/**
* List the routes of a scenario
**/
$app->get('/scenario/route/list', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->setResult($oScenarioCtrl->listRoutesByCalendarDt($request->getQueryParams(),true));
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Lister les tournées dans un scénario");

/**
* List the POIs of a scenario
**/
$app->get('/scenario/poi/list', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->setResult($oScenarioCtrl->listPOIs($request->getQueryParams()));
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Lister les POIs dans un scénario");

/**
* Copy a half day from a scenario calendar into a set of days in the the same scenario
**/
$app->post('/scenario/calendar/copy', function(Request $request, Response $response, array $args) {
  $oScenarioCtrl = new \OSS\Ctrl\ScenarioCtrl();
  $oScenarioCtrl->setResult($oScenarioCtrl->copyCalendars($request->getParsedBody()));
  $response->getBody()->write($oScenarioCtrl->getResult());
  return $response;
})->setName("Propager des tournées dans le calendrier d'un scénario");
