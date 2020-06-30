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
* Get sites list paginated and filtered
**/
$app->get('/site/list', function(Request $request, Response $response, array $args) {
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $oSiteCtrl->list($request->getQueryParams());
  $response->getBody()->write($oSiteCtrl->getResult());
  return $response;
})->setName("Lister des sites");

/**
* Get a site knowing its site ID
* @param GET siteId
**/
$app->get('/site/{siteId}', function($request,$response,$args) {
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $oSiteCtrl->get($args['siteId']);
  $response->getBody()->write($oSiteCtrl->getResult());
  return $response;
})->setName("Afficher un site");

/**
* Save a site (site creation or site update)
**/
$app->post('/site/save', function(Request $request, Response $response, array $args) {
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $oSiteCtrl->save($request->getParsedBody());
  $response->getBody()->write($oSiteCtrl->getResult());
  return $response;
})->setName("Enregistrer un site");

/**
* Mark a site as removed
**/
$app->post('/site/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $oSiteCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oSiteCtrl->getResult());
  return $response;
})->setName("Supprimer un site");

/**
* Delete a site
**/
$app->post('/site/delete', function(Request $request, Response $response, array $args) {
  $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
  $oSiteCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oSiteCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un site");