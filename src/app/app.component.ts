import { Component } from '@angular/core';
import { EventsService } from './events.service';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'angular-buffer-service';
  count = 0;

  constructor(private eventsService: EventsService) {}

  click() {
    console.log('click');

    this.eventsService.send({ name: 'click', data: this.count });
  }
}
