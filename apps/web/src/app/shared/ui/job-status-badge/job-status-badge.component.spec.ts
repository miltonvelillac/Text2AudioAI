import { TestBed } from '@angular/core/testing';

import { JobStatusBadgeComponent } from './job-status-badge.component';

describe('JobStatusBadgeComponent', () => {
  it('renders the status label and tone', async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusBadgeComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(JobStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'completed');
    fixture.detectChanges();

    const badge = fixture.nativeElement.querySelector('.status-badge') as HTMLSpanElement;

    expect(badge.textContent).toContain('Completed');
    expect(badge.getAttribute('data-tone')).toBe('success');
  });
});
