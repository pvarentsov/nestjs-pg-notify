import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get('greeting')
  public greet(): string {
    return 'Hello!';
  }

}