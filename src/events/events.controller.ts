import { Controller, Sse } from '@nestjs/common';
import { EventsService } from './events.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ReqUser } from 'src/auth/decorators/request-user.decorator';
import { RequestUserDto } from 'src/auth/dto/request-user.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Sse('sse')
  @ApiBearerAuth()
  sse(@ReqUser() user: RequestUserDto) {
    return this.eventsService.getEvents$(user.id);
  }
}
