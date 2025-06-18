import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiBearerAuth()
@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Create customer' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req: any): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.customersService.create(createCustomerDto, userId);
  }

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get all customers' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for company name or contact person' })
  @ApiQuery({ name: 'country', required: false, description: 'Filter by country' })
  @ApiQuery({ name: 'isActive', required: false, description: 'Filter by active status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(
    @Request() req: any,
    @Query('search') search?: string,
    @Query('country') country?: string,
    @Query('isActive') isActive?: string
  ): Promise<any[]> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    const isActiveBoolean = isActive !== undefined ? isActive === 'true' : undefined;
    return this.customersService.findAll({ userId, search, country, isActive: isActiveBoolean });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get customer by id' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.customersService.findOne(id, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Update customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.customersService.update(id, updateCustomerDto, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Delete customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.customersService.remove(id, userId);
  }

  @Get(':id/quotations')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get all quotations for a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return customer quotations.',
    type: [Object] 
  })
  async getCustomerQuotations(@Param('id') id: string, @Request() req: any): Promise<any[]> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.customersService.getCustomerQuotations(id, userId);
  }
}