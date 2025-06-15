import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const roleData = [
  {
    name: 'ADMIN',
    displayName: 'Administrator',
    description: 'Full system access with all administrative privileges',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['create', 'read', 'update', 'delete'],
      machineGroups: ['create', 'read', 'update', 'delete'],
      configurations: ['create', 'read', 'update', 'delete'],
      quotations: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      roles: ['create', 'read', 'update', 'delete'],
      customers: ['create', 'read', 'update', 'delete'],
      system: ['backup', 'restore', 'logs', 'settings']
    }
  },
  {
    name: 'SALES_MANAGER',
    displayName: 'Sales Manager',
    description: 'Sales management with access to all sales functions and team oversight',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['read'],
      machineGroups: ['read'],
      configurations: ['read'],
      quotations: ['create', 'read', 'update', 'delete'],
      customers: ['create', 'read', 'update'],
      users: ['read'],
      reports: ['read', 'export'],
      analytics: ['read']
    }
  },
  {
    name: 'SALES',
    displayName: 'Sales Representative',
    description: 'Sales team member with quotation and customer management access',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['read'],
      machineGroups: ['read'],
      configurations: ['read'],
      quotations: ['create', 'read', 'update'],
      customers: ['create', 'read', 'update'],
      reports: ['read']
    }
  },
  {
    name: 'TECHNICAL_SPECIALIST',
    displayName: 'Technical Specialist',
    description: 'Technical expert with advanced configuration and machine management',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['read', 'update'],
      machineGroups: ['read'],
      configurations: ['create', 'read', 'update'],
      quotations: ['read', 'update'],
      customers: ['read'],
      technical: ['validation', 'rules', 'dependencies']
    }
  },
  {
    name: 'USER',
    displayName: 'Standard User',
    description: 'Basic user with read access to machines and configurations',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['read'],
      machineGroups: ['read'],
      configurations: ['read'],
      quotations: ['read'],
      customers: ['read']
    }
  },
  {
    name: 'CUSTOMER',
    displayName: 'Customer',
    description: 'External customer with limited access to their own quotations',
    isActive: true,
    isSystem: true,
    permissions: {
      machines: ['read'],
      quotations: ['read'], // Only their own
      configurations: ['read']
    }
  }
];

export async function seedRoles() {
  console.log('🔐 Starting role seeding...');

  try {
    for (const role of roleData) {
      const existingRole = await prisma.role.findUnique({
        where: { name: role.name }
      });

      if (existingRole) {
        // Update existing role
        await prisma.role.update({
          where: { name: role.name },
          data: {
            displayName: role.displayName,
            description: role.description,
            isActive: role.isActive,
            permissions: role.permissions,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Updated role: ${role.name} (${role.displayName})`);
      } else {
        // Create new role
        await prisma.role.create({
          data: role
        });
        console.log(`✨ Created role: ${role.name} (${role.displayName})`);
      }
    }

    // Create a demo admin user with ADMIN role
    const adminEmail = 'admin@buhler-demo.com';
    const adminPassword = 'admin123';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    const adminRole = await prisma.role.findUnique({
      where: { name: 'ADMIN' }
    });

    if (adminRole) {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
      
      if (!existingAdmin) {
        // Create new admin user
        await prisma.user.create({
          data: {
            email: adminEmail,
            firstName: 'Demo',
            lastName: 'Administrator',
            displayName: 'Demo Admin',
            isActive: true,
            isEmailVerified: true,
            passwordHash: hashedAdminPassword,
            userRoles: {
              create: {
                roleId: adminRole.id,
                assignedBy: 'SYSTEM',
                assignedAt: new Date(),
                isActive: true
              }
            }
          }
        });
        console.log(`👤 Created admin user: ${adminEmail} (password: ${adminPassword})`);
      } else {
        // Update existing admin user password
        await prisma.user.update({
          where: { email: adminEmail },
          data: {
            passwordHash: hashedAdminPassword,
            updatedAt: new Date()
          }
        });
        console.log(`👤 Updated admin user password: ${adminEmail} (password: ${adminPassword})`);
      }
    }

    // Create demo sales user
    const salesEmail = 'sales@buhler-demo.com';
    const salesPassword = 'sales123';
    const existingSales = await prisma.user.findUnique({
      where: { email: salesEmail }
    });

    const salesRole = await prisma.role.findUnique({
      where: { name: 'SALES' }
    });

    if (salesRole) {
      const hashedSalesPassword = await bcrypt.hash(salesPassword, 12);
      
      if (!existingSales) {
        // Create new sales user
        await prisma.user.create({
          data: {
            email: salesEmail,
            firstName: 'Demo',
            lastName: 'Sales',
            displayName: 'Demo Sales Rep',
            isActive: true,
            isEmailVerified: true,
            passwordHash: hashedSalesPassword,
            userRoles: {
              create: {
                roleId: salesRole.id,
                assignedBy: 'SYSTEM',
                assignedAt: new Date(),
                isActive: true
              }
            }
          }
        });
        console.log(`👤 Created sales user: ${salesEmail} (password: ${salesPassword})`);
      } else {
        // Update existing sales user password
        await prisma.user.update({
          where: { email: salesEmail },
          data: {
            passwordHash: hashedSalesPassword,
            updatedAt: new Date()
          }
        });
        console.log(`👤 Updated sales user password: ${salesEmail} (password: ${salesPassword})`);
      }
    }

    console.log('🎉 Role seeding completed successfully!');
    console.log('\n📋 Available Roles:');
    console.log('- ADMIN: Full system access');
    console.log('- SALES_MANAGER: Sales management');
    console.log('- SALES: Sales representative');
    console.log('- TECHNICAL_SPECIALIST: Technical expert');
    console.log('- USER: Standard user');
    console.log('- CUSTOMER: External customer');
    console.log('\n👤 Demo Users Created:');
    console.log('- admin@buhler-demo.com (password: admin123) - ADMIN role');
    console.log('- sales@buhler-demo.com (password: sales123) - SALES role');

  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedRoles()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 