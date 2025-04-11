import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { OpenaiService } from '@tododay/core/services/openai.service';

describe('OpenaiService', () => {
  let service: OpenaiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [provideHttpClientTesting()],
      providers: [OpenaiService]
    });
    service = TestBed.inject(OpenaiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
