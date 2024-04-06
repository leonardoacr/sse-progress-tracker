import { Controller, Get, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { _FAKE_TOKEN } from './_FAKE_TOKEN';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  get(@Headers() headers: Headers) {
    // const token = headers['authorization'];
    const token = _FAKE_TOKEN;
    return this.appService.get(token);
  }
}
