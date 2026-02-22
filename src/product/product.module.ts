import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CategoryModule } from 'src/category/category.module';
import { ProductRepository } from './product.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { ProductDeletedListener } from './listeners/product-deleted-listener/product-deleted.listener';
import { ProductAttributeRepository } from './product-attribute.repository';

@Module({
  imports: [
    CategoryModule,
    TypeOrmModule.forFeature([Product, ProductAttribute]),
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ProductAttributeRepository,
    ProductDeletedListener,
  ],
  exports: [ProductRepository],
})
export class ProductModule {}
