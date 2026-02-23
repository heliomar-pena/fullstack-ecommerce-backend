import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  USER_ROLE_CHANGED_EVENT_KEY,
  UserRoleChangedEvent,
} from '../../user/events/user-role-changed.event';
import { EventsService } from '../events.service';

@Injectable()
export class UserRoleChangedListener {
  constructor(private readonly eventsService: EventsService) {}

  @OnEvent(USER_ROLE_CHANGED_EVENT_KEY)
  handleUserRoleChangedEvent(event: UserRoleChangedEvent) {
    this.eventsService.sendEvent(event.id, USER_ROLE_CHANGED_EVENT_KEY, {
      message: `Your roles has been updated to ${(event.roles ?? []).map((role) => role.name).join(', ')}`,
    });
  }
}
