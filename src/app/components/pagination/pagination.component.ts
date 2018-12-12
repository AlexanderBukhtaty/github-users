import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

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
    if (this._page !== changes.page.currentValue && changes.page.currentValue >= 1 && changes.page.currentValue <= this.getTotalPages()) {
      this._page = changes.page.currentValue;
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
