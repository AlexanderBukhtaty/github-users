import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IGitHubUser {
  avatar_url: string;
  login: string;
  html_url: string;
}

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

  search(params: HttpParams): Observable<IQueryResponse<IGitHubUser>>{
    return this.httpClient.get<IQueryResponse<any>>('http://api.github.com/search/users', {params});
  }
}
