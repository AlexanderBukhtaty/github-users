import { HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PAGINATION, IPagination } from '@app/components/pagination/pagination.component';
import { GithubUsersService } from '@app/services/github-users.service';
import { BehaviorSubject, Observable, Subject, throwError, of, merge } from 'rxjs';
import { catchError, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

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
  // private dataState$$: BehaviorSubject<IData> = new BehaviorSubject({ state: STATES.READY, data: {} });
  // public dataState$: Observable<IData> = this.dataState$$.asObservable();
  private dataState$$: Subject<IData> = new Subject();
  public dataState$: Observable<IData>;

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
    this.dataState$ = merge(
      this.dataState$$.asObservable().pipe(startWith({ state: STATES.READY, data: {} })),
      this.submittingForm$.pipe(
        filter(form => form.valid),
        switchMap((form) => this.pagination$.pipe(
          startWith({ ...DEFAULT_PAGINATION }),
          switchMap(pagination => this.search(form, pagination))
        ))
      )
    ).pipe(
      catchError(err => of(this._createState(STATES.ERROR, err)))
    );

  }
  
  
  /**
   * Метод с логикой поиска
   */
  search (form: FormGroup, pagination: IPagination): Observable<IData> {
    
    this.dataState$$.next(this._createState(STATES.LOADING));
    
    let params = new HttpParams()
      .set('q', form.value.term)
      .set('page', pagination.page.toString())
      .set('per_page', pagination.perPage.toString());

    return this.githubUsersService.search(params).pipe(
      map(result => {
        let data = {
          users: result.items,
          pagination: { ...pagination, totalItems: result.total_count }
        };
        return this._createState(STATES.READY, data);
      }),
      catchError((error) => {
        return throwError(error);
      })
    );    

  }

  
  // Обработка отправки формы
  onSubmitForm(): void {
    this.submittingForm$$.next(this.searchForm);
  }

  
  // Обработка изменения страницы
  onChangePage(page: number): void {
    this.pagination$$.next({ ...DEFAULT_PAGINATION, page: page });
  }
  

  // Метод генерации стейта
  private _createState(stateCode: STATES, data?: any): IData {
    return { 
      state: stateCode, 
      data: data ? data : null
    };
  }
}

// BehaviourSubject = Subject + startWith