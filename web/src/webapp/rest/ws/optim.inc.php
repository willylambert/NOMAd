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

// List optimizations
$app->get('/optim/list', function(Request $request, Response $response, array $args) {
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->list($request->getQueryParams()));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Lister des optimisations");

// Get the default parameters for the optimizer
$app->get('/optim/default-params', function(Request $request, Response $response, array $args) {
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->getDefaultParams());
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Obtenir les paramètres d'optimisation par défaut");

// Get an optimization
$app->get('/optim/{id}', function(Request $request, Response $response, array $args) {
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->get($args['id']));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Afficher une optimisation");

// Save an optimization into database
$app->post('/optim/save',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult(["id"=>$oOptimCtrl->save($request->getParsedBody())]);
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Enregistrer une optimisation");

/**
* Mark as removed
**/
$app->post('/optim/mark-as-removed', function(Request $request, Response $response, array $args) {
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->markAsRemoved($request->getParsedBody()['id']);
  $response->getBody()->write($oOptimCtrl->getResult());
return $response;
})->setName("Supprimer une optimisation");

/**
* Delete
**/
$app->post('/optim/delete', function(Request $request, Response $response, array $args) {
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->delete($request->getParsedBody()['id']);
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Supprimer définitivement une optimisation");

// Check the progression of an optimization
// Also force the FIFO to process
$app->post('/optim/check',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->check($request->getParsedBody()));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Vérifier la progression d'une optimisation");

// Turn a set of routes into an optimization instance
$app->post('/optim/from-routes',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $sOptimId = $oOptimCtrl->fromRoutes($request->getParsedBody());
  // Get the optim job data from database : usefull in case the job is processed immediately
  $oOptimCtrl->setResult($oOptimCtrl->get($sOptimId));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Créer une instance à partir de routes existantes");

// Turn a scenario into an optimization instance
$app->post('/optim/from-scenario',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $sOptimId = $oOptimCtrl->fromScenario($request->getParsedBody());
  // Get the optim job data from database : usefull in case the job is processed immediately
  $oOptimCtrl->setResult($oOptimCtrl->get($sOptimId));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Créer une instance à partir d'un scénario");

// Request optimization server to kill an optimization process
$app->post('/optim/stop',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->stop($request->getParsedBody()));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Arrêter une optimisation sur le serveur d'optimisation");

// Pause or wake up the checks on a running optimization job
$app->post('/optim/pause',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->pause($request->getParsedBody()));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Mettre en pause ou réveiller une optimisation");

// Generated a set of routes from the solution of an optimization
$app->get('/optim/to-routes/{optimId}',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->setResult($oOptimCtrl->toRoutes($args['optimId']));
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Créer des routes à partir d'une instance");

// Request optimization FIFO to process
$app->post('/optim/process-fifo',function(Request $request, Response $response, array $args) use ($app){
  $oOptimCtrl = new \OSS\Ctrl\OptimCtrl();
  $oOptimCtrl->processFIFO();
  $response->getBody()->write($oOptimCtrl->getResult());
  return $response;
})->setName("Demander le traitement de la file d'attente optimisation");