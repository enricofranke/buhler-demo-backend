import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CreateQuotationConfigurationDto } from './dto/create-quotation-configuration.dto';
import { UpdateQuotationConfigurationDto } from './dto/update-quotation-configuration.dto';
import { CreateQuotationVersionDto } from './dto/create-quotation-version.dto';
import { QuotationStatus } from '@prisma/client';

@Injectable()
export class QuotationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createQuotationDto: CreateQuotationDto, userId: string) {
    // Validate customer exists and user has access
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: createQuotationDto.customerId,
        OR: [
          { userCustomers: { some: { userId } } },
          // Admin can access all customers
          { userCustomers: { some: { user: { userRoles: { some: { role: { name: { in: ['ADMIN', 'SALES_MANAGER'] } } } } } } } }
        ]
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found or access denied');
    }

    // Validate machine if provided
    if (createQuotationDto.machineId) {
      const machine = await this.prisma.machine.findUnique({
        where: { id: createQuotationDto.machineId }
      });
      if (!machine) {
        throw new NotFoundException('Machine not found');
      }
    }

    // Generate quotation number
    const quotationNumber = await this.generateQuotationNumber();

    const quotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        title: createQuotationDto.title,
        userId,
        customerId: createQuotationDto.customerId,
        machineId: createQuotationDto.machineId,
        currency: createQuotationDto.currency || 'EUR',
        validUntil: createQuotationDto.validUntil ? new Date(createQuotationDto.validUntil) : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        configurations: {
          include: {
            configuration: true,
            selectedOption: true,
          }
        }
      }
    });

    return quotation;
  }

  async findAll(filters: { userId: string; status?: string; customerId?: string; machineId?: string }) {
    const { userId, status, customerId, machineId } = filters;

    // Check user permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } }
    });

    const isAdmin = user?.userRoles.some(ur => ['ADMIN', 'SALES_MANAGER'].includes(ur.role.name));

    const quotations = await this.prisma.quotation.findMany({
      where: {
        ...(isAdmin ? {} : { userId }), // Admin can see all quotations
        ...(status && { status: status as QuotationStatus }),
        ...(customerId && { customerId }),
        ...(machineId && { machineId }),
        isLatestVersion: true, // Only show latest versions by default
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        _count: {
          select: {
            configurations: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return quotations;
  }

  async findOne(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } }
    });

    const isAdmin = user?.userRoles.some(ur => ['ADMIN', 'SALES_MANAGER'].includes(ur.role.name));

    const quotation = await this.prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
            email: true,
            phone: true,
            address: true,
            country: true,
          }
        },
                 machine: {
           select: {
             id: true,
             name: true,
             description: true,
           }
         },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        configurations: {
          include: {
            configuration: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true,
                isRequired: true,
              }
            },
            selectedOption: {
              select: {
                id: true,
                value: true,
                displayName: true,
                description: true,
                priceModifier: true,
              }
            }
          }
        }
      }
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    // Check access permissions
    if (!isAdmin && quotation.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return quotation;
  }

  async update(id: string, updateQuotationDto: UpdateQuotationDto, userId: string) {
    const quotation = await this.findOne(id, userId);

    // Validate machine if provided
    if (updateQuotationDto.machineId) {
      const machine = await this.prisma.machine.findUnique({
        where: { id: updateQuotationDto.machineId }
      });
      if (!machine) {
        throw new NotFoundException('Machine not found');
      }
    }

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: {
        title: updateQuotationDto.title,
        status: updateQuotationDto.status,
        machineId: updateQuotationDto.machineId,
        totalPrice: updateQuotationDto.totalPrice,
        currency: updateQuotationDto.currency,
        validUntil: updateQuotationDto.validUntil ? new Date(updateQuotationDto.validUntil) : undefined,
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
            contactPerson: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        },
        configurations: {
          include: {
            configuration: true,
            selectedOption: true,
          }
        }
      }
    });

    return updatedQuotation;
  }

  async remove(id: string, userId: string) {
    const quotation = await this.findOne(id, userId);

    // Only allow deletion of DRAFT quotations
    if (quotation.status !== 'DRAFT') {
      throw new BadRequestException('Only draft quotations can be deleted');
    }

    await this.prisma.quotation.delete({
      where: { id }
    });
  }

  async saveConfiguration(quotationId: string, createConfigurationDto: CreateQuotationConfigurationDto, userId: string) {
    const quotation = await this.findOne(quotationId, userId);

    // Validate configuration exists
    const configuration = await this.prisma.configuration.findUnique({
      where: { id: createConfigurationDto.configurationId },
      include: { options: true }
    });

    if (!configuration) {
      throw new NotFoundException('Configuration not found');
    }

    // Validate option if provided
    if (createConfigurationDto.selectedOptionId) {
      const option = configuration.options.find(opt => opt.id === createConfigurationDto.selectedOptionId);
      if (!option) {
        throw new NotFoundException('Configuration option not found');
      }
    }

    // Upsert configuration
    const quotationConfiguration = await this.prisma.quotationConfiguration.upsert({
      where: {
        quotationId_configurationId: {
          quotationId,
          configurationId: createConfigurationDto.configurationId
        }
      },
      create: {
        quotationId,
        ...createConfigurationDto
      },
      update: {
        selectedOptionId: createConfigurationDto.selectedOptionId,
        customValue: createConfigurationDto.customValue,
        notes: createConfigurationDto.notes,
      },
      include: {
        configuration: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        },
        selectedOption: {
          select: {
            id: true,
            value: true,
            displayName: true,
            priceModifier: true,
          }
        }
      }
    });

    return quotationConfiguration;
  }

  async updateConfiguration(quotationId: string, configId: string, updateConfigurationDto: UpdateQuotationConfigurationDto, userId: string) {
    await this.findOne(quotationId, userId);

    const quotationConfiguration = await this.prisma.quotationConfiguration.findFirst({
      where: {
        quotationId,
        configurationId: configId
      }
    });

    if (!quotationConfiguration) {
      throw new NotFoundException('Quotation configuration not found');
    }

    const updatedConfiguration = await this.prisma.quotationConfiguration.update({
      where: { id: quotationConfiguration.id },
      data: updateConfigurationDto,
      include: {
        configuration: {
          select: {
            id: true,
            name: true,
            type: true,
          }
        },
        selectedOption: {
          select: {
            id: true,
            value: true,
            displayName: true,
            priceModifier: true,
          }
        }
      }
    });

    return updatedConfiguration;
  }

  async removeConfiguration(quotationId: string, configId: string, userId: string) {
    await this.findOne(quotationId, userId);

    const quotationConfiguration = await this.prisma.quotationConfiguration.findFirst({
      where: {
        quotationId,
        configurationId: configId
      }
    });

    if (!quotationConfiguration) {
      throw new NotFoundException('Quotation configuration not found');
    }

    await this.prisma.quotationConfiguration.delete({
      where: { id: quotationConfiguration.id }
    });
  }

  async updateStatus(id: string, status: QuotationStatus, userId: string) {
    const quotation = await this.findOne(id, userId);

    const updatedQuotation = await this.prisma.quotation.update({
      where: { id },
      data: { status },
      include: {
        customer: true,
        machine: true,
        configurations: {
          include: {
            configuration: true,
            selectedOption: true,
          }
        }
      }
    });

    return updatedQuotation;
  }

  async createVersion(parentQuotationId: string, createVersionDto: CreateQuotationVersionDto, userId: string) {
    const parentQuotation = await this.findOne(parentQuotationId, userId);

    // Mark parent as not latest version
    await this.prisma.quotation.update({
      where: { id: parentQuotationId },
      data: { isLatestVersion: false }
    });

    // Generate new quotation number
    const quotationNumber = await this.generateQuotationNumber();

    // Create new version
    const newVersion = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        title: createVersionDto.title || parentQuotation.title,
        status: 'DRAFT',
        version: parentQuotation.version + 1,
        parentQuotationId,
        isLatestVersion: true,
        versionNotes: createVersionDto.versionNotes,
        userId,
        customerId: parentQuotation.customerId,
        machineId: parentQuotation.machineId,
        currency: parentQuotation.currency,
        validUntil: createVersionDto.validUntil ? new Date(createVersionDto.validUntil) : parentQuotation.validUntil,
      },
      include: {
        customer: true,
        machine: true,
      }
    });

    // Copy configurations from parent
    const parentConfigurations = await this.prisma.quotationConfiguration.findMany({
      where: { quotationId: parentQuotationId }
    });

    for (const config of parentConfigurations) {
      await this.prisma.quotationConfiguration.create({
        data: {
          quotationId: newVersion.id,
          configurationId: config.configurationId,
          selectedOptionId: config.selectedOptionId,
          customValue: config.customValue,
          notes: config.notes,
        }
      });
    }

    return newVersion;
  }

  async getVersions(parentQuotationId: string, userId: string) {
    await this.findOne(parentQuotationId, userId);

    const versions = await this.prisma.quotation.findMany({
      where: {
        OR: [
          { id: parentQuotationId },
          { parentQuotationId }
        ]
      },
      include: {
        customer: {
          select: {
            id: true,
            companyName: true,
          }
        },
        machine: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            configurations: true,
          }
        }
      },
      orderBy: {
        version: 'desc'
      }
    });

    return versions;
  }

  async clone(id: string, title: string | undefined, userId: string) {
    const originalQuotation = await this.findOne(id, userId);

    // Generate new quotation number
    const quotationNumber = await this.generateQuotationNumber();

    // Create cloned quotation
    const clonedQuotation = await this.prisma.quotation.create({
      data: {
        quotationNumber,
        title: title || `${originalQuotation.title} (Copy)`,
        status: 'DRAFT',
        userId,
        customerId: originalQuotation.customerId,
        machineId: originalQuotation.machineId,
        currency: originalQuotation.currency,
      },
      include: {
        customer: true,
        machine: true,
      }
    });

    // Copy configurations
    const originalConfigurations = await this.prisma.quotationConfiguration.findMany({
      where: { quotationId: id }
    });

    for (const config of originalConfigurations) {
      await this.prisma.quotationConfiguration.create({
        data: {
          quotationId: clonedQuotation.id,
          configurationId: config.configurationId,
          selectedOptionId: config.selectedOptionId,
          customValue: config.customValue,
          notes: config.notes,
        }
      });
    }

    return clonedQuotation;
  }

  async calculatePrice(id: string, userId: string) {
    const quotation = await this.findOne(id, userId);

    const configurations = await this.prisma.quotationConfiguration.findMany({
      where: { quotationId: id },
      include: {
        selectedOption: true,
        configuration: true,
      }
    });

    let totalPrice = 0;
    const breakdown = [];

    // TODO: Add base machine price when Machine model includes basePrice field
    // if (quotation.machine?.basePrice) {
    //   totalPrice += Number(quotation.machine.basePrice);
    //   breakdown.push({
    //     item: `${quotation.machine.name} (Base Price)`,
    //     price: quotation.machine.basePrice,
    //     currency: quotation.currency,
    //   });
    // }

    // Add configuration prices
    for (const config of configurations) {
      if (config.selectedOption?.priceModifier) {
        const price = config.selectedOption.priceModifier;
        totalPrice += Number(price);
        breakdown.push({
          item: `${config.configuration.name}: ${config.selectedOption.displayName}`,
          price: Number(price),
          currency: quotation.currency,
        });
      }
    }

    // Update quotation with calculated price
    await this.prisma.quotation.update({
      where: { id },
      data: { totalPrice }
    });

    return {
      totalPrice,
      currency: quotation.currency,
      breakdown
    };
  }

  async generatePdf(id: string, userId: string): Promise<Buffer> {
    const quotation = await this.findOne(id, userId);
    
    // TODO: Implement PDF generation
    // This is a placeholder implementation
    const pdfContent = `Quotation ${quotation.quotationNumber}\nCustomer: ${quotation.customer?.companyName}\nMachine: ${quotation.machine?.name || 'TBD'}\nTotal: ${quotation.totalPrice || 0} ${quotation.currency}`;
    
    return Buffer.from(pdfContent, 'utf8');
  }

  async sendToCustomer(id: string, emailData: { message?: string; sendCopy?: boolean }, userId: string): Promise<void> {
    const quotation = await this.findOne(id, userId);
    
    // TODO: Implement email sending
    console.log(`Sending quotation ${quotation.quotationNumber} to ${quotation.customer?.email}`);
    console.log(`Message: ${emailData.message || 'Standard quotation'}`);
    
    // Update status to SENT
    await this.prisma.quotation.update({
      where: { id },
      data: { status: 'SENT' }
    });
  }

  async exportQuotation(id: string, format: 'pdf' | 'excel', userId: string): Promise<Buffer> {
    const quotation = await this.findOne(id, userId);
    
    // TODO: Implement export functionality
    const content = `Export of quotation ${quotation.quotationNumber} in ${format} format`;
    
    return Buffer.from(content, 'utf8');
  }

  private async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.quotation.count({
      where: {
        quotationNumber: {
          startsWith: `QUO-${year}-`
        }
      }
    });
    
    return `QUO-${year}-${String(count + 1).padStart(3, '0')}`;
  }
} 