import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export interface IPagination {
  page: number;
  perPage: number;
  totalItems: number;
}

export const DEFAULT_PAGINATION: IPagination = {
  page: 1,
  perPage: 10,
  totalItems: 0
};

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {
  
  @Input() page: number;
  @Input() perPage: number = 1;
  @Input() totalItems: number = 1;
  @Output() onChangePage: EventEmitter<number> = new EventEmitter();
  private _page: number = 1;  

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.page) {
      if (
        this._page !== changes.page.currentValue &&
        changes.page.currentValue >= 1 &&
        changes.page.currentValue <= this.getTotalPages()
      ) {
        this._page = changes.page.currentValue;
      }
    }
  }
  
  getTotalPages() {
    return Math.ceil(this.totalItems / this.perPage);
  }
  
  previous(e: MouseEvent) {
    e.preventDefault();
    if (this.page <= 1) {
      return;
    }
    this.onChangePage.emit(--this.page)
  }

  next(e: MouseEvent) {
    e.preventDefault();
    if (this.page >= this.getTotalPages()) {
      return;
    }
    this.onChangePage.emit(++this.page)
  }

}
