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
 *  REST service to import data
 *  @creationdate 2019-08-13
 **/

namespace OSS\Ctrl;

use Exception;

use OSS\BaseObject;

class ImportCtrl extends BaseObject{

  /**
  * Convert a CSV file into a set of SQL queries
  * The expected input is a csv file using semicolon (;) as a token, and with the following 28 columns:
  * Lastname;Firstname;GenderCode;TransportModeCode;
  * (HOME) Label;Address1;Address2;Postcode;City;Latitude;Longitude;
  * (PICKING/DELIVERY POINT) Label;Address1;Address2;Postcode;City;Latitude;Longitude;
  * (TRANSPORT DEMAND TIMESLOTS)
  * MONDAY AM;MONDAY PM;
  * TUESDAY AM;TUESDAY PM;
  * WEDNESDAY AM;WEDNESDAY PM;
  * THURSDAY AM;THURSDAY PM;
  * FRIDAY AM;FRIDAY PM;
  * @param string $sCSVContent : content of the CSV file.
  * @return string : set of SQL instructions
  */
  public function import($sCSVContent,$sInstitutionCode){
    // Break the initial string into lines
    $aLines = preg_split("/\r\n|\n|\r/",$sCSVContent);
    // This is a line counter in order to exclude the 2 first lines in case they contain some column titles
    $iLineIndex=0;
    // The table of HRs that will be extracted from the CSV content
    $aHRs=array();
    foreach($aLines as $sLine){
      // Ignore lines without information
      if(trim($sLine)!=""){
        // Check that the current line is not a header line containing some column titles
        // A header line can only the first or the second non empty line. Otherwise, the CSV will be considered as invalid
        if($iLineIndex<2){
          if(strpos(trim($sLine),"Nom;Prénom;")!==false){
            // A header line was recognized, skip to the next line
            $iLineIndex++;
            continue;
          }
          if(strpos(trim($sLine),";;;;;;;;;Latitude")!==false){
            // A header line was recognized, skip to the next line
            $iLineIndex++;
            continue;
          }
        }
        $iLineIndex++;

        // Now we will try to match a regular expression against each non empty lines (the header lines are supposed to
        //   be detected and discarded by some previous code)
        $aMatches=array();
        // In order to stabilize the search by regular expression, a semicolon is added at the end of the line
        // Without this semicolon, we have some difficulty detecting the Friday afternoon time slot
        $sLinePlusSemicolon=$sLine.";";
        // In the pattern below, we make the assumption that lastnames, firstnames and citi names do not contain a semicolon
        //  (;) character. Without this assumption, the regular expression below prooved to be unstable.
        preg_match('/([^;]*);([^;]*);(F|M)?;([^;]*)?;(.*);(.*);(.*);([0-9]{4,5})?;([^;]*);([-]?[0-9]+[.][0-9]*)?;([-]?[0-9]+[.][0-9]*)?;(.*);(.*);(.*);([0-9]{4,5})?;([^;]*);([-]?[0-9]+[.][0-9]*)?;([-]?[0-9]+[.][0-9]*)?;(|1);(|1);(|1);(|1);(|1);(|1);(|1);(|1);(|1);(|1);/',$sLinePlusSemicolon,$aMatches);
        if(count($aMatches)!=29){
          // In case one of the lines is not empty and does no match the pattern, the input file is considered as not valid.
          // An exception is thrown. Encoding to utf8 before throwing the exception because a bad encoding can cause an 
          //   exception in the logger.
          throw new \OSS\AppException("Line from CSV file that does not match the expected pattern : ".utf8_encode($sLine),\OSS\AppException::INVALID_INPUT_DATA);
        }
        else{
          // With the matched information, insert or update the found HR information in the $aHRs array
          $this->buildHR($aMatches,$aHRs);
        }
      }
    }
    // Check that the inserted names will not generate some HRs or some users with duplicated names
    // With the current version of the generated SQL queries, we can not handle duplicated names so that import
    //   will fail.
    $this->checkNames($aHRs);
    // Turn the HRs array into a set of SQL queries.
    $this->setResult($this->buildSQL($aHRs,$sInstitutionCode));
  }

