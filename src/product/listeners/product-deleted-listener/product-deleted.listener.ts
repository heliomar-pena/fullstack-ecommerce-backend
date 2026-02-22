import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  PRODUCT_DELETED_EVENT_KEY,
  ProductDeletedEvent,
} from 'src/product/events/product-deleted.event';
import { ProductAttributeRepository } from 'src/product/product-attribute.repository';

@Injectable()
export class ProductDeletedListener {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  @OnEvent(PRODUCT_DELETED_EVENT_KEY)
  async handleProductDeletedEvent(event: ProductDeletedEvent) {
    await this.productAttributeRepository.deleteAllProductAttributes(event.id);
  }
}
