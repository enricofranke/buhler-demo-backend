import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

/**
 * Main application controller providing basic application information
 */
@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application information' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns basic application information',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Hello API'
        }
      }
    }
  })
  getData(): { message: string } {
    return this.appService.getData();
  }
}
