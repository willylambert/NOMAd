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
 *  Class to handle DB access for login
 **/
namespace OSS\Model;

use PDO;

class LoginDAO extends \OSS\BaseObject{

  /**
  * default constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Look if the input user/encrypted password can be retrieved in the tuser table of the database.
  * Notice that in addition, a user must be tagged with enabled = 'Y' in database.
  * @param string $sUserName : the user name
  * @param string $sPassword : the password (clear)
  * @param ["result"=>boolean,"user_main_id"=>string]
  */
  function login($sUserName,$sPassword){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sUserName,$sPassword]]);

    $sUserNameQuoted = $this->db()->quote($sUserName);
    $sPasswordQuoted = $this->db()->quote($sPassword);
    $sQuery = "SELECT
                crypt($sPasswordQuoted,(SELECT passwd FROM user_main WHERE login=$sUserNameQuoted) )
                =
                (SELECT passwd
                   FROM user_main
             INNER JOIN util_thesaurus ON user_main.status_th = util_thesaurus.id
                  WHERE login=$sUserNameQuoted AND
                        user_main.rec_st<>'D' AND
                        util_thesaurus.code<>'DISABLED'
                ) AS result,
                (SELECT user_main.id
                   FROM user_main
             INNER JOIN util_thesaurus ON user_main.status_th = util_thesaurus.id
                  WHERE login=$sUserNameQuoted AND
                        user_main.rec_st<>'D' AND
                        util_thesaurus.code<>'DISABLED') AS user_main_id";
    $oResult = $this->db()->query($sQuery);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Add a new session
  * @param string $sUserMainId : the user id
  * @param string $sApplicationName : name of application. Same username could only have one session at a time.
  * @return ["id"=>string] id of session
  **/
  function createSession($sUserMainId,$sApplicationName){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sUserMainId]]);

    $sUserMainIdQuoted = $this->db()->quote($sUserMainId);
    $sApplicationNameQuoted = $this->db()->quote($sApplicationName);

    // Remove existing sessions if any
    $this->removeSession($sUserMainId,$sApplicationName);

    $sQuery = "INSERT INTO user_session(user_main_id, start_dt, lastaction_dt, application_name, session_data)
                    VALUES(" . $sUserMainIdQuoted . "," . time() . ",0,".$sApplicationNameQuoted.",'{}')
               RETURNING id";
    $oResult = $this->db()->query($sQuery);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * @param string $sessionToken
  * @return array["user_main_id"=>string, "session_data"=>json] : user session data and user_id
  **/
  function loadSession($sessionId){
    $this->log()->debug(["method"=>__METHOD__,"data"=>[$sessionId]]);

    $sSessionIdQuoted = $this->db()->quote($sessionId);

    $sQuery = "SELECT
                 user_session.user_main_id,
                 user_session.session_data as session_data,
                 util_thesaurus.code AS user_main_type_code
               FROM user_session
           INNER JOIN user_main ON user_main.id = user_session.user_main_id
           INNER JOIN util_thesaurus ON user_main.type_th = util_thesaurus.id
               WHERE user_session.id=$sSessionIdQuoted";
    $oResult = $this->db()->query($sQuery);
    $aResult = $oResult->fetch(PDO::FETCH_ASSOC);
    $aResult['session_data'] = json_decode($aResult['session_data'],true);
    return $aResult;
  }

  /**
  * Remove existing session for username and applicationName
  * @param string $sUserMainId : the user id
  * @param string $sApplicationName : name of application. Same username could only have one session at a time.
  **/
  function removeSession($sUserMainId,$sApplicationName){
    $sUserMainId = $this->db()->quote($sUserMainId);
    $sApplicationName = $this->db()->quote($sApplicationName);
    $sQuery = "DELETE FROM user_session
                    WHERE user_main_id=" . $sUserMainId . " AND
                          application_name=" . $sApplicationName;
    $oResult = $this->db()->query($sQuery);
  }

}