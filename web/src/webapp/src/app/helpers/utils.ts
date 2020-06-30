import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import * as moment from  'moment';

export class Utils{

  static ngbDateToMoment(dt:NgbDate){
    return moment().set({year:dt.year,month:dt.month-1,date:dt.day}).startOf("day");
  }

  static momentToNgbDate(dt:moment.Moment): NgbDate{
    return new NgbDate(dt.year(),dt.month()+1,dt.date());
  }
}