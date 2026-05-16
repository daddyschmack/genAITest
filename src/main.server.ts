import { bootstrapApplication, BootstrapContext } from '@angular/platform-browser';
import { BootstrapOptions } from '@angular/core';
import { App } from './app/app';
import { config } from './app/app.config.server';

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context);

export default bootstrap;
