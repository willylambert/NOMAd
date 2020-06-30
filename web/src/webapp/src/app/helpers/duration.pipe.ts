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

import * as moment from 'moment';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  // in order to detect changes in data
  // see https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
  pure:false
})
export class DurationPipe implements PipeTransform {

  /**
   * Turn a duration expressed in milliseconds into a duration expressed in minutes and hours
   * @param input string: duration expressed as a number of milliseconds
   */
  transform(input:string){
    if(input=="" || input == undefined){
      return "";
    }

    var dt = moment.duration(parseFloat(input));

    // Get the number of hours and minutes for display. The number of seconds is not displayed
    //   but is taken into account for the computation of the number of minutes
    var seconds = dt.seconds();
    var minutes = dt.minutes();
    var hours = dt.hours();
    // Round to the closest minute
    if(seconds>=30){
      minutes+=1;
    }
    // Make sure the number of minutes belong to [0-59]
    if(minutes>=60){
      minutes-=60;
      hours+=1;
    }
    if(hours>0){
      // add a left padding 0 to the minutes if necessary
      var minutesString = minutes.toString();
      if(minutes<10){
        minutesString="0"+minutesString;
      }
      return hours + " h" + minutesString;      
    }
    else{
      return minutes + " min";
    }
  };
}