  /**
   * Turn a line parsed from the input CSV file into a HR, and use it to add a new HR to the input aHRs array,
   *   (or to update a HR from the aHRs array in case the HR is already present in $aHRs).
   * @param array $aMatches : the matching array from preg_match, should contain 29 fields
   * @param array $aHRs : input/output array with already build HRs
   */
  public function buildHR($aMatches,&$aHRs){
    // Extract information to fill in the POIs (and in the same time make sure the postcode uses 5 digits)
    $aHomePOI=array(
      "label"=>trim($aMatches[5]),
      "addr1"=>trim($aMatches[6]),
      "addr2"=>trim($aMatches[7]),
      "postcode"=>strlen($aMatches[8])==4 ? "0".$aMatches[8]:$aMatches[8],
      "city"=>trim($aMatches[9]),
      "lat"=>$aMatches[10],
      "lon"=>$aMatches[11]
    );
    $aRDVPOI=array(
      "label"=>trim($aMatches[12]),
      "addr1"=>trim($aMatches[13]),
      "addr2"=>trim($aMatches[14]),
      "postcode"=>strlen($aMatches[15])==4 ? "0".$aMatches[15]:$aMatches[15],
      "city"=>trim($aMatches[16]),
      "lat"=>$aMatches[17],
      "lon"=>$aMatches[18]
    );
    // Extract time slots
    $aDemands=array(
      "MONDAY_AM"=>$aMatches[19]=="1"?"1":"0",
      "MONDAY_PM"=>$aMatches[20]=="1"?"1":"0",
      "TUESDAY_AM"=>$aMatches[21]=="1"?"1":"0",
      "TUESDAY_PM"=>$aMatches[22]=="1"?"1":"0",
      "WEDNESDAY_AM"=>$aMatches[23]=="1"?"1":"0",
      "WEDNESDAY_PM"=>$aMatches[24]=="1"?"1":"0",
      "THURSDAY_AM"=>$aMatches[25]=="1"?"1":"0",
      "THURSDAY_PM"=>$aMatches[26]=="1"?"1":"0",
      "FRIDAY_AM"=>$aMatches[27]=="1"?"1":"0",
      "FRIDAY_PM"=>$aMatches[28]=="1"?"1":"0"
    );
    // Extract firstname and lastname.
    $sLastName=trim($aMatches[1]);
    $sFirstName=trim($aMatches[2]);
    if($sLastName!="" && $sFirstName!=""){
      // First name and last name are set : this corresponds to a new HR.
      // Make sure the code for the gender is H or F
      $sGender = ($aMatches[3]=="M")?"H":$aMatches[3];
      // Make sure the code for the transport mode is FAUTEUIL or MARCHANT
      $sHCP = trim($aMatches[4]);
      if($sHCP=="FNT"){
        $sHCP="FAUTEUIL";
      }
      if($sHCP=="M"){
        $sHCP="MARCHANT";
      }
      // Generate a site code for the HR. Although it would be more efficient to use only one SQL query for
      //   all HRs, the code is simpler that way.
      // Normally a code should not contain some special characters, but since it is based on lastname, we can not
      //   make sure that no special characters will appear. However, we easly remove space character and also
      //   quote characters that can turn SQL queries invalid
      $oSiteCtrl = new \OSS\Ctrl\SiteCtrl();
      $sLastNameFormatted = str_replace("'","",str_replace(" ","_",$sLastName));
      $sFirstNameFormatted = str_replace("'","",str_replace(" ","_",$sFirstName));
      $sSiteCode = $oSiteCtrl->generateSiteCode("HOME_".$sFirstNameFormatted."_".$sLastNameFormatted);
      // The log below enables to make a list of some common special characters in HR lastnames
      if(!preg_match("/^[_0-9a-zA-Z]*$/",$sSiteCode)){
        $this->log()->info(["method"=>__METHOD__,"message"=>"Warning, some special characters in site code ".$sSiteCode]);
      }
      // Build the HR
      $aHR=array(
        "lastname"=>$sLastName,
        "firstname"=>$sFirstName,
        "gender"=>$sGender,
        "details"=>array("HCP"=>$sHCP),
        "POIs"=>array(),
        "demands"=>array(),
        "siteCode"=>$sSiteCode
      );
      // In case a POI is provided without latitude or without longitude, we can not insert it in the list of POIs
      if($aHomePOI["lat"]!="" && $aHomePOI["lon"]!=""){
        $aHR["POIs"][]=$aHomePOI;
      }
      if($aRDVPOI["lat"]!="" && $aRDVPOI["lon"]!=""){
        $aHR["POIs"][]=$aRDVPOI;
      }
      // The position field enables to know which POI shall be considered as the home POI for the transport demands
      // For instance if both $aHomePOI and $aRDVPOI are valid, the considered POI in transport demands will be $aRDVPOI
      if(array_sum($aDemands)>0){
        // Insert a new demand when it contains at least one timeslot in the week
        $aDemands["position"] = count($aHR["POIs"]);
        $aHR["demands"][]=$aDemands;
      }
      $aHRs[]=$aHR;
    }
    else{
      // This case corresponds to an already inserted HR : in that case the lastname and firstname are ommited in the CSV
      //   file and we reuse the HR that was inserted at the last position of $aHRs input array
      $index = count($aHRs)-1;
      if($aHomePOI["lat"]!="" && $aHomePOI["lon"]!=""){
        $aHRs[$index]["POIs"][]=$aHomePOI;
      }
      if($aRDVPOI["lat"]!="" && $aRDVPOI["lon"]!=""){
        $aHRs[$index]["POIs"][]=$aRDVPOI;
      }
      if(array_sum($aDemands)>0){
        // Insert a new demand when it contains at least one timeslot in the week
        $aDemands["position"] = count($aHRs[$index]["POIs"]);
        $aHRs[$index]["demands"][]=$aDemands;
      }
    }
  }

