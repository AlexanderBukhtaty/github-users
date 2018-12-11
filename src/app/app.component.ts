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
    loading: false
  };

  public form = {
    term: ''
  }
  
  public users = [];
  
  constructor(
    private githubUsersService: GithubUsersService
  ) {

  }
  
  onSubmitForm() {
    this.state.loading = true;
    let params = new HttpParams()
    .set('q',this.form.term)
    .set('page', '1')
    .set('per_page', '10');
    this.githubUsersService.search(params).toPromise().then((response) => {
      this.users = response.items;
      this.state.loading = false;
    })
  }
}
