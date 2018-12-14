import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GithubUsersService } from '@app/services/github-users.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest, empty } from 'rxjs';
import { map, tap, distinctUntilChanged, filter, switchMap, catchError, share, takeWhile, skipWhile  } from 'rxjs/operators';

interface IPagination {
  page: number;
  perPage: number;
  totalItems: number;
}

const DEFAULT_PAGINATION: IPagination = { 
  page: 1,
  perPage: 10,
  totalItems: 0 
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  public searchForm: FormGroup = this.formBuilder.group({
    term: ['', Validators.required]
  });;

  public users$: Observable<Array<any>>;

  private loading$$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading$: Observable<boolean> = this.loading$$.asObservable();
  
  private submittingForm$$: BehaviorSubject<FormGroup> = new BehaviorSubject(this.searchForm);
  public submittingForm$: Observable<FormGroup> = this.submittingForm$$.asObservable();
  
  private pagination$$: BehaviorSubject<IPagination> = new BehaviorSubject(DEFAULT_PAGINATION);
  public pagination$: Observable<IPagination> = this.pagination$$.asObservable();
  
  constructor(
    private githubUsersService: GithubUsersService,
    private formBuilder: FormBuilder
  ) {}
  

  ngOnInit () {
    
    this.users$ = combineLatest(
      this.submittingForm$,
      this.pagination$.pipe(distinctUntilChanged((prev, next) => {
        return prev.page === next.page && prev.perPage === next.perPage;
      }))
      ).pipe(
        filter(([form, pagination]) => form.valid),
        switchMap(([form, pagination]) => {
          
          let params = new HttpParams()
            .set('q', form.value.term)
            .set('page', pagination.page.toString())
            .set('per_page', pagination.perPage.toString());
          
          return this.githubUsersService.search(params).pipe(
            tap(result => {
              this.loading$$.next(false);
              this.pagination$$.next({ ...this.pagination$$.value, totalItems: result.total_count});
            }),
            map(result => result.items),
            catchError((err, caught) => {
              console.log('ERROR: ', err.error.message);
              return empty();
            })
          );

        }),
        share()
    );
    
  }

  onSubmitForm() {
    this.loading$$.next(true);
    this.submittingForm$$.next(this.searchForm);
  }

  onChangePage(page: number) {
    this.loading$$.next(true);
    this.pagination$$.next({ 
      ...this.pagination$$.value,
      page: page
    });
  }
}
