import { AppComponent } from './app/app.component';
import { appConfig, bootstrapApp } from './bootstrap';

describe('bootstrapApp', () => {
  it('bootstraps the root component with the shared app config', async () => {
    const bootstrap = jasmine.createSpy('bootstrap').and.resolveTo({} as never);

    await bootstrapApp(bootstrap);

    expect(bootstrap).toHaveBeenCalledWith(AppComponent, appConfig);
  });
});
