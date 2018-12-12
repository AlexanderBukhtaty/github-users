import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GithubUsersService } from '@app/services/github-users.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  public state = {
    loading: false,
    pagination: {
      page: 1,
      perPage: 10,
      totalItems: 0
    }
  };

  public searchForm: FormGroup;
  public users = [];
  
  constructor(
    private githubUsersService: GithubUsersService,
    private formBuilder: FormBuilder
  ) {
    this.searchForm = this.formBuilder.group({
      term: ['', Validators.required]
    })
  }

  loadData() {
    this.state.loading = true;
    let params = new HttpParams()
      .set('q', this.searchForm.value.term)
      .set('page', this.state.pagination.page.toString())
      .set('per_page', this.state.pagination.perPage.toString());
    this.githubUsersService.search(params).toPromise().then((response) => {
      this.users = response.items;
      this.state.pagination.totalItems = response.total_count;
      this.state.loading = false;
    }).catch(() => {
      console.log('Something went wrong!');
      this.state.loading = false;
    })
  }

  onSubmitForm() {
    if (this.searchForm.valid && !this.state.loading) {
      this.loadData()
    }
  }

  onChangePage(page: number) {
    this.state.pagination.page = page;
    this.loadData()
  }
}
