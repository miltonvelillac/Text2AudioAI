import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { JobStudioComponent } from './features/job-studio/job-studio.component';

describe('AppComponent', () => {
  it('renders the job studio shell', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(JobStudioComponent))).not.toBeNull();
  });
});
