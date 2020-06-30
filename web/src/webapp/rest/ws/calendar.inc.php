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
* List some transport_calendars
**/
$app->get('/calendar/list', function(Request $request, Response $response, array $args) {
    $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
    $oCalendarCtrl->setResult($oCalendarCtrl->list($request->getQueryParams()));
    $response->getBody()->write($oCalendarCtrl->getResult());
    return $response;
  })->setName("Liste des éléments du calendrier des demandes");

/**
* Convert a date with year (YYYY), month (from 1 to 12) and day (from 1 to 31) into a timestamp in ms.
* Using this service guarantees that we will obtain a timestamp at midnight server time
**/
$app->get('/calendar/to-timestamp', function(Request $request, Response $response, array $args) use($logger) {
  $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
  $oCalendarCtrl->setResult($oCalendarCtrl->toTimestamp($request->getQueryParams()));
  $response->getBody()->write($oCalendarCtrl->getResult());
  return $response;
})->setName("Convertir une date en timestamp");

/**
* Update the calendars for all the demands associated to the scenario
**/
$app->post('/calendar/update', function(Request $request, Response $response, array $args) {
  $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
  $oCalendarCtrl->setResult($oCalendarCtrl->updateByScenario($request->getParsedBody()));
  $response->getBody()->write($oCalendarCtrl->getResult());
  return $response;
})->setName("Mettre à jour le calendrier pour un scénario");


/**
* set status of a transport_calendar entry
**/
$app->post('/calendar/set-status', function(Request $request, Response $response, array $args) {
  $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
  $oCalendarCtrl->setResult($oCalendarCtrl->setStatus($request->getParsedBody()));
  $response->getBody()->write($oCalendarCtrl->getResult());
  return $response;
})->setName("Mise à jour du statut d'une demande dans le calendrier");
