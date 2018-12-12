import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IQueryResponse<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

@Injectable({
  providedIn: 'root'
})
export class GithubUsersService {
  
  constructor(
    private httpClient: HttpClient
  ) {}
  
  search(params: HttpParams): Observable<IQueryResponse<any>>{
    return this.httpClient.get<IQueryResponse<any>>('http://api.github.com/search/users', {params});
  }
}
