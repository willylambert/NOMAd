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

/**
 *  Service REST for login
 **/
namespace OSS\Ctrl;

class LoginCtrl extends \OSS\BaseObject{

  /**
  * Try to log the user in, given its user name and password
  * @param string $sUserName : the user name.
  * @param string $sPassword : the password (not crypted)
  * @return ["result"=>boolean,"user_session_id"=>string]
  */
  function login($sUserName,$sPassword){
    $this->log()->notice(["method"=>__METHOD__,"data"=>[$sUserName,$sPassword]]);

    $oLoginDAO = new \OSS\Model\LoginDAO();

    $aRet = ["result"=>false];
    $aRet['app_version'] = $this->config('VERSION');

    // Force lowercase for username
    $sUserName = strtolower($sUserName);

    // Validate user and password from DB
    $result = $this->connectUsingDB($sUserName,$sPassword);

    if($result["result"]){
      // Start Session for 'web' application
      $userSessionId = $oLoginDAO->createSession($result["user_main_id"],'web');

      $this->log()->notice(array("message"=>"Session started","method"=>__METHOD__,"data"=>[$sUserName,$userSessionId["id"]]));
      $aRet['result'] = true;
      $aRet['user_session_id'] = $userSessionId["id"];
      $aRet['user_main_id'] = $result["user_main_id"];
      // Give the list of linked hrs at login time
      $oUserCtrl = new \OSS\Ctrl\UserCtrl();
      $aRet['hrs']=$oUserCtrl->listHRs($aRet['user_main_id']);
      $this->log()->info(["method"=>__METHOD__,"message"=>"hrs","data"=>$aRet['hrs']]);
    }else{
      $this->log()->warn(array("message"=>"Unable to start session","method"=>__METHOD__,"data"=>[$sUserName,$userSessionId["id"]]));
    }

    return $aRet;
  }

  /**
  * @param string $sessionToken
  * @return boolean false is session token could not be verified
  **/
  function loadSession($sessionToken){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sessionToken]]);

    $bRet = false;

    $sessionId = $sessionToken;

    $oLoginDAO = new \OSS\Model\LoginDAO();
    $session = $oLoginDAO->loadSession($sessionId);

    if($session && isset($session["user_main_id"])){
      $this->setSessionUserId($session["user_main_id"]);
      $this->setSessionData($session["session_data"]);
      $this->setSessionUserType($session["user_main_type_code"]);
      $bRet = true;
    }else{
      $this->log()->warn(array("message"=>"Session not found","method"=>__METHOD__,"data"=>$sessionToken));
    }
    return $bRet;
  }

  /**
  * This function returns true in case of connection sucess, false otherwise
  * @param string $sUserName : the user name.
  * @param string $sPassword : the password (not crypted)
  * @return ["result"=>boolean,"user_main_id"=>string]
  **/
  private function connectUsingDB($sUserName,$sPassword){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sUserName,$sPassword]]);

    // Connection attempt using the database.
    $oLoginDAO = new \OSS\Model\LoginDAO();
    return $oLoginDAO->login($sUserName,$sPassword);
  }

}