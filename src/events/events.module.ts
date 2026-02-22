import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { ProductNotificationListener } from './listeners/product-notification.listener';

@Module({
  controllers: [EventsController],
  providers: [EventsService, ProductNotificationListener],
})
export class EventsModule {}
