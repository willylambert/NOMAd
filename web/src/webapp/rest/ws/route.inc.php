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

/*********************************
  ROUTES WEB SERVICES
**********************************/

/**
* Get routes list paginated and filtered
  * GET parameters : 
   *   timeSlotId : the target timeslot id,
   *   institutions : the target list of institution ids,
   *   demands : whether we work with demands or nod,
   *   scenarioMainId : target scenario (optional)
   *   onGoingStatus : 'S' => Started, 'E' => Ended
**/
$app->get('/route/list', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->list($request->getQueryParams());
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Lister des tournées");

/**
* Get POIs list paginated and filtered, for transport
**/
$app->get('/route/poi/list', function($request,$response,$args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->listPOIForTransport($request->getQueryParams());
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Lister des POIs pour créer des routes");

/**
* Get the directions (computed route) associated to the provided coordinates
* A timeslot id and a local departure time are present in the input parameters and enable
*   to make sure that the computed route will be time-dependent
**/
$app->get('/route/directions/{coordinates}', function($request,$response,$args) {
    $oRoutingCtrl = new \OSS\Ctrl\RoutingCtrl();
    $oRoutingCtrl->setResult($oRoutingCtrl->directions($args['coordinates'],$request->getQueryParams()));
    $response->getBody()->write($oRoutingCtrl->getResult());
    return $response;
})->setName("Calculer un itinéraire");

/**
* Save a created route
**/
$app->post('/route/save', function($request,$response,$args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->save($request->getParsedBody());
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Enregistrer une tournée");

/**
* Mark a route as removed
**/
$app->post('/route/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Supprimer une tournée");

/**
* Delete a route
**/
$app->post('/route/delete', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement une tournée");

/**
* Resore a set of routes from an optim id
**/
$app->post('/route/restore', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->setResult($oRouteCtrl->restore($request->getParsedBody()['optimId']));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Restaurer des tournées à partir d'une instance d'optimisation");

/**
* Return a calendar with the number of routes
**/
$app->get('/route/calendar', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl();
  $oRouteCtrl->setResult($oRouteCtrl->listForCalendar($request->getQueryParams()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Obtenir un calendrier des tournées");

/**
 * Insert some location data from mobile devices
 */
$app->post('/route/insert-location', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->insertLocation($request->getParsedBody()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Insérer des données de localisation issues de véhicules réalisant les tournées");

/**
 * Notify a route start and reset route progress information if any
 */
$app->post('/route/start', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->routeStart($request->getParsedBody()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Notifier le début d'une tournée");

/**
 * reset route progress information if any
 */
$app->post('/route/reset-progression', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->resetProgression($request->getParsedBody()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Réinitialiser la progression d'une tournée");

/**
 * Notify a route end
 */
$app->post('/route/end', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->routeEnd($request->getParsedBody()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Notifier la fin d'une tournée");

/**
 * Notify a route poi visit
 */
$app->post('/route/visit', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->routePOIVisit($request->getParsedBody()));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Notifier la visite d'un point d'une tournée");

/**
 * Given a hrMainId, returns all pickup/delivery events
 */
$app->get('/route/list-by-hrmainid/{hrMainId}', function(Request $request, Response $response, array $args) {
  $oRouteCtrl = new \OSS\Ctrl\RouteCtrl($app);
  $oRouteCtrl->setResult($oRouteCtrl->listRoutesByUserMainId($args['hrMainId']));
  $response->getBody()->write($oRouteCtrl->getResult());
  return $response;
})->setName("Lister les prises en charge/dépose d'un usager");


