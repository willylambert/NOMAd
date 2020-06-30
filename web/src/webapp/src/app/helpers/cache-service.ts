import { Injectable } from '@angular/core';  
import { HttpResponse } from '@angular/common/http';  
  
@Injectable({  
  providedIn: 'root'  
})  
export class CacheService {  
  
  private requests: any = { };  

  private urlsToCache : any = {};
  
  constructor() { }  

  addUrlToCache(url:string){
    this.urlsToCache[url] = true;
  }

  isUrlHaveCacheEnabled(url:string){
    return this.urlsToCache[url];
  }
  
  put(url: string, response: HttpResponse<any>): void {  
    this.requests[url] = response;  
  }  
  
  get(url: string): HttpResponse<any> | undefined {  
    return this.requests[url];  
  }  
  
  invalidateCache(): void {  
    this.requests = { };  
  }  
} 