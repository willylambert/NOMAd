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

$app->get('/aclaction/has-access',function(Request $request, Response $response, array $args) use ($app){
  $oAclCtrl = new \OSS\Ctrl\AclActionCtrl();
  $params = $request->getQueryParams();
  $oAclCtrl->userHasAccess($params['userId'],$params['action']);
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Contrôler un droit");

$app->get('/aclaction/list',function(Request $request, Response $response, array $args) use ($app){
  $oAclCtrl = new \OSS\Ctrl\AclActionCtrl();
  $oAclCtrl->list($app);
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Lister les actions");

$app->get('/aclrole/list',function(Request $request, Response $response, array $args){
  $oAclCtrl = new \OSS\Ctrl\AclRoleCtrl();
  $result = $oAclCtrl->list();
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Lister les rôles");

$app->get('/aclrole/{id}', function(Request $request, Response $response, array $args) {
  $oAclCtrl = new \OSS\Ctrl\AclRoleCtrl();
  $result = $oAclCtrl->get($args['id']);
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Afficher un rôle");

$app->post('/aclrole/save',function(Request $request, Response $response, array $args) use ($app){
  $oAclCtrl = new \OSS\Ctrl\AclRoleCtrl();
  $oAclCtrl->save($request->getParsedBody());
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Enregistrer un rôle");

/**
* Delete a role
**/
$app->post('/aclrole/delete', function(Request $request, Response $response, array $args) {
  $oAclCtrl = new \OSS\Ctrl\AclRoleCtrl();
  $oAclCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oAclCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement un rôle");