import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { GithubUsersService } from '@app/services/github-users.service';

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

  public form = {
    term: ''
  }
  
  public users = [];
  
  constructor(
    private githubUsersService: GithubUsersService
  ) {}

  loadData() {
    this.state.loading = true;
    let params = new HttpParams()
      .set('q', this.form.term)
      .set('page', this.state.pagination.page.toString())
      .set('per_page', this.state.pagination.perPage.toString());
    this.githubUsersService.search(params).toPromise().then((response) => {
      this.users = response.items;
      this.state.pagination.totalItems = response.total_count;
      this.state.loading = false;
    })    
  }

  onSubmitForm() {
    this.loadData()
  }

  onChangePage(page: number) {
    this.state.pagination.page = page;
    this.loadData()
  }
}
