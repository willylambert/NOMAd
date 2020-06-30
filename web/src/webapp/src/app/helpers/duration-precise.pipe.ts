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
  name: 'durationPrecise',
  // in order to detect changes in data
  // see https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
  pure:false
})
export class DurationPrecisePipe implements PipeTransform {

  /**
   * Turn a duration expressed in milliseconds into a duration expressed in seconds and minutes and hours
   * @param input string: duration expressed as a number of milliseconds
   */
  transform(input:string){
    var dt = moment.duration(parseFloat(input));

    if(dt.asMinutes()>=60){
      return dt.hours() + "h" + dt.minutes()+"min"+dt.seconds()+"s";
    }else{
      if(dt.asSeconds()>=60){
        return dt.minutes() + "min"+dt.seconds()+"s";
      }else{
        return dt.seconds() + "s";
      }
    }
  };
}