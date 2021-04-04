import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @EventPattern('greet')
  public onEventPattern(): string {
    return 'Hello!';
  }

  @MessagePattern({event: 'greet'})
  public onMessagePattern(): string {
    return 'Hello!';
  }
}