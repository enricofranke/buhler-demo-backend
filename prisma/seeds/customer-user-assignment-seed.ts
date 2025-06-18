import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function assignCustomersToAdmin() {
  console.log('🔗 Assigning customers to admin user...');

  try {
    // Find the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'admin@buhler.com' },
          { email: 'admin@buhler-demo.com' }
        ]
      }
    });

    if (!adminUser) {
      console.error('❌ Admin user not found. Please run user seeds first.');
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.email} (${adminUser.displayName})`);

    // Get all customers
    const customers = await prisma.customer.findMany({
      where: { isActive: true }
    });

    console.log(`📊 Found ${customers.length} active customers`);

    let assignedCount = 0;
    let skippedCount = 0;

    // Assign each customer to the admin user
    for (const customer of customers) {
      try {
        // Check if assignment already exists
        const existingAssignment = await prisma.userCustomer.findFirst({
          where: {
            userId: adminUser.id,
            customerId: customer.id
          }
        });

        if (existingAssignment) {
          console.log(`⏭️ Customer already assigned: ${customer.companyName}`);
          skippedCount++;
          continue;
        }

        // Create the assignment
        await prisma.userCustomer.create({
          data: {
            userId: adminUser.id,
            customerId: customer.id
          }
        });

        console.log(`✅ Assigned customer: ${customer.companyName}`);
        assignedCount++;

      } catch (error) {
        console.error(`❌ Failed to assign customer ${customer.companyName}:`, error);
      }
    }

    console.log('\n🎉 Customer assignment completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Total customers: ${customers.length}`);
    console.log(`  - Newly assigned: ${assignedCount}`);
    console.log(`  - Already assigned: ${skippedCount}`);
    console.log(`  - Admin user: ${adminUser.displayName} (${adminUser.email})`);

    // Show some sample customers for verification
    console.log('\n🏢 Sample assigned customers:');
    const sampleCustomers = customers.slice(0, 5);
    for (const customer of sampleCustomers) {
      console.log(`  - ${customer.companyName} (${customer.contactPerson || 'No contact'})`);
    }

  } catch (error) {
    console.error('❌ Error during customer assignment:', error);
    throw error;
  }
}

async function main() {
  try {
    await assignCustomersToAdmin();
  } catch (error) {
    console.error('❌ Customer assignment failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Customer assignment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Customer assignment failed:', error);
      process.exit(1);
    });
}

export { main as assignCustomersToAdmin }; 