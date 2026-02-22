import {
  Body,
  Controller,
  Delete,
  /*Delete,*/ Get,
  Param,
  Post,
} from '@nestjs/common';
import { RoleIds } from '../role/enum/role.enum';
import { CreateProductDto } from './dto/crate-product.dto';
import { ProductService } from './product.service';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { ReqUser } from 'src/auth/decorators/request-user.decorator';
import { RequestUserDto } from 'src/auth/dto/request-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { ProductDto } from './dto/product.dto';
import { ProductAttributesDto } from './dto/product-attributes.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiBearerAuth()
  @Get(':id')
  async getProduct(@Param('id') productId: number) {
    return this.productService.getProduct(productId);
  }

  @ApiBearerAuth()
  @Get()
  @Serialize(ProductDto)
  async getAllProducts() {
    return this.productService.getAllProducts();
  }

  @ApiBearerAuth()
  @AuthRoles(RoleIds.Admin, RoleIds.Merchant)
  @Post('create')
  async createProduct(
    @Body() body: CreateProductDto,
    @ReqUser() user: RequestUserDto,
  ) {
    return this.productService.createProduct(body, user.id);
  }

  @ApiBearerAuth()
  @AuthRoles(RoleIds.Admin, RoleIds.Merchant)
  @Post('update/:id/attributes')
  updateProductAttributes(
    @Param('id') productId: number,
    @Body() body: ProductAttributesDto,
  ) {
    return this.productService.updateProductAttributes(productId, body);
  }

  @ApiBearerAuth()
  @AuthRoles(RoleIds.Admin, RoleIds.Merchant)
  @Post(':id/activate')
  activateProduct(
    @Param('id') productId: number,
    @ReqUser() user: RequestUserDto,
  ) {
    return this.productService.activateProduct(productId, user.id);
  }

  @ApiBearerAuth()
  @AuthRoles(RoleIds.Admin, RoleIds.Merchant)
  @Delete(':id')
  deleteProduct(
    @Param('id') productId: number,
    @ReqUser() user: RequestUserDto,
  ) {
    return this.productService.deleteProduct(productId, user.id);
  }
}
