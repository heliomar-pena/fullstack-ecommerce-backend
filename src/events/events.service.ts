import { Injectable } from '@nestjs/common';
import { finalize, interval, map, merge, Observable, Subject } from 'rxjs';

@Injectable()
export class EventsService {
  private userStreams = new Map<number, Subject<any>>();

  #getOrCreateStream(userId: number): Subject<any> {
    const stream = this.userStreams.get(userId);

    if (!stream) {
      const newStream = new Subject<any>();
      this.userStreams.set(userId, newStream);
      return newStream;
    }

    return stream;
  }

  getEvents$(userId: number): Observable<any> {
    const userStream = this.#getOrCreateStream(userId);

    const keepAlive$ = interval(25000).pipe(
      map(() => ({ comment: 'keep-alive' })),
    );

    return merge(userStream.asObservable(), keepAlive$).pipe(
      finalize(() => {
        this.userStreams.delete(userId);
      }),
    );
  }

  sendEvent(userId: number, eventType: string, data = {}) {
    const userStream = this.userStreams.get(userId);
    if (userStream) {
      userStream.next({
        data: {
          eventType,
          ...data,
        },
      });
    }
  }
}
