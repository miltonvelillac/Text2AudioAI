import { ChangeDetectionStrategy, Component } from '@angular/core';

import { JobStudioComponent } from './features/job-studio/job-studio.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [JobStudioComponent],
  template: '<app-job-studio />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
