import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GithubUsersService } from '@app/services/github-users.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map, tap, distinctUntilChanged, filter, switchMap,  } from 'rxjs/operators';

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
  
  public searchForm: FormGroup;

  public users$: Observable<Array<any>>;

  private loading$$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading$: Observable<boolean> = this.loading$$.asObservable();
  
  private submittingForm$$: BehaviorSubject<FormGroup>;
  public submittingForm$: Observable<FormGroup>;
  
  private pagination$$: BehaviorSubject<IPagination>;
  public pagination$: Observable<IPagination>;
  
  constructor(
    private githubUsersService: GithubUsersService,
    private formBuilder: FormBuilder
  ) {}
  

  ngOnInit () {
    
    this.searchForm = this.formBuilder.group({
      term: ['', Validators.required]
    });

    this.submittingForm$$ = new BehaviorSubject(this.searchForm);
    this.pagination$$ = new BehaviorSubject(DEFAULT_PAGINATION);
    this.submittingForm$ = this.submittingForm$$.asObservable();
    this.pagination$ = this.pagination$$.asObservable();

    this.users$ = combineLatest(
      this.submittingForm$$,
      this.pagination$$.pipe(distinctUntilChanged((prev, next) => {
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
            map(result => result.items)
          );
        })
    );
  }

  onSubmitForm() {
    this.loading$$.next(true);
    this.pagination$$.next(DEFAULT_PAGINATION);
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
