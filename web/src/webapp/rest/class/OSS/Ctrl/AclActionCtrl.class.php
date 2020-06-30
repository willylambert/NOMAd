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
 *  Service REST for ACL
 **/
namespace OSS\Ctrl;

class AclActionCtrl extends \OSS\BaseObject{

  /**
  * Get Acl Actions
  * @param $app object : slim app instance
  **/
  function list($app){
    $this->log()->debug(["method"=>__METHOD__]);

    $oAclActionDAO = new \OSS\Model\AclActionDAO();

    // Get Actions from db
    $actions = $oAclActionDAO->list();

    // Add actions not defined in db but in routes
    $result = $app->getContainer()->get('router')->getRoutes();
    foreach ($result as $key => $value) {
      $pattern = $value->getPattern();
      if($pattern !="/login" && $pattern != "/{routes:.+}"){
        $bFound = false;
        foreach($actions as $action){
          if($action["code"] == $pattern){
            $bFound = true;
            break;
          }
        }
        if(!$bFound){
          $actions[] = ["code"=>$pattern, "label"=>$value->getName()];
        }
      }
    }
    $this->setResult($actions);

    return $actions;
  }

  /**
  * Check if user has access to an action
  * @param $userId string
  * @param $actionCode, route pattern
  * @return boolean
  **/
  function userHasAccess($userId,$actionCode){
    $this->log()->info(["method"=>__METHOD__,"data"=>[$userId,$actionCode]]);

    $oAclActionDAO = new \OSS\Model\AclActionDAO();
    $bAccess = $oAclActionDAO->userHasAccess($userId,$actionCode);

    $this->setResult($bAccess);

    return $bAccess;
  }

}