import { TestBed } from '@angular/core/testing';

import { GithubUsersService } from './github-users.service';

describe('GithubUsersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GithubUsersService = TestBed.get(GithubUsersService);
    expect(service).toBeTruthy();
  });
});
