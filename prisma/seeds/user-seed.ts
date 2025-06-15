import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedUsers() {
  console.log('🌱 Seeding users and roles...');

  // 1. Create Roles first
  const roles = [
    {
      name: 'ADMIN',
      displayName: 'Administrator',
      description: 'Full system access and user management',
      isActive: true,
      isSystem: true,
      permissions: {
        machines: ['read', 'write', 'delete'],
        customers: ['read', 'write', 'delete'],
        quotations: ['read', 'write', 'delete'],
        users: ['read', 'write', 'delete'],
        rules: ['read', 'write', 'delete']
      }
    },
    {
      name: 'SALES_MANAGER',
      displayName: 'Sales Manager',
      description: 'Regional sales management and team oversight',
      isActive: true,
      isSystem: false,
      permissions: {
        machines: ['read', 'write'],
        customers: ['read', 'write'],
        quotations: ['read', 'write', 'delete'],
        users: ['read'],
        rules: ['read']
      }
    },
    {
      name: 'SALES_REPRESENTATIVE',
      displayName: 'Sales Representative',
      description: 'Direct customer sales and quotation creation',
      isActive: true,
      isSystem: false,
      permissions: {
        machines: ['read'],
        customers: ['read', 'write'],
        quotations: ['read', 'write'],
        users: [],
        rules: ['read']
      }
    },
    {
      name: 'TECHNICAL_SPECIALIST',
      displayName: 'Technical Specialist',
      description: 'Technical consultation and machine configuration support',
      isActive: true,
      isSystem: false,
      permissions: {
        machines: ['read', 'write'],
        customers: ['read'],
        quotations: ['read', 'write'],
        users: [],
        rules: ['read', 'write']
      }
    }
  ];

  // Create roles
  for (const roleData of roles) {
    const existingRole = await prisma.role.findFirst({
      where: { name: roleData.name },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: roleData,
      });
      console.log(`✅ Created role: ${roleData.displayName}`);
    } else {
      console.log(`⏭️ Role already exists: ${roleData.displayName}`);
    }
  }

  // 2. Create Users
  const users = [
    {
      email: 'thomas.mueller@buhler.com',
      firstName: 'Thomas',
      lastName: 'Mueller',
      displayName: 'Thomas Mueller',
      passwordHash: await bcrypt.hash('password123', 10), // Demo password
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_MANAGER'
    },
    {
      email: 'anna.fischer@buhler.com',
      firstName: 'Anna',
      lastName: 'Fischer',
      displayName: 'Anna Fischer',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_REPRESENTATIVE'
    },
    {
      email: 'marco.rossi@buhler.com',
      firstName: 'Marco',
      lastName: 'Rossi',
      displayName: 'Marco Rossi',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_REPRESENTATIVE'
    },
    {
      email: 'sarah.weber@buhler.com',
      firstName: 'Sarah',
      lastName: 'Weber',
      displayName: 'Dr. Sarah Weber',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'TECHNICAL_SPECIALIST'
    },
    {
      email: 'james.anderson@buhler.com',
      firstName: 'James',
      lastName: 'Anderson',
      displayName: 'James Anderson',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_REPRESENTATIVE'
    },
    {
      email: 'marie.dubois@buhler.com',
      firstName: 'Marie',
      lastName: 'Dubois',
      displayName: 'Marie Dubois',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_REPRESENTATIVE'
    },
    {
      email: 'kenji.yamamoto@buhler.com',
      firstName: 'Kenji',
      lastName: 'Yamamoto',
      displayName: 'Kenji Yamamoto',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_MANAGER'
    },
    {
      email: 'emma.thompson@buhler.com',
      firstName: 'Emma',
      lastName: 'Thompson',
      displayName: 'Emma Thompson',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'SALES_REPRESENTATIVE'
    },
    {
      email: 'hans.mueller@buhler.com',
      firstName: 'Hans',
      lastName: 'Mueller',
      displayName: 'Hans Mueller',
      passwordHash: await bcrypt.hash('password123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'TECHNICAL_SPECIALIST'
    },
    {
      email: 'admin@buhler.com',
      firstName: 'System',
      lastName: 'Administrator',
      displayName: 'System Admin',
      passwordHash: await bcrypt.hash('admin123', 10),
      isActive: true,
      isEmailVerified: true,
      roleName: 'ADMIN'
    }
  ];

  // Create users and assign roles
  for (const userData of users) {
    const existingUser = await prisma.user.findFirst({
      where: { email: userData.email },
    });

    if (!existingUser) {
      // Get role
      const role = await prisma.role.findFirst({
        where: { name: userData.roleName },
      });

      if (!role) {
        console.error(`❌ Role not found: ${userData.roleName}`);
        continue;
      }

      // Create user
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          displayName: userData.displayName,
          passwordHash: userData.passwordHash,
          isActive: userData.isActive,
          isEmailVerified: userData.isEmailVerified,
        },
      });

      // Assign role
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: role.id,
          assignedBy: 'SYSTEM',
          isActive: true,
        },
      });

      console.log(`✅ Created user: ${userData.displayName} (${userData.roleName})`);
    } else {
      console.log(`⏭️ User already exists: ${userData.displayName}`);
    }
  }

  console.log('✅ User seeding completed successfully!');
  console.log(`📊 Total users available: ${users.length}`);
  console.log(`📊 Total roles available: ${roles.length}`);
  
  console.log('\n🔐 Demo Login Credentials:');
  console.log('Sales Manager: thomas.mueller@buhler.com / password123');
  console.log('Sales Rep: anna.fischer@buhler.com / password123');
  console.log('Technical: sarah.weber@buhler.com / password123');
  console.log('Admin: admin@buhler.com / admin123');
}

async function main() {
  try {
    await seedUsers();
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ User seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedUsers }; 