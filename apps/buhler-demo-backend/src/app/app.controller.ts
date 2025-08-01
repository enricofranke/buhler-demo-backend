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

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok'
        },
        timestamp: {
          type: 'string',
          example: '2025-01-10T12:00:00.000Z'
        }
      }
    }
  })
  healthCheck(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
