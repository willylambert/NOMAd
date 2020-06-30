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
 *  REST service to handle Messengers
 *  @creationdate 2019-oct-11
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

use Aws\Sns\SnsClient;

class MessengerCtrl extends BaseObject{

  /**
  * Get a list of Messengers based on search criteria
  * The input data array is expected to contain the following fields : ...
  * @param array $aData : filtering data
  * @return array({object}) : array of Messenger object
  **/
  public function list($aData){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$aData]);
    $oMessengerDAO = new \OSS\Model\MessengerDAO();
    return $oMessengerDAO->list($aData);
  }

  /**
  * Get some details about an Messenger
  * @param string $sMessengerID : Messenger identifier
  * @return array with the following fields : ...
  */
  public function get($sMessengerID){
    $this->log()->debug(["method"=>__METHOD__,"data"=>$sMessengerID]);
    $oMessengerDAO = new \OSS\Model\MessengerDAO();
    return $oMessengerDAO->get($sMessengerID);
  }

  /**
  * Add a Messenger
  * @param array $aData : data of the Messenger to be added.
  * @return array : new messenger with id field
  */
  public function add($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    if(!isset($aData['content'])){
      $aData['content']='';
    }
    $aData['dt']=time();
    $oMessengerDAO = new \OSS\Model\MessengerDAO();
    $aNewMessenger = $oMessengerDAO->add($aData);
    if(isset($aNewMessenger['id'])){
      $aData['id']=$aNewMessenger['id'];
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterDataInsert($aData['id'],'hr_messenger');
    }
    else{
      throw new \OSS\AppException(
        "Messenger insertion into database failed.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }
    return $aNewMessenger;
  }

  /**
  * Update a Messenger
  * @param array $aData : data of the Messenger to be updated.
  * @return boolean : true in case of success
  */
  public function update($aData){
    $this->log()->info(["method"=>__METHOD__,"data"=>$aData]);
    $aData['rec_st']='U';
    $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
    $aOldData = $oAuditTrailCtrl->getRecordData($aData['id'],'hr_messenger');
    $oMessengerDAO = new \OSS\Model\MessengerDAO();
    $bResult = $oMessengerDAO->update($aData);
    if($bResult){
      $oAuditTrailCtrl->afterDataUpdate($aData['id'],$aOldData,'hr_messenger');
    }
    return $bResult;
  }

  /**
  * Mark a Messenger as removed
  * @param string $sMessengerID : id of the Messenger to be removed.
  * @return boolean : true in case of success
  */
  public function markAsRemoved($sMessengerID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sMessengerID]);
    $oMessengerDAO = new \OSS\Model\MessengerDAO();
    $bResult = $oMessengerDAO->markAsRemoved($sMessengerID);
    if($bResult){
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oAuditTrailCtrl->afterMarkAsRemoved($sMessengerID,'hr_messenger');
    }
    return $bResult;
  }

  /**
  * Delete a Messenger.
  * @param string $sMessengerID : id of the Messenger to be removed.
  * @return boolean : true if deletion succeeded
  */
  public function delete($sMessengerID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sMessengerID]);
    $bResult = false;
    if($this->isAdmin()){    
      $oAuditTrailCtrl = new \OSS\Ctrl\AuditTrailCtrl();
      $oMessengerDAO = new \OSS\Model\MessengerDAO();
      $oAuditTrailCtrl->beforeDataDelete($sMessengerID,'hr_messenger');
      $bResult = $oMessengerDAO->delete($sMessengerID);
    }
    return $bResult;
  }

  /**
   * Send the message to the hr
   */
  public function send($sMessengerID){
    $this->log()->info(["method"=>__METHOD__,"data"=>$sMessengerID]);
    $aMessenger = $this->get($sMessengerID);
    try{
      $client = SnsClient::factory(array(
        'credentials' => [
           'key'    => $this->config('SNS_AWS_KEY'),
           'secret' => $this->config('SNS_AWS_SECRET'),
        ],
        'region'  => $this->config('SNS_AWS_REGION'),
        "version" => "latest",
      ));
    }
    catch(Exception $e){
      throw new \OSS\AppException(
        "Impossible to start SNS client.",
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );
    }

    $aMsgAttributes = [
     'AWS.SNS.SMS.SenderID' => [
         'DataType' => 'String',
         'StringValue' => "NOMAD",
      ]
    ];
    $bRet = false;
    $iPhoneNumber = "";
    if(preg_match('/[+]33[0-9]{9}/',$aMessenger["phonenumber"])){
      // The phone number is valid and well formatted
      $iPhoneNumber = $aMessenger["phonenumber"];
    }
    else{
      if(preg_match('/0([0-9]{9})/',$aMessenger["phonenumber"])){
        // the phone number is valid but needs formatting
        $iPhoneNumber = '+33'.substr($aMessenger["phonenumber"],1,9);
      }
    }
    if($iPhoneNumber==""){
      throw new \OSS\AppException(
        "Impossible to send message: invalid phone number: ".$aMessenger["phonenumber"],
        \OSS\AppException::SAVE_INTO_DATABASE_FAILED
      );    
    }
    else{
      $sContent = $aMessenger["content"];
      if($sContent=="" || strlen($sContent)>140){
        throw new \OSS\AppException(
          "Impossible to send message: invalid message content: ".$sContent,
          \OSS\AppException::SAVE_INTO_DATABASE_FAILED
        );    
      }
      else{    
        $sAuthor = "NOMAD";
        try{
          $bRet = $client->publish([
            'Message' => "$sAuthor : $sContent",
            'PhoneNumber' => $iPhoneNumber,
            'MessageAttributes' => $aMsgAttributes
          ]);
        }
        catch(Exception $e){
          throw new \OSS\AppException(
            "Parsing error during message sending",
            \OSS\AppException::SAVE_INTO_DATABASE_FAILED
          );
        }
      }
    }
    return $bRet;
  }

}