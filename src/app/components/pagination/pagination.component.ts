import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
  
  @Input()
  set page(v: number) {
    if (this._page !== v && v >= 1 && v <= Math.ceil(this.totalItems / this.perPage)) {
      this._page = v;
    }
  }
  get page(): number {
    return this._page;
  }
  private _page: number = 1;  
  @Input() perPage: number = 1;
  @Input() totalItems: number = 1;
  @Output() onChangePage: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit() {
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
