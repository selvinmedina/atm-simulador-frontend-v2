import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { AppModule } from './app.module';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(AppModule),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
  ],
};
