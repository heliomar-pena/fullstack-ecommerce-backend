import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ProductNotificationListener } from './listeners/product-notification.listener';
import { UserRoleChangedListener } from './listeners/user-role-changed.listener';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    ProductNotificationListener,
    UserRoleChangedListener,
  ],
})
export class EventsModule {}
