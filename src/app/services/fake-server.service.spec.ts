import { TestBed } from '@angular/core/testing';

import { FakeServerService } from './fake-server.service';

describe('FakeServerService', () => {
  let service: FakeServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FakeServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
