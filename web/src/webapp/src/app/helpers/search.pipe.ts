import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe that enables to filter a collection of objects by searching on a specific field
 * 
 * For instance:
 *   myBag=[
 *     {name:'potatoe',taste:'good'},
 *     {name:'carrot',taste:'bad'},
 *     {name:'cherry',taste:'delicious'}
 *  ]
 * 
 * Use example:
 *    *ngFor="let item of myBag | search:'taste':'delicious'"
 * 
 * The filtered list is:
 *   myFilteredBag=[
 *     {name:'cherry',taste:'delicious'}
 *  ]
 * 
 * Use of ngIf filter is a better alternative to this filter, but in some cases, our search best meets or needs,
 * for instance *ngFor="let item of myBag | search:'taste':'delicious' ; let i=index" enables to give an index starting
 * from 0 on every delicious items.
 */
@Pipe({
  name: 'search',
  // in order to detect changes in data
  // see https://stackoverflow.com/questions/34456430/ngfor-doesnt-update-data-with-pipe-in-angular2
  pure:false
})
export class SearchPipe implements PipeTransform {
  transform(inputArray:any[],key:string,value:any){
    var result=[];
    for(let item of inputArray){
      if(item[key]==value){
        result.push(item)
      }
    }
    return result;
  };
}