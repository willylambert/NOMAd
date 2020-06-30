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

namespace OSS;

class PHPErrorHandler extends BaseObject{

  /*
  * Handler for PHP errors
  * @param $request :
  * @param $response :
  * @param Error $e : a php error
  */
  public function __invoke($request, $response, $e) {

    $msg = "FATAL ERROR : " . $e->getMessage() . " @" . $e->getFile() . "[" . $e->getLine() . "] (Exception)";
    $this->log()->error(array("message"=>$msg));

    $timeOffset = microtime(true) - $_SERVER['REQUEST_TIME'];
    $dt = date('c') . " " . substr($timeOffset,0,7);

    // In the returned value, we allow CORS
    return $response->withStatus(500)
      ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
      ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
      ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
      ->write(json_encode(array(
        "errorDt"=>$dt,
        "errorMessage"=>$msg,
        "errorCode"=>$e->getCode()
      )));
  }

}