  /**
   * Check that the parsed data implies no duplicated names with names that are already present in hr_main and
   *   user_main tables. With the current version of the code, we can not handle such case.
   * @param array $aHRs : parsed HRs from CSV file
   */
  public function checkNames($aHRs){
    $oImportDAO = new \OSS\Model\ImportDAO();
    $aAlreadyUsedNames = $oImportDAO->checkNames($aHRs);
    if(count($aAlreadyUsedNames)>0){
      throw new \OSS\AppException(
        "Import from CSV failed because the following user already exists in database: ".
        $aAlreadyUsedNames[0]["firstname"]." ".$aAlreadyUsedNames[0]["lastname"],
        \OSS\AppException::INVALID_INPUT_DATA
      );
    }
    // Check that all site codes are unique in the new data (enable to make sure the new data does not contain
    //   2 HRs with the same firstname and lastname)
    $aSiteCodes = array();
    foreach($aHRs as $aHR){
      if(array_key_exists($aHR['siteCode'],$aSiteCodes)){
        throw new \OSS\AppException(
          "Import from CSV failed because the following user is present twice or more in the input data: ".
          $aHR["firstname"]." ".$aHR["lastname"],
          \OSS\AppException::INVALID_INPUT_DATA
        );
      }
      else{
        $aSiteCodes[$aHR['siteCode']]=1;
      }
    }
  }

  /**
   * Turn the parsed array of HRs + the input institution code into a set of SQL queries
   * @param array $aHRs : array of parsed HRs
   * @param string $sInstitutionCode : code for the concerned institution
   * @return string : a set of SQL queries
   */
  public function buildSQL($aHRs,$sInstitutionCode){
    $oImportDAO = new \OSS\Model\ImportDAO();
    $sResult  = $oImportDAO->generateHRMainSQL($aHRs);
    $sResult .= $oImportDAO->generateHRMainDetailSQL($aHRs);
    $sResult .= $oImportDAO->generateSiteMainSQL($aHRs);
    $sResult .= $oImportDAO->generateHRMainSiteSQL($aHRs,$sInstitutionCode);
    $sResult .= $oImportDAO->generateUserMainSQL($aHRs);
    $sResult .= $oImportDAO->generateUserMainSiteSQL($aHRs,$sInstitutionCode);
    $sResult .= $oImportDAO->generateUserMainHRSQL($aHRs);
    $sResult .= $oImportDAO->generateSitePOISQL($aHRs);
    $sResult .= $oImportDAO->generateTransportDemandSQL($aHRs,$sInstitutionCode);
    $sResult .= $oImportDAO->generateTransportDemandTimeSQL($aHRs);
    // In order to read with more comfort, the line feed are replace by carriage return.
    // A cleaner way would be to return an array of SQL queries to the client and let the
    //   client turn the array into a big SQL query
    $sResult = str_replace("\r\n","\r",$sResult);
    $sResult = str_replace("\n","\r",$sResult);
    $sResult = str_replace("; INSERT",";\rINSERT",$sResult);
    return $sResult;
  }

}