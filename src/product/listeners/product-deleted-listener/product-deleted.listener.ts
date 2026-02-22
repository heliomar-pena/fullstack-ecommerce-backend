import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  PRODUCT_DELETED_COMPLETION_EVENT_KEY,
  ProductDeletedCompletionEvent,
} from 'src/product/events/product-deleted-completion-event';
import {
  PRODUCT_DELETED_EVENT_KEY,
  ProductDeletedEvent,
} from 'src/product/events/product-deleted.event';
import { ProductAttributeRepository } from 'src/product/product-attribute.repository';

@Injectable()
export class ProductDeletedListener {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
    private eventEmitter: EventEmitter2,
  ) {}

  @OnEvent(PRODUCT_DELETED_EVENT_KEY)
  async handleProductDeletedEvent(event: ProductDeletedEvent) {
    await this.productAttributeRepository.deleteAllProductAttributes(event.id);

    this.eventEmitter.emit(
      PRODUCT_DELETED_COMPLETION_EVENT_KEY,
      event satisfies ProductDeletedCompletionEvent,
    );
  }
}
