import { provideHttpClient, withFetch } from '@angular/common/http';
import type { ApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';

type BootstrapFn = typeof bootstrapApplication;

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withFetch())],
};

export function bootstrapApp(bootstrap: BootstrapFn = bootstrapApplication) {
  return bootstrap(AppComponent, appConfig);
}
