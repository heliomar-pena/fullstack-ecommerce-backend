import { Controller, Get, Post, Body } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { RoleIds } from 'src/role/enum/role.enum';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { CategoryDto } from './dto/category.dto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @AuthRoles(RoleIds.Merchant, RoleIds.Admin)
  @ApiBearerAuth()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @ApiBearerAuth()
  @Serialize(CategoryDto)
  findAll() {
    return this.categoryService.getAll();
  }
}
