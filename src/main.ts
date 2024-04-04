import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { APP_INITIALIZER } from '@angular/core';
import { initFlowbite } from 'flowbite';

bootstrapApplication(AppComponent, {
  providers: [
    appConfig.providers,
    {
      provide: APP_INITIALIZER,
      useFactory: () => initFlowbite,
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
