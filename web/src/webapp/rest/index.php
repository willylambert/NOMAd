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
require('/var/lib/vendor/autoload.php');

require("/var/www/docs/custom/rest/datachecker.hook.php");

//Autoloader \OSS classes
function autoloaderOSS($class) {
  include dirname(__FILE__) . '/class/' . str_replace('\\', '/', $class) . '.class.php';
}
spl_autoload_register('autoloaderOSS');

$app = new \Slim\App([
    'settings' => [
        // Only set this if you need access to route within middleware
        'determineRouteBeforeAppMiddleware' => true
    ]]);

$logger = new \OSS\LogWriter();

// Use a custom error handler so as to :
// - allow CORS in case of server error
// - transmit exception details (code, in particular) to client
$c = $app->getContainer();
$c['errorHandler'] = function ($c) {
  return new \OSS\ErrorHandler();
};
$c['phpErrorHandler'] = function ($c) {
  return new \OSS\PHPErrorHandler();
};

$app->options('/{routes:.+}', function ($request, $response, $args) {
  return $response;
});

// Add headers to allow CORS
$app->add(function ($req, $res, $next) {
  $response = $next($req, $res);
  return $response
          ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
          ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
          ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
});

// Middleware to add log before and after request
$app->add(function ($request, $response, $next) use($logger) {
  if($request->getMethod()!="OPTIONS"){
    if($_SERVER["REQUEST_URI"] != "/rest/optim/process-fifo"){
      $logger->info(array("message"=>"*** REQUEST START " . $_SERVER["REQUEST_URI"]));
    }
  }
  $response = $next($request, $response);
  if($request->getMethod()!="OPTIONS"){
    if($_SERVER["REQUEST_URI"] != "/rest/optim/process-fifo"){
      $logger->info(array("message"=>"### REQUEST END   " . $_SERVER["REQUEST_URI"]));
    }
  }
  return $response;
});

// Handle session
$app->add(function ($request, $response, $next) use($logger) {
  $aAuthHeader = $request->getHeader('Authorization');
  if($_SERVER["REQUEST_URI"]!="/rest/login" && $request->getMethod()!="OPTIONS"){
    if(count($aAuthHeader)==0){
      // We need to be logged in to run any requests,
      // with one exception when are calling login service
      $logger->warn(array("message"=>" Auth Failed, returning 401 "));
      $response = $response->withStatus(401)
                           ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
                           ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                           ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                           ->write(json_encode(array(
                                "errorMessage"=>"Access forbidden",
                           )));
    }else{
      // Verify and start session
      $oLoginCtrl = new \OSS\Ctrl\LoginCtrl();
      $bSessionStarted = $oLoginCtrl->loadSession($aAuthHeader[0]);
      if(!$bSessionStarted){
        $response = $response->withStatus(401)
                             ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
                             ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                             ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                             ->write(json_encode(array(
                              "errorMessage"=>"Access forbidden",
                             )));        
      }else{
        // Check that logged user have access to requested ressource
        $route = $request->getAttribute('route');
        $pattern = $route->getPattern();
        $userId = $oLoginCtrl->getSessionUserId();
        $oAclActionCtrl = new \OSS\Ctrl\AclActionCtrl();
        if(!$oAclActionCtrl->userHasAccess($userId,$pattern)){
          // It seems that in case of a 403 error, we have to tell again about the CORS
          $response = $response->withStatus(403)
                               ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
                               ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                               ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
                               ->write(json_encode(array(
                                "errorMessage"=>"Access forbidden",
                              )));
        }else{
          $response = $next($request, $response);
        }
      }
    }
  }
  else{
    $response = $next($request, $response);
  }
  return $response;
});


include("ws/acl.inc.php");
include("ws/aoi.inc.php");
include("ws/calendar.inc.php");
include("ws/demand.inc.php");
include("ws/group.inc.php");
include("ws/hr.inc.php");
include("ws/import.inc.php");
include("ws/login.inc.php");
include("ws/map.inc.php");
include("ws/optim.inc.php");
include("ws/poi.inc.php");
include("ws/route.inc.php");
include("ws/scenario.inc.php");
include("ws/site.inc.php");
include("ws/thesaurus.inc.php");
include("ws/user.inc.php");
include("ws/vehicle-category.inc.php");
include("ws/datachecker.inc.php");
include("ws/dashboard.inc.php");

// Catch-all route to serve a 404 Not Found page if none of the routes match
$app->map(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], '/{routes:.+}', function($req, $res) {
  $handler = $this->notFoundHandler; // handle using the default Slim page not found handler
  return $handler($req, $res);
});

$app->run();