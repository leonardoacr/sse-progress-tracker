import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject, Observable, map } from 'rxjs';
import { EventData } from './interfaces/event-data.interface';
import { ISseService } from './interfaces/sse-service.interface';

@Injectable()
export class SseService implements ISseService {
  private eventSubjects: Map<string, Subject<EventData>> = new Map();

  emitEvent(id: string, data: EventData) {
    let eventSubject = this.eventSubjects.get(id);
    if (!eventSubject) {
      eventSubject = new Subject<EventData>();
      this.eventSubjects.set(id, eventSubject);
    }
    eventSubject.next(data);
  }

  clearEvent(id: string) {
    const eventSubject = this.eventSubjects.get(id);
    if (eventSubject) {
      eventSubject.complete();
      this.eventSubjects.delete(id);
    }
  }

  isEventActive(id: string) {
    const eventSubject = this.eventSubjects.get(id);
    if (eventSubject) {
      return true;
    }
  }

  getObservable(eventId: string): Observable<EventData> {
    const eventSubject = this.eventSubjects.get(eventId);
    if (!eventSubject) {
      throw new NotFoundException(`Event stream with ID ${eventId} not found`);
    }
    return eventSubject.asObservable().pipe(map((data) => data));
  }
}
