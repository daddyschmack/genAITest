import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHashbrown } from '@hashbrownai/angular';

// Notice we spread the providers from appConfig so we don't overwrite them
bootstrapApplication(App, {
  providers: [
    ...appConfig.providers, // Ensure all the core Angular providers are included
    provideHashbrown({
      baseUrl: '/api/chat',
      emulateStructuredOutput: false
    })
  ],
})
  .catch((err) => console.error(err));
