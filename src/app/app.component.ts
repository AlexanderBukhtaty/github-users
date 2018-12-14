import { Component, OnInit } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GithubUsersService, IGitHubUser } from '@app/services/github-users.service';
import { IPagination, DEFAULT_PAGINATION } from '@app/components/pagination/pagination.component';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BehaviorSubject, Subject, Observable, empty } from 'rxjs';
import { map, filter, switchMap, catchError, startWith } from 'rxjs/operators';

enum STATES {
  READY = 'READY',
  LOADING = 'LOADING',
  ERROR = 'ERROR'
}

interface IData {
  state: STATES;
  data: any;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  
  // Создаем реактивную форму
  public searchForm: FormGroup = this.formBuilder.group({
    term: ['', Validators.required]
  });;

  
  // Список пользователей
  public users$: Observable<Array<any>>;
  
  // Состояние компонента
  private dataState$$: BehaviorSubject<IData> = new BehaviorSubject({ state: STATES.READY, data: {} });
  public dataState$: Observable<IData> = this.dataState$$.asObservable();  
  
  // Потом отправки формы
  private submittingForm$$: BehaviorSubject<FormGroup> = new BehaviorSubject(this.searchForm);
  public submittingForm$: Observable<FormGroup> = this.submittingForm$$.asObservable();
  
  // Поток изменения значения пагинации
  private pagination$$: Subject<IPagination> = new Subject();
  public pagination$: Observable<IPagination> = this.pagination$$.asObservable();
  
  constructor(
    private githubUsersService: GithubUsersService,
    private formBuilder: FormBuilder
  ) {}
  

  ngOnInit(): void {

    /**
     * Логика обновления списка пользователей
     */
    this.submittingForm$.pipe(
      filter( form => form.valid),
      switchMap((form) => this.pagination$.pipe(
        startWith({...DEFAULT_PAGINATION}),
        switchMap( pagination => this.search(form, pagination))
      )),
    ).subscribe((dataState) => this.dataState$$.next(dataState))
  }
  
  /**
   * Метод с логикой поиска
   */
  search (form: FormGroup, pagination: IPagination): Observable<IData> {
    let params = new HttpParams()
      .set('q', form.value.term)
      .set('page', pagination.page.toString())
      .set('per_page', pagination.perPage.toString());

    return this.githubUsersService.search(params).pipe(
      map(result => {
        return { 
          state: STATES.READY,
          data: {
            users: result.items,
            pagination: { ...pagination, totalItems: result.total_count }
          }
        }
      }),
      catchError((err, caught) => {
        this.dataState$$.next({
          state: STATES.ERROR,
          data: {}
        });
        console.log('ERROR: ', err.error.message);
        return empty();
      })
    );    

  }


  onSubmitForm(): void {
    this.dataState$$.next({ state: STATES.LOADING, data: {} });
    this.submittingForm$$.next(this.searchForm);
  }


  onChangePage(page: number): void {
    this.dataState$$.next({ state: STATES.LOADING, data: {} });
    this.pagination$$.next({
      ...DEFAULT_PAGINATION,
      page: page,
    });
  }

}

// BehaviourSubject = Subject + startWith