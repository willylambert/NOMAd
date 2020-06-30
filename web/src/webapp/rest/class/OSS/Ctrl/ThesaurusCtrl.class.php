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
 *  REST service to handle Thesaurus access
 *  @creationdate 2019-09-13
 **/

namespace OSS\Ctrl;

use OSS\BaseObject;

class ThesaurusCtrl extends BaseObject{

  /**
  * Get a list of Thesaurus items based on search criteria
  * The input data array is expected to contain the following fields :
  *   cat
  * @param array $aData : filtering data
  * @return array({object}) : array of Thesaurus object
  **/
  public function list($aData){
    $oThesaurusDAO = new \OSS\Model\ThesaurusDAO();
    $entries = $oThesaurusDAO->list($aData);

    $this->setResult($entries);

    return $entries;
  }

  /**
  * Get some details about a Thesaurus item
  * @param string $sThesaurusID : Thesaurus item identifier
  * @return array with ID, CAT, CODE, LABEL, REC_ST fields
  */
  public function get($sThesaurusID){
    $oThesaurusDAO = new \OSS\Model\ThesaurusDAO();
    $entry = $oThesaurusDAO->get($sThesaurusID);

    $this->setResult($entry);

    return $entry;
  }

  /**
  * Get some details about a Thesaurus item, knowing the cat and code values
  * @param string $sCat : Thesaurus category
  * @param string $sCode : Thesaurus code
  * @return array with ID, CAT, CODE, LABEL, REC_ST fields
  */
  public function getByCode($sCat,$sCode){
    $oThesaurusDAO = new \OSS\Model\ThesaurusDAO();
    return $oThesaurusDAO->getByCode($sCat,$sCode);
  }

  // ----------------- SPECIFIC SHORTCUTS ---------------

  /**
   * Enables to know quickly whether a timeslot id points to a forward or a backward route.
   * A forward route (from homes to institutions) is also called a morning route.
   * A backward route (from institutions to homes) is also called an afternoob route.
   * @param string $sTimeslotId : points to a thesaurus id corresponding to a timeslot (TIMESLOT category)
   * @return boolean : true if the timeslot points to a morning route, false otherwise
   */
  public function isMorning($sTimeslotId){
    $sEntry = $this->get($sTimeslotId);
    // Get the last 2 characters of the obtained code
    $sHalfDayCode = substr($sEntry['code'],strlen($sEntry['code'])-2,2);
    // The obtained half day code is expected to contain "AM" or "PM"
    return ($sHalfDayCode=="AM");
  }

}