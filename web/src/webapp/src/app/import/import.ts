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

import {Component } from '@angular/core';
import { ImportService } from './import.service';
import { SiteService } from '../site/site.service';
import { Site } from '../site/site';

@Component({
  selector: 'app-import',
  templateUrl: './import.html',
  styleUrls: ['./import.scss']
})
export class Import {

  // The file chosen by user through the file selection interface
  file:File;

  // The list of institutions, since a CSV file is valid for a given institution
  sites:Site[];

  // The selected institution
  site:Site;

  // The result of the CSV to SQL conversoion, that will be displayed in a text area
  sql:string;

  // Some options
  options:{bWithInstructions:boolean};

  constructor(protected importService:ImportService,public siteService:SiteService) {
    this.options={bWithInstructions:false}
    // Load existing institutions
    this.siteService.list({
      typeCode: "INSTITUTION", statusCode: null, search: "", startIndex: null, length: null
    }).subscribe(sites => {
      this.sites = sites
    });
  }

  /**
   * Start the CSV to SQL conversion.
   * In the present version, we do not trigger automatically SQL queries from a CSV
   * The SQL queries have to be checked first by an administrator and to be applied manually.
   */
  import(){
    const myFormData:FormData = new FormData();
    // First argument is the key to get retrieve the updloaded files on server among all uploaded files
    // Second parameter is a reference to the file that will enable the file content upload
    // Third parameter is the name of the file, in which we put the site code, since we need to pass
    //   the information to the server is the same time as the CSV file content
    myFormData.append("file",this.file,this.site.code);
    this.importService.import(myFormData).subscribe(result=>{
      // The result to this call is a string representing a SQL query, that we display so that it can
      //   be checked by an administrator before applying to database.
      this.sql=result.data as string;
    })
  }

}
