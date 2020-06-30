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
 *  Class for handling mass import data in the data
 *  @creationdate 2019-08-13
 **/

namespace OSS\Model;

use PDO;
use Exception;

use OSS\BaseObject;

class ImportDAO extends BaseObject{

  /**
  * Constructor
  **/
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
   * Generate a set of SQL INSERT queries that enable to insert some new HRs into hr_main table
   * @param array $aHRs : array of new HRs with lastname, firstname and gender (H/F)
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateHRMainSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sGenderCodeQuoted = $this->db()->quote($aHR['gender']);
      $sResult.= "INSERT INTO hr_main (lastname,firstname,gender_th,type_th,status_th)
                       VALUES (
                                $sLastNameQuoted,
                                $sFirstNameQuoted,
                                (SELECT id FROM util_thesaurus WHERE cat='HR_MAIN_GENDER' AND code=$sGenderCodeQuoted),
                                (SELECT id FROM util_thesaurus WHERE cat='HR_MAIN_TYPE' AND code='USER'),
                                (SELECT id FROM util_thesaurus WHERE cat='HR_MAIN_STATUS' AND code='ENABLED')
                              ) RETURNING id; ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to insert some new HRs details into hr_maindetail table
   * @param array $aHRs : array of new HRs with lastname, firstname and HCP (FAUTEUIL/MARCHANT)
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateHRMainDetailSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sTransportModeCodeQuoted = $this->db()->quote($aHR['details']['HCP']);
      $sPickupDuration = ($sTransportModeCodeQuoted=="FAUTEUIL")?"180":"45";
      $sDeliveryDuration = ($sTransportModeCodeQuoted=="FAUTEUIL")?"180":"45";
      $sResult .= "INSERT INTO hr_maindetail (hr_main_id,transportmode_th,pickup_duration,delivery_duration)
                   VALUES (
                            (SELECT id from hr_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                            (SELECT id FROM util_thesaurus WHERE cat='HR_MAIN_TRANSPORTMODE' AND code=$sTransportModeCodeQuoted),
                            $sPickupDuration,
                            $sDeliveryDuration
                          ); ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to insert the home sites for new HRs into site_main table
   * @param array $aHRs : array of new HRs with siteCode and firstname
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateSiteMainSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sResult .= "INSERT INTO site_main (code,label,type_th,status_th)
                        VALUES (
                                 $sSiteCodeQuoted,
                                 $sFirstNameQuoted,
                                 (SELECT id FROM util_thesaurus WHERE cat='SITE_MAIN_TYPE' AND code='HOME'),
                                 (SELECT id FROM util_thesaurus WHERE cat='SITE_MAIN_STATUS' AND code='ENABLED')
                                ); ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to link the new HRs to their home sites (hr_mainsite table)
   * Also generate the set of SQL INSERT queries that enable to link the new HRs to their institution site
   * @param array $aHRs : array of new HRs with lastname, firstname and siteCode
   * @param string $sInstitutionSiteCode : the institution code
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateHRMainSiteSQL($aHRs,$sInstitutionSiteCode){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      $sResult .= "INSERT INTO hr_mainsite (hr_main_id,site_main_id,type_th)
                        VALUES (
                                 (SELECT id from hr_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                                 (SELECT id from site_main WHERE code=$sSiteCodeQuoted),
                                 (SELECT id FROM util_thesaurus WHERE cat='HR_MAINSITE_TYPE' AND code='HOME')
                                ); ";
    }
    $sInstitutionSiteCodeQuoted = $this->db()->quote($sInstitutionSiteCode);
    foreach($aHRs as $aHR){
        $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
        $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
        $sResult .= "INSERT INTO hr_mainsite (hr_main_id,site_main_id,type_th)
                          VALUES (
                                  (SELECT id from hr_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                                  (SELECT id FROM site_main WHERE site_main.code=$sInstitutionSiteCodeQuoted),
                                  (SELECT id FROM util_thesaurus WHERE cat='HR_MAINSITE_TYPE' AND code='INSTITUTION')
                                ); ";
      }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to create some users corresponding to the new HRs
   * @param array $aHRs : array of new HRs with lastname, firstname
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateUserMainSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sResult .= "INSERT INTO user_main (login,passwd,firstname,lastname,status_th,type_th)
                   VALUES (
                    (SELECT SUBSTRING(MD5(CAST(RANDOM() as text)) FROM 1 FOR 8)),
                    (SELECT public.CRYPT(SUBSTRING(MD5(CAST(RANDOM() as text)) FROM 1 FOR 8),public.gen_salt('bf')::text)),
                    $sFirstNameQuoted,
                    $sLastNameQuoted,
                    (SELECT id FROM util_thesaurus WHERE cat='USER_MAIN_STATUS' AND code='ENABLED'),
                    (SELECT id FROM util_thesaurus WHERE cat='USER_MAIN_TYPE' AND code='CLIENT')
                   ) RETURNING id; ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to link the new users to their home sites (user_mainsite table)
   * Also generate the set of SQL INSERT queries that enable to link the new users to their institution site
   * @param array $aHRs : array of new HRs with lastname, firstname and siteCode
   * @param string $sInstitutionSiteCode : the institution code
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateUserMainSiteSQL($aHRs,$sInstitutionSiteCode){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      $sResult .= "INSERT INTO user_mainsite (user_main_id,site_main_id)
                   VALUES (
                      (SELECT id FROM user_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                      (SELECT id from site_main WHERE code=$sSiteCodeQuoted)
                   ); ";
    }
    $sInstitutionSiteCodeQuoted = $this->db()->quote($sInstitutionSiteCode);
    foreach($aHRs as $aHR){
        $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
        $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
        $sResult .= "INSERT INTO user_mainsite (user_main_id,site_main_id)
                     VALUES (
                        (SELECT id FROM user_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted ),
                        (SELECT id from site_main WHERE code=$sInstitutionSiteCodeQuoted)
                     ); ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to link the new users to the corresponding HRs (user_mainhr table)
   * @param array $aHRs : array of new HRs with lastname, firstname
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateUserMainHRSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sResult .= "INSERT INTO user_mainhr (user_main_id,hr_main_id)
                   VALUES (
                      (SELECT id FROM user_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                      (SELECT id FROM hr_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted)
                   ); ";
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to create some POIs for the new HRs
   * Each input HR must contain a POIs field with a collection of POIs, and each POI must contain the following fields:
   *   label, addr1, addr2, postcode, city, lon, lat
   * @param array $aHRs : array of new HRs with siteCode and POIs fields
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateSitePOISQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      // The position of the POI is an internal index for the current HR, that must start with 1 and that
      //   will be incremented at each POI
      $iPosition = 1;
      foreach($aHR["POIs"] as $aPOI){
        $sLabelQuoted = $this->db()->quote($aPOI['label']);
        $sAddr1Quoted = $this->db()->quote($aPOI['addr1']);
        $sAddr2Quoted = $this->db()->quote($aPOI['addr2']);
        $sPostCodeQuoted = $this->db()->quote($aPOI['postcode']);
        $sCityQuoted = $this->db()->quote($aPOI['city']);
        $sGeometryAsTextQuoted = $this->db()->quote("POINT(".$aPOI['lon']." ".$aPOI['lat'].")");
        // Hardcoded as requested by our experts
        $sServiceDuration="120";
        $sResult .= "INSERT INTO site_poi (site_main_id,position,label,addr1,addr2,postcode,city,country_th,geom,service_duration)
                     VALUES (
                                (SELECT id FROM site_main WHERE code=$sSiteCodeQuoted),
                                $iPosition,
                                $sLabelQuoted,
                                $sAddr1Quoted,
                                $sAddr2Quoted,
                                $sPostCodeQuoted,
                                $sCityQuoted,
                                (SELECT id FROM util_thesaurus WHERE cat='SITE_POI_COUNTRY' AND code='FR'),
                                public.ST_GeomFromText($sGeometryAsTextQuoted),
                                $sServiceDuration
                     ); ";
        $iPosition++;
      }
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to create some transport demands for the new HRs
   * Each input HR must contain a demands field with a collection of demands, and each demand must contain
   *   a position field that indicates the position of the POI to use as the home position (reference to the
   *   position field of the site_poi table)
   * @param array $aHRs : array of new HRs with siteCode, lastname, firstname and demands fields
   * @param string $sInstitutionSiteCode : the institution code
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateTransportDemandSQL($aHRs,$sInstitutionSiteCode){
    $sResult = "";
    $sInstitutionSiteCodeQuoted = $this->db()->quote($sInstitutionSiteCode);
    foreach($aHRs as $aHR){
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      // The validity period for the transport demand is not currently used in the application.
      // In the current version we set a duration of 1 year and make the period start 10 days in the past
      // We make sure the received dates are expressed at 0h (server time)
      $oCalendarCtrl = new \OSS\Ctrl\CalendarCtrl();
      $iStartDate=round($oCalendarCtrl->setToMidnight((time()-10*24*3600)*1000)/1000);
      $iEndDate=round($oCalendarCtrl->setToMidnight((time()+355*24*3600)*1000)/1000);
      foreach($aHR["demands"] as $aDemand){
        $sPositionQuoted = $this->db()->quote($aDemand['position']);
        $sResult.="INSERT INTO transport_demand (site_poi_id_institution,site_poi_id_hr,hr_main_id,start_dt,end_dt)
                   VALUES (
                    (SELECT site_poi.id FROM site_poi INNER JOIN site_main ON site_poi.site_main_id = site_main.id
                      WHERE site_main.code=$sInstitutionSiteCodeQuoted AND position=1),
                    (SELECT site_poi.id FROM site_poi INNER JOIN site_main ON site_poi.site_main_id = site_main.id
                      WHERE code=$sSiteCodeQuoted AND position=$sPositionQuoted),
                    (SELECT id FROM hr_main WHERE lastname=$sLastNameQuoted AND firstname=$sFirstNameQuoted),
                    $iStartDate,
                    $iEndDate
                   ); ";
      }
    }
    return $sResult;
  }

  /**
   * Generate a set of SQL INSERT queries that enable to create some transport demands timeslots for the new HRs
   * Each input HR must contain a demands field with a collection of demands, and each demand must contain:
   *   - a position field that indicates the position of the POI to use as the home position (reference to the
   *     position field of the site_poi table)
   *   - other fields among the following : [MONDAY/TUESDAY/WEDNESDAY/THURSDAY/FRIDAY]_[AM/PM] that indicate the
   *     possible timeslots in the week and that will be set to 1 if the timeslot is part of the transport demand
   *     and to 0 or null if the timslot is not part of the transport demand
   * @param array $aHRs : array of new HRs with siteCode and demands fields
   * @return string : a set of SQL queries, using "; " as a delimiter
   */
  public function generateTransportDemandTimeSQL($aHRs){
    $sResult = "";
    foreach($aHRs as $aHR){
      $sSiteCodeQuoted = $this->db()->quote($aHR['siteCode']);
      foreach($aHR["demands"] as $aDemand){
        $sPositionQuoted = $this->db()->quote($aDemand['position']);
        foreach($aDemand as $sTimeslotCode=>$value){
          if($sTimeslotCode!="position" && $value=="1"){
            // By default, use no start_hr and no end_hr (unlimited time period)
            $sTimeslotCodeQuoted = $this->db()->quote($sTimeslotCode);
            $sResult .= "INSERT INTO transport_demandtime (transport_demand_id,timeslot_th)
                         VALUES (
                          (SELECT transport_demand.id
                           FROM transport_demand
                           LEFT JOIN site_poi ON site_poi.id=transport_demand.site_poi_id_hr
                           LEFT JOIN site_main ON site_main.id=site_poi.site_main_id
                           WHERE code=$sSiteCodeQuoted AND position=$sPositionQuoted),
                          (SELECT id FROM util_thesaurus WHERE cat='TIMESLOT' and code=$sTimeslotCodeQuoted)
                         ); ";
          }
        }
      }
    }
    return $sResult;
  }

  /**
   * Function that will check whether which firstname+lastname are already in use in hr_main and user_main tables
   * The function will return a set of concerned HRs or users
   * @param array $aHRs : set of HRs
   * @return array : set of HRs and Users mixed with id, lastname and firstname fields
   */
  public function checkNames($aHRs){
    $sList = "";
    foreach($aHRs as $aHR){
      if($sList !=""){
        $sList .= " OR ";
      }
      $sLastNameQuoted = $this->db()->quote($aHR['lastname']);
      $sFirstNameQuoted = $this->db()->quote($aHR['firstname']);
      $sList .= " ( lastname = $sLastNameQuoted AND firstname = $sFirstNameQuoted ) ";
    }
    $aHRsOrUsersInBase = array();
    // Reserved to admins
    if($sList!="" && $this->isAdmin()){
      $sSQL = "SELECT id,lastname,firstname FROM hr_main WHERE $sList";
      $oResult = $this->db()->query($sSQL);
      $aHRsOrUsersInBase = $oResult->fetchAll(PDO::FETCH_ASSOC);
      $sSQL = "SELECT id,lastname,firstname FROM user_main WHERE $sList";
      $oResult = $this->db()->query($sSQL);
      $aHRsOrUsersInBase = array_merge($aHRsOrUsersInBase,$oResult->fetchAll(PDO::FETCH_ASSOC));
    }
    return $aHRsOrUsersInBase;
  }

}