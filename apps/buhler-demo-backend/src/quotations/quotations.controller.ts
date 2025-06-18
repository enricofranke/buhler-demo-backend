import { Body, Controller, Delete, Get, Param, Post, Put, Patch, Query, UseGuards, Request } from '@nestjs/common';
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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CreateQuotationConfigurationDto } from './dto/create-quotation-configuration.dto';
import { UpdateQuotationConfigurationDto } from './dto/update-quotation-configuration.dto';
import { UpdateQuotationStatusDto } from './dto/update-quotation-status.dto';
import { CreateQuotationVersionDto } from './dto/create-quotation-version.dto';

@ApiBearerAuth()
@ApiTags('quotations')
@Controller('quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Create quotation' })
  @ApiResponse({ 
    status: 201, 
    description: 'The record has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async create(@Body() createQuotationDto: CreateQuotationDto, @Request() req: any): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.create(createQuotationDto, userId);
  }

  @Get()
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get all quotations' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'customerId', required: false, description: 'Filter by customer ID' })
  @ApiQuery({ name: 'machineId', required: false, description: 'Filter by machine ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all records.',
    type: [Object] 
  })
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('customerId') customerId?: string,
    @Query('machineId') machineId?: string
  ): Promise<any[]> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.findAll({ userId, status, customerId, machineId });
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get quotation by id' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found record.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async findOne(@Param('id') id: string, @Request() req: any): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.findOne(id, userId);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Update quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async update(
    @Param('id') id: string,
    @Body() updateQuotationDto: UpdateQuotationDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.update(id, updateQuotationDto, userId);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_MANAGER')
  @ApiOperation({ summary: 'Delete quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The record has been successfully deleted.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.remove(id, userId);
  }

  @Post(':id/configurations')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Create or update quotation configuration' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Configuration has been successfully saved.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async createConfiguration(
    @Param('id') quotationId: string,
    @Body() createConfigurationDto: CreateQuotationConfigurationDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.saveConfiguration(quotationId, createConfigurationDto, userId);
  }

  @Put(':id/configurations/:configId')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Update quotation configuration' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'configId', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateConfiguration(
    @Param('id') quotationId: string,
    @Param('configId') configId: string,
    @Body() updateConfigurationDto: UpdateQuotationConfigurationDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.updateConfiguration(quotationId, configId, updateConfigurationDto, userId);
  }

  @Delete(':id/configurations/:configId')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Remove quotation configuration' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'configId', description: 'Configuration ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Configuration has been successfully removed.' 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async removeConfiguration(
    @Param('id') quotationId: string,
    @Param('configId') configId: string,
    @Request() req: any
  ): Promise<void> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.removeConfiguration(quotationId, configId, userId);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Update quotation status' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Status has been successfully updated.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateQuotationStatusDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.updateStatus(id, updateStatusDto.status, userId);
  }

  @Post(':id/versions')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Create new quotation version' })
  @ApiParam({ name: 'id', description: 'Parent quotation ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'New version has been successfully created.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Parent quotation not found.' })
  async createVersion(
    @Param('id') parentQuotationId: string,
    @Body() createVersionDto: CreateQuotationVersionDto,
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.createVersion(parentQuotationId, createVersionDto, userId);
  }

  @Get(':id/versions')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST', 'USER')
  @ApiOperation({ summary: 'Get all versions of a quotation' })
  @ApiParam({ name: 'id', description: 'Parent quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Return all versions.',
    type: [Object] 
  })
  async getVersions(
    @Param('id') parentQuotationId: string,
    @Request() req: any
  ): Promise<any[]> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.getVersions(parentQuotationId, userId);
  }

  @Post(':id/clone')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Clone an existing quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID to clone' })
  @ApiResponse({ 
    status: 201, 
    description: 'Quotation has been successfully cloned.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Source quotation not found.' })
  async clone(
    @Param('id') id: string,
    @Body() cloneData: { title?: string },
    @Request() req: any
  ): Promise<any> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.clone(id, cloneData.title, userId);
  }

  @Post(':id/calculate-price')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Calculate total price for quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Price calculation completed.',
    type: Object 
  })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  async calculatePrice(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ totalPrice: number; currency: string; breakdown: any[] }> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.calculatePrice(id, userId);
  }

  @Get(':id/pdf')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Generate PDF quote' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'PDF generated successfully.' 
  })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  async generatePdf(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<Buffer> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.generatePdf(id, userId);
  }

  @Post(':id/send')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Send quotation to customer' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Quotation sent successfully.' 
  })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  async send(
    @Param('id') id: string,
    @Body() emailData: { message?: string; sendCopy?: boolean },
    @Request() req: any
  ): Promise<void> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.sendToCustomer(id, emailData, userId);
  }

  @Get(':id/export/:format')
  @Roles('ADMIN', 'SALES_MANAGER', 'SALES', 'TECHNICAL_SPECIALIST')
  @ApiOperation({ summary: 'Export quotation' })
  @ApiParam({ name: 'id', description: 'Quotation ID' })
  @ApiParam({ name: 'format', description: 'Export format (pdf or excel)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Export completed successfully.' 
  })
  @ApiResponse({ status: 404, description: 'Quotation not found.' })
  async export(
    @Param('id') id: string,
    @Param('format') format: 'pdf' | 'excel',
    @Request() req: any
  ): Promise<Buffer> {
    const userId = req.user.id; // ✅ Fix: Use .id instead of .sub
    return this.quotationsService.exportQuotation(id, format, userId);
  }
} 