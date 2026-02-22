import { Controller, Get, Post, Body } from '@nestjs/common';
import { AttributeService } from './attribute.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthRoles } from 'src/auth/decorators/authorization.decorator';
import { RoleIds } from 'src/role/enum/role.enum';
import { Serialize } from 'src/shared/interceptors/serialize.interceptor';
import { AttributeDto } from './dto/attribute.dto';

@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) {}

  @Post()
  @AuthRoles(RoleIds.Merchant, RoleIds.Admin)
  @ApiBearerAuth()
  create(@Body() createAttributeDto: CreateAttributeDto) {
    return this.attributeService.create(createAttributeDto);
  }

  @Get()
  @ApiBearerAuth()
  @Serialize(AttributeDto)
  findAll() {
    return this.attributeService.getAll();
  }
}
