import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { CreateQuotationConfigurationDto } from './dto/create-quotation-configuration.dto';
import { UpdateQuotationConfigurationDto } from './dto/update-quotation-configuration.dto';
import { CreateQuotationVersionDto } from './dto/create-quotation-version.dto';
import { QuotationStatus } from '@prisma/client';
import { createHash } from 'crypto';

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

    // 🔥 NEW: Auto-initialize all machine configurations with NULL state
    if (createQuotationDto.machineId) {
      await this.initializeQuotationConfigurations(quotation.id, createQuotationDto.machineId, quotation.version);
    }

    // Return quotation with initialized configurations
    const quotationWithConfigs = await this.prisma.quotation.findUnique({
      where: { id: quotation.id },
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
          where: {
            isCurrentVersion: true // Only show current version configurations
          },
          include: {
            configuration: {
              select: {
                id: true,
                name: true,
                description: true,
                type: true,
                isRequired: true,
                helpText: true,
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
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return quotationWithConfigs;
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
          where: {
            isCurrentVersion: true
          },
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
    const previousMachineId = quotation.machineId;

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
          where: {
            isCurrentVersion: true
          },
          include: {
            configuration: true,
            selectedOption: true,
          }
        }
      }
    });

    // 🔥 NEW: Auto-initialize configurations when machine is added for the first time
    if (updateQuotationDto.machineId && !previousMachineId) {
      console.log('🔄 Machine added to quotation - initializing configurations');
      await this.initializeQuotationConfigurations(id, updateQuotationDto.machineId, updatedQuotation.version);
      
      // Return updated quotation with newly initialized configurations
      return await this.findOne(id, userId);
    }

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

    // Check if configuration already exists for this quotation
    const existingConfig = await this.prisma.quotationConfiguration.findFirst({
      where: {
          quotationId,
        configurationId: createConfigurationDto.configurationId,
        isCurrentVersion: true
        }
    });

    let quotationConfiguration;

    if (existingConfig) {
      // Create a hash of the new value for change detection
      const newValueHash = this.createValueHash({
        selectedOptionId: createConfigurationDto.selectedOptionId,
        customValue: createConfigurationDto.customValue
      });

      // Check if the value has actually changed
      const currentValueHash = this.createValueHash({
        selectedOptionId: existingConfig.selectedOptionId,
        customValue: existingConfig.customValue
      });

      if (newValueHash === currentValueHash && createConfigurationDto.notes === existingConfig.notes) {
        // No change, return existing configuration
        return await this.prisma.quotationConfiguration.findUnique({
          where: { id: existingConfig.id },
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
      }

      // Mark existing configuration as not current
      await this.prisma.quotationConfiguration.update({
        where: { id: existingConfig.id },
        data: { isCurrentVersion: false }
      });

      // Find the next configuration version for this specific configuration
      const nextConfigVersion = await this.getNextConfigurationVersion(quotationId, createConfigurationDto.configurationId);

      // Create new version
      quotationConfiguration = await this.prisma.quotationConfiguration.create({
        data: {
        quotationId,
          configurationId: createConfigurationDto.configurationId,
          selectedOptionId: createConfigurationDto.selectedOptionId,
          customValue: createConfigurationDto.customValue,
          notes: createConfigurationDto.notes,
          quotationVersion: nextConfigVersion,
          isCurrentVersion: true,
          previousValueHash: currentValueHash,
          changeDescription: this.generateChangeDescription(existingConfig, {
            selectedOptionId: createConfigurationDto.selectedOptionId,
            customValue: createConfigurationDto.customValue
          })
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
    } else {
      // First time configuration - create initial version
      quotationConfiguration = await this.prisma.quotationConfiguration.create({
        data: {
          quotationId,
          configurationId: createConfigurationDto.configurationId,
        selectedOptionId: createConfigurationDto.selectedOptionId,
        customValue: createConfigurationDto.customValue,
        notes: createConfigurationDto.notes,
          quotationVersion: quotation.version,
          isCurrentVersion: true,
          changeDescription: 'Initial configuration'
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
    }

    return quotationConfiguration;
  }

  async updateConfiguration(quotationId: string, configId: string, updateConfigurationDto: UpdateQuotationConfigurationDto, userId: string) {
    const quotation = await this.findOne(quotationId, userId);

    const quotationConfiguration = await this.prisma.quotationConfiguration.findFirst({
      where: {
        quotationId,
        configurationId: configId,
        isCurrentVersion: true
      }
    });

    if (!quotationConfiguration) {
      throw new NotFoundException('Quotation configuration not found');
    }

    // Create a hash of the new value for change detection
    const newValueHash = this.createValueHash({
      selectedOptionId: updateConfigurationDto.selectedOptionId || quotationConfiguration.selectedOptionId,
      customValue: updateConfigurationDto.customValue || quotationConfiguration.customValue
    });

    // Check if the value has actually changed
    const currentValueHash = this.createValueHash({
      selectedOptionId: quotationConfiguration.selectedOptionId,
      customValue: quotationConfiguration.customValue
    });

    // Check if notes have changed
    const notesChanged = updateConfigurationDto.notes !== undefined && updateConfigurationDto.notes !== quotationConfiguration.notes;

    if (newValueHash === currentValueHash && !notesChanged) {
      // No change, return existing configuration
      return await this.prisma.quotationConfiguration.findUnique({
      where: { id: quotationConfiguration.id },
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
    }

    // Mark existing configuration as not current
    await this.prisma.quotationConfiguration.update({
      where: { id: quotationConfiguration.id },
      data: { isCurrentVersion: false }
    });

    // Create new version with updated values
    const updatedConfiguration = await this.prisma.quotationConfiguration.create({
      data: {
        quotationId,
        configurationId: configId,
        selectedOptionId: updateConfigurationDto.selectedOptionId ?? quotationConfiguration.selectedOptionId,
        customValue: updateConfigurationDto.customValue ?? quotationConfiguration.customValue,
        notes: updateConfigurationDto.notes ?? quotationConfiguration.notes,
        quotationVersion: quotation.version,
        isCurrentVersion: true,
        previousValueHash: currentValueHash,
        changeDescription: this.generateChangeDescription(
          quotationConfiguration,
          {
            selectedOptionId: updateConfigurationDto.selectedOptionId ?? quotationConfiguration.selectedOptionId,
            customValue: updateConfigurationDto.customValue ?? quotationConfiguration.customValue
          }
        )
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

    return updatedConfiguration;
  }

  async removeConfiguration(quotationId: string, configId: string, userId: string) {
    const quotation = await this.findOne(quotationId, userId);

    const quotationConfiguration = await this.prisma.quotationConfiguration.findFirst({
      where: {
        quotationId,
        configurationId: configId,
        isCurrentVersion: true
      }
    });

    if (!quotationConfiguration) {
      throw new NotFoundException('Quotation configuration not found');
    }

    // Mark existing configuration as not current
    await this.prisma.quotationConfiguration.update({
      where: { id: quotationConfiguration.id },
      data: { isCurrentVersion: false }
    });

    // Create a new version that represents "cleared/removed" state
    await this.prisma.quotationConfiguration.create({
      data: {
        quotationId,
        configurationId: configId,
        selectedOptionId: null,
        customValue: null,
        notes: null,
        quotationVersion: quotation.version,
        isCurrentVersion: true,
        previousValueHash: this.createValueHash({
          selectedOptionId: quotationConfiguration.selectedOptionId,
          customValue: quotationConfiguration.customValue
        }),
        changeDescription: 'Configuration cleared'
      }
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
          where: {
            isCurrentVersion: true
          },
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

    // Copy configurations from parent (only current versions)
    const parentConfigurations = await this.prisma.quotationConfiguration.findMany({
      where: { 
        quotationId: parentQuotationId,
        isCurrentVersion: true
      }
    });

    for (const config of parentConfigurations) {
      await this.prisma.quotationConfiguration.create({
        data: {
          quotationId: newVersion.id,
          configurationId: config.configurationId,
          selectedOptionId: config.selectedOptionId,
          customValue: config.customValue,
          notes: config.notes,
          quotationVersion: newVersion.version,
          isCurrentVersion: true,
          changeDescription: 'Copied from parent version'
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

    // Copy configurations (only current versions)
    const originalConfigurations = await this.prisma.quotationConfiguration.findMany({
      where: { 
        quotationId: id,
        isCurrentVersion: true
      }
    });

    for (const config of originalConfigurations) {
      await this.prisma.quotationConfiguration.create({
        data: {
          quotationId: clonedQuotation.id,
          configurationId: config.configurationId,
          selectedOptionId: config.selectedOptionId,
          customValue: config.customValue,
          notes: config.notes,
          quotationVersion: clonedQuotation.version,
          isCurrentVersion: true,
          changeDescription: 'Cloned from original'
        }
      });
    }

    return clonedQuotation;
  }

  async calculatePrice(id: string, userId: string) {
    const quotation = await this.findOne(id, userId);

    const configurations = await this.prisma.quotationConfiguration.findMany({
      where: { 
        quotationId: id,
        isCurrentVersion: true
      },
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

  // 🔥 NEW: Initialize all machine configurations for a quotation
  private async initializeQuotationConfigurations(quotationId: string, machineId: string, quotationVersion: number): Promise<void> {
    try {
    console.log('🔄 Initializing all machine configurations for quotation:', { quotationId, machineId, quotationVersion });

    // Get all configurations for this machine via ConfigurationTabs
    const machineConfigurations = await this.prisma.configuration.findMany({
      where: {
        tabConfigurations: {
          some: {
            tab: {
              machineId: machineId
            }
          }
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        isRequired: true,
      }
    });

    console.log(`📝 Found ${machineConfigurations.length} configurations for machine ${machineId}`);

      if (machineConfigurations.length === 0) {
        console.warn(`⚠️ No configurations found for machine ${machineId}`);
        return;
      }

    // Create QuotationConfiguration entries for all configurations with NULL state
      for (const config of machineConfigurations) {
        try {
          console.log(`Creating configuration entry for: ${config.name} (${config.id})`);
          
          await this.prisma.quotationConfiguration.create({
        data: {
          quotationId,
          configurationId: config.id,
              quotationVersion, 
              isCurrentVersion: true,
              changeDescription: 'Initial configuration state',
          selectedOptionId: null, // NULL state - not configured yet
          customValue: null, // NULL state - not configured yet
              notes: null, // Explicitly set notes to null
        }
          });
          
          console.log(`✅ Created configuration entry for: ${config.name}`);
        } catch (configError) {
          console.error(`❌ Error creating configuration entry for ${config.name}:`, configError);
          throw configError;
        }
      }

      console.log(`✅ Successfully initialized ${machineConfigurations.length} QuotationConfigurations with NULL state`);
    } catch (error) {
      console.error('❌ Error in initializeQuotationConfigurations:', error);
      throw error;
    }
  }

  // 🔥 NEW: Create a hash for value change detection
  private createValueHash(value: { selectedOptionId: string | null | undefined; customValue: string | null | undefined }): string {
    const valueString = JSON.stringify({
      selectedOptionId: value.selectedOptionId || null,
      customValue: value.customValue || null
    });
    return createHash('md5').update(valueString).digest('hex');
  }

  // 🔥 NEW: Get next configuration version number for a specific configuration
  private async getNextConfigurationVersion(quotationId: string, configurationId: string): Promise<number> {
    const latestConfig = await this.prisma.quotationConfiguration.findFirst({
      where: {
        quotationId,
        configurationId
      },
      orderBy: {
        quotationVersion: 'desc'
      },
      select: {
        quotationVersion: true
      }
    });

    return latestConfig ? latestConfig.quotationVersion + 1 : 1;
  }

  // 🔥 NEW: Generate a description of what changed
  private generateChangeDescription(
    previous: { selectedOptionId: string | null | undefined; customValue: string | null | undefined },
    current: { selectedOptionId: string | null | undefined; customValue: string | null | undefined }
  ): string {
    const changes = [];
    
    if (previous.selectedOptionId !== current.selectedOptionId) {
      if (previous.selectedOptionId === null) {
        changes.push('Option selected');
      } else if (current.selectedOptionId === null) {
        changes.push('Option cleared');
      } else {
        changes.push('Option changed');
      }
    }
    
    if (previous.customValue !== current.customValue) {
      if (previous.customValue === null) {
        changes.push('Custom value added');
      } else if (current.customValue === null) {
        changes.push('Custom value cleared');
      } else {
        changes.push('Custom value changed');
      }
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Configuration updated';
  }

  // 🔥 DEBUG: Check what configurations exist for a machine
  async debugMachineConfigurations(machineId: string) {
    console.log('🔍 Debug: Checking configurations for machine:', machineId);

    // Check if machine exists
    const machine = await this.prisma.machine.findUnique({
      where: { id: machineId },
      include: {
        configurationTabs: {
          include: {
            tabConfigurations: {
              include: {
                configuration: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    isActive: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!machine) {
      return { error: 'Machine not found', machineId };
    }

    // Get configurations the same way as initializeQuotationConfigurations does
    const machineConfigurations = await this.prisma.configuration.findMany({
      where: {
        tabConfigurations: {
          some: {
            tab: {
              machineId: machineId
            }
          }
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        type: true,
        isRequired: true,
      }
    });

    return {
      machine: {
        id: machine.id,
        name: machine.name,
        tabsCount: machine.configurationTabs.length
      },
      configurationsFound: machineConfigurations.length,
      configurations: machineConfigurations,
      tabs: machine.configurationTabs.map(tab => ({
        id: tab.id,
        name: tab.name,
        configurationsCount: tab.tabConfigurations.length,
        configurations: tab.tabConfigurations.map(tc => tc.configuration)
      }))
    };
  }
} 