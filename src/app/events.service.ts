import { Injectable } from '@angular/core';
import {
  bufferCount,
  bufferWhen,
  delay,
  EMPTY,
  race,
  Subject,
  switchMap,
} from 'rxjs';

export interface IEventDto {
  name: string;
  data: number;
}

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private DELAY = 1000;
  private EVENTS_COUNT_BEFORE_SEND = 100;

  private eventsObs = new Subject<IEventDto>();
  eventsObs$ = this.eventsObs.asObservable();

  constructor() {
    this.eventsObs$
      .pipe(
        bufferWhen(() =>
          race([
            this.eventsObs$.pipe(delay(this.DELAY)),
            this.eventsObs$.pipe(bufferCount(this.EVENTS_COUNT_BEFORE_SEND)),
          ])
        ),
        switchMap((events) => {
          console.log('events', events);
          // here we can send it to a remote db or do what we want

          return EMPTY;
        })
      )
      .subscribe();
  }

  send(event: IEventDto) {
    this.eventsObs.next(event);
  }
}
