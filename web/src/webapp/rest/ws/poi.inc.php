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
  POIS WEB SERVICES
**********************************/

/**
* Get POIs list paginated and filtered
**/
$app->get('/poi/list', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->list($request->getQueryParams());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Lister des POIs");

/**
* Get POIs list paginated and filtered, for transport - only POIs associated to HRs
**/
$app->get('/poi/list/transport', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->listTransportPOIs($request->getQueryParams());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Lister des POIs associés à des usagers");

/**
* Reverse geocode a location
**/
$app->get('/poi/reverse-geocode', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->reverseGeocode($request->getQueryParams());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Calculer une adresse de POI");

/**
* Update the travel acceptable duration for a set of HR POIs
**/
$app->post('/poi/update-acceptable-durations', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->updateAcceptableDurations($request->getParsedBody());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Demander la mise à jour de durées de trajet acceptables");

/**
* Get some default travel acceptable durations for a HR POI
**/
$app->get('/poi/acceptable-durations', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->getAcceptableDurations($request->getQueryParams());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Calculer des durées de trajet acceptables");

/**
* Get a POI knowing its POI ID
* @param GET POIId
**/
$app->get('/poi/{POIId}', function($request,$response,$args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->get($args['POIId']);
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Afficher un POI");

/**
* Update a poi service duration
**/
$app->post('/poi/update-service-duration', function(Request $request, Response $response, array $args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->updateServiceDuration($request->getParsedBody());
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Changer le temps de service du POI");

/**
* Set some acceptable durations values with client defined values
**/
$app->post('/poi/save-acceptable-durations', function(Request $request, Response $response, array $args) {
  $oPOICtrl = new \OSS\Ctrl\POICtrl();
  $oPOICtrl->setResult($oPOICtrl->setAcceptableDurations($request->getParsedBody()));
  $response->getBody()->write($oPOICtrl->getResult());
  return $response;
})->setName("Enregistrer des durées de trajet acceptables");





