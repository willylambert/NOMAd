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
 *  Class to handle DB access for Thesaurus access
 *  @creationdate 2018-09-13
 **/

namespace OSS\Model;

use PDO;

use OSS\BaseObject;

/**
* Class for handling requests to the Thesaurus table in the database.
*/
class ThesaurusDAO extends BaseObject{

  /**
  * Constructor
  */
  function __construct(){
    // We need access to db
    parent::__construct(true);
  }

  /**
  * Get a list of Thesaurus items based on search criteria.
  * The input data array is expected to contain the following fields :
  *   cat
  * @param array $aData : filtering data
  * @return array({object}) : array of Thesaurus object
  **/
  public function list($aData){
    $sCatClause = "";
    if(isset($aData['cat']) && $aData['cat']!= null && $aData['cat']!= ""){
      $sCatQuoted = $this->db()->quote($aData['cat']);
      $sCatClause = " AND cat = $sCatQuoted ";
    }
    $sql = "SELECT id, cat, code, label, orderdisplay, rec_st
              FROM util_thesaurus
             WHERE rec_st<>'D'
                   $sCatClause";
    $result = $this->db()->query($sql);
    return $result->fetchAll(PDO::FETCH_ASSOC);
  }

  /**
  * Get some details about a Thesaurus item
  * @param string $sThesaurusID : Thesaurus item identifier
  * @return array with id, cat, code, label, rec_st fields
  */
  public function get($sThesaurusID){
    $sThesaurusIDQuoted = $this->db()->quote($sThesaurusID);
    $sSQL = "SELECT id, cat, code, label, orderdisplay, rec_st
               FROM util_thesaurus
             WHERE id=$sThesaurusIDQuoted";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }

  /**
  * Get some details about a Thesaurus item, knowing the cat and code values
  * @param string $sCat : Thesaurus category
  * @param string $sCode : Thesaurus code
  * @return array with id, cat, code, label, rec_st fields
  */
  public function getByCode($sCat,$sCode){
    $sCatQuoted = $this->db()->quote($sCat);
    $sCodeQuoted = $this->db()->quote($sCode);
    $sSQL = "SELECT id, cat, code, label, orderdisplay, rec_st
               FROM util_thesaurus
             WHERE cat=$sCatQuoted and code=$sCodeQuoted";
    $oResult = $this->db()->query($sSQL);
    return $oResult->fetch(PDO::FETCH_ASSOC);
  }
}
