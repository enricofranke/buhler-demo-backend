import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, userId: string) {
    // Create customer
    const customer = await this.prisma.customer.create({
      data: createCustomerDto,
      include: {
        userCustomers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            quotations: true,
          }
        }
      }
    });

    // Associate customer with the creating user
    await this.prisma.userCustomer.create({
      data: {
        userId,
        customerId: customer.id,
      }
    });

    return customer;
  }

  async findAll(filters: { 
    userId: string; 
    search?: string; 
    country?: string; 
    isActive?: boolean 
  }) {
    const { userId, search, country, isActive } = filters;

    // Check user permissions
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } }
    });

    const isAdmin = user?.userRoles.some(ur => ['ADMIN', 'SALES_MANAGER'].includes(ur.role.name));

    const customers = await this.prisma.customer.findMany({
      where: {
        ...(isAdmin ? {} : { userCustomers: { some: { userId } } }), // Admin can see all customers
        ...(search && {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
          ]
        }),
        ...(country && { country }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: {
            quotations: true,
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    });

    return customers;
  }

  async findOne(id: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } }
    });

    const isAdmin = user?.userRoles.some(ur => ['ADMIN', 'SALES_MANAGER'].includes(ur.role.name));

    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        userCustomers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        quotations: {
          where: { isLatestVersion: true },
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            machine: {
              select: {
                id: true,
                name: true,
              }
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              }
            }
          }
        },
        _count: {
          select: {
            quotations: true,
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check access permissions
    if (!isAdmin && !customer.userCustomers.some(uc => uc.userId === userId)) {
      throw new ForbiddenException('Access denied');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, userId: string) {
    await this.findOne(id, userId); // Check access

    const updatedCustomer = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
      include: {
        userCustomers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        },
        _count: {
          select: {
            quotations: true,
          }
        }
      }
    });

    return updatedCustomer;
  }

  async remove(id: string, userId: string) {
    const customer = await this.findOne(id, userId); // Check access

    // Check if customer has quotations
    const quotationCount = await this.prisma.quotation.count({
      where: { customerId: id }
    });

    if (quotationCount > 0) {
      throw new BadRequestException('Cannot delete customer with existing quotations');
    }

    await this.prisma.customer.delete({
      where: { id }
    });
  }

  async getCustomerQuotations(customerId: string, userId: string) {
    await this.findOne(customerId, userId); // Check access

    const quotations = await this.prisma.quotation.findMany({
      where: { 
        customerId,
        isLatestVersion: true 
      },
      include: {
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
} 