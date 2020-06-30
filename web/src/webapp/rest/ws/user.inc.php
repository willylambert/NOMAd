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

$app->get('/user/list', function(Request $request, Response $response, array $args) {
  $oUserCtrl = new \OSS\Ctrl\UserCtrl();
  $oUserCtrl->list($request->getQueryParams());
  $response->getBody()->write($oUserCtrl->getResult());
  return $response;
})->setName("Lister des utilisateurs");

$app->get('/user/{id}', function(Request $request, Response $response, array $args) {
  $oUserCtrl = new \OSS\Ctrl\UserCtrl();
  $oUserCtrl->get($args['id']);
  $response->getBody()->write($oUserCtrl->getResult());
  return $response;
})->setName("Afficher un utilisateur");

$app->post('/user/save',function(Request $request, Response $response, array $args) use ($app){
  $oUserCtrl = new \OSS\Ctrl\UserCtrl();
  $oUserCtrl->save($request->getParsedBody());
  $response->getBody()->write($oUserCtrl->getResult());
  return $response;
})->setName("Enregistrer un utilisateur");

$app->post('/user/update-password',function(Request $request, Response $response, array $args) use ($app){
  $oUserCtrl = new \OSS\Ctrl\UserCtrl();
  $oUserCtrl->updatePassword($request->getParsedBody());
  $response->getBody()->write($oUserCtrl->getResult());
  return $response;
})->setName("Modifier un mot de passe");

/**
* Mark a user as removed
**/
$app->post('/user/mark-as-removed', function(Request $request, Response $response, array $args) {
  $UserCtrl = new \OSS\Ctrl\UserCtrl();
  $UserCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($UserCtrl->getResult());
  return $response;
})->setName("Supprimer un utilisateur");

/**
* Delete a user
**/
$app->post('/user/delete', function(Request $request, Response $response, array $args) {
  $oUserCtrl = new \OSS\Ctrl\UserCtrl();
  $oUserCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oUserCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un utilisateur");