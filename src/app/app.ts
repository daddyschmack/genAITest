import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssistantChat } from './components/assistant-chat/assistant-chat';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AssistantChat],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('genAITest');
}
