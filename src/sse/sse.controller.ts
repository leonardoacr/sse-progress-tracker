import { Controller, Sse, Headers } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';
import { EventData } from './interfaces/event-data.interface';
import { _FAKE_TOKEN } from '../_FAKE_TOKEN';

@Controller('sse')
export class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse('application-progress')
  sse(@Headers() headers: Headers): Observable<EventData> {
    // const token = headers['authorization'];
    const token = _FAKE_TOKEN;
    return this.sseService.getObservable(token);
  }
}
