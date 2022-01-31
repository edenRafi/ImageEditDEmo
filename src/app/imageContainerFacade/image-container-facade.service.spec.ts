import { TestBed } from '@angular/core/testing';

import { ImageContainerFacadeService } from './image-container-facade.service';

describe('ImageContainerFacadeService', () => {
  let service: ImageContainerFacadeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageContainerFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
