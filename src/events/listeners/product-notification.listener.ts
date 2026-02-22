import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PRODUCT_DELETED_COMPLETION_EVENT_KEY,
  ProductDeletedCompletionEvent,
} from 'src/product/events/product-deleted-completion-event';
import { EventsService } from '../events.service';

@Injectable()
export class ProductNotificationListener {
  constructor(private readonly eventsService: EventsService) {}

  @OnEvent(PRODUCT_DELETED_COMPLETION_EVENT_KEY)
  handleProductDeletedCompletionEvent(event: ProductDeletedCompletionEvent) {
    this.eventsService.sendEvent(
      event.userId,
      PRODUCT_DELETED_COMPLETION_EVENT_KEY,
      { message: `Product with ID ${event.id} has been deleted successfully.` },
    );
  }
}
