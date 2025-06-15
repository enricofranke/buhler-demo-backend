import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCustomers() {
  console.log('🌱 Seeding customers...');

  const customers = [
    {
      companyName: 'Henkel AG & Co. KGaA',
      contactPerson: 'Dr. Andreas Mueller',
      email: 'andreas.mueller@henkel.com',
      phone: '+49 211 797-0',
      address: 'Henkelstraße 67, 40589 Düsseldorf',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'BASF SE',
      contactPerson: 'Maria Schmidt',
      email: 'maria.schmidt@basf.com',
      phone: '+49 621 60-0',
      address: 'Carl-Bosch-Straße 38, 67056 Ludwigshafen',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Clariant International Ltd',
      contactPerson: 'Jean-Pierre Dubois',
      email: 'jean-pierre.dubois@clariant.com',
      phone: '+41 61 469 51 51',
      address: 'Rothausstrasse 61, 4132 Muttenz',
      country: 'Switzerland',
      isActive: true,
    },
    {
      companyName: 'Sun Chemical Corporation',
      contactPerson: 'Robert Johnson',
      email: 'robert.johnson@sunchemical.com',
      phone: '+1 973 404-6000',
      address: '35 Waterview Boulevard, Parsippany, NJ 07054',
      country: 'United States',
      isActive: true,
    },
    {
      companyName: 'DIC Corporation',
      contactPerson: 'Takeshi Yamamoto',
      email: 'takeshi.yamamoto@dic-global.com',
      phone: '+81 3 6733-3000',
      address: '7-20, Nihonbashi 3-chome, Chuo-ku, Tokyo 103-8233',
      country: 'Japan',
      isActive: true,
    },
    {
      companyName: 'Evonik Industries AG',
      contactPerson: 'Dr. Sarah Weber',
      email: 'sarah.weber@evonik.com',
      phone: '+49 201 177-01',
      address: 'Rellinghauser Straße 1-11, 45128 Essen',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Siegwerk Druckfarben AG & Co. KGaA',
      contactPerson: 'Marco Rossi',
      email: 'marco.rossi@siegwerk.com',
      phone: '+49 2241 304-0',
      address: 'Alfred-Keller-Straße 55, 53721 Siegburg',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Huber Group',
      contactPerson: 'Klaus Fischer',
      email: 'klaus.fischer@hubergroup.com',
      phone: '+49 8031 800-0',
      address: 'Hans-Huber-Straße 11, 83101 Rohrdorf',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Flint Group',
      contactPerson: 'Emma Thompson',
      email: 'emma.thompson@flintgrp.com',
      phone: '+44 1962 711661',
      address: 'Ashurst Lodge, Ashurst, Southampton SO40 7AA',
      country: 'United Kingdom',
      isActive: true,
    },
    {
      companyName: 'Zeller+Gmelin GmbH & Co. KG',
      contactPerson: 'Dr. Michael Zeller',
      email: 'michael.zeller@zeller-gmelin.de',
      phone: '+49 7161 802-0',
      address: 'Schlossstraße 20, 73054 Eislingen',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Toyo Ink SC Holdings Co., Ltd.',
      contactPerson: 'Hiroshi Tanaka',
      email: 'hiroshi.tanaka@toyoinkgroup.com',
      phone: '+81 3 3272-5731',
      address: '3-13 Kyoboshi, Chuo-ku, Tokyo 104-8378',
      country: 'Japan',
      isActive: true,
    },
    {
      companyName: 'Sakata Inx Corporation',
      contactPerson: 'Kenji Sakata',
      email: 'kenji.sakata@sakata-inx.co.jp',
      phone: '+81 6 6652-2001',
      address: '5-5-1 Nippombashi, Naniwa-ku, Osaka 556-0005',
      country: 'Japan',
      isActive: true,
    },
    {
      companyName: 'Altana AG',
      contactPerson: 'Dr. Jennifer Williams',
      email: 'jennifer.williams@altana.com',
      phone: '+49 281 670-8',
      address: 'Abelstraße 43, 46483 Wesel',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Krones AG',
      contactPerson: 'Franz Huber',
      email: 'franz.huber@krones.com',
      phone: '+49 9401 70-0',
      address: 'Böhmerwaldstraße 5, 93073 Neutraubling',
      country: 'Germany',
      isActive: true,
    },
    {
      companyName: 'Bobst Group SA',
      contactPerson: 'Antoine Lecompte',
      email: 'antoine.lecompte@bobst.com',
      phone: '+41 21 621 21 11',
      address: 'Route de Faraz 3, 1031 Mex',
      country: 'Switzerland',
      isActive: true,
    }
  ];

  for (const customerData of customers) {
    const existingCustomer = await prisma.customer.findFirst({
      where: { companyName: customerData.companyName },
    });

    if (!existingCustomer) {
      await prisma.customer.create({
        data: customerData,
      });
      console.log(`✅ Created customer: ${customerData.companyName}`);
    } else {
      console.log(`⏭️ Customer already exists: ${customerData.companyName}`);
    }
  }

  console.log('✅ Customer seeding completed successfully!');
  console.log(`📊 Total customers available: ${customers.length}`);
}

async function main() {
  try {
    await seedCustomers();
  } catch (error) {
    console.error('❌ Error seeding customers:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Customer seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Customer seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedCustomers }; 