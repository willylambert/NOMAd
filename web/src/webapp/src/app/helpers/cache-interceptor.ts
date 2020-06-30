import { Injectable } from '@angular/core';  
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';  
import { Observable, of } from 'rxjs';  
import { tap } from 'rxjs/operators';  
import { CacheService } from './cache-service';  
  
  
@Injectable()  
export class CacheInterceptor implements HttpInterceptor {  
  
  constructor(private cacheService: CacheService) { }  
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {  
  
    // pass along non-cacheable requests and invalidate cache  
    if(req.method !== 'GET' || this.cacheService.isUrlHaveCacheEnabled(req.url)!==true) {  
      return next.handle(req);  
    }  
  
    // attempt to retrieve a cached response  
    const cachedResponse: HttpResponse<any> = this.cacheService.get(req.urlWithParams);  
  
    // return cached response  
    if (cachedResponse) {  
      return of(cachedResponse);  
    }      
  
    // send request to server and add response to cache  
    return next.handle(req)  
      .pipe(  
        tap(event => {  
          if (event instanceof HttpResponse) {  
            this.cacheService.put(req.urlWithParams, event);  
          }  
        })  
      );  
  
  }  
} 