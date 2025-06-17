import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTrias600SimpleMachine() {
  console.log('🌱 Seeding Trias-600 Simple Test Machine...');

  // 0. Clean up existing Trias-600 data
  console.log('🧹 Cleaning up existing Trias-600 data...');
  
  await prisma.tabConfiguration.deleteMany({
    where: {
      tab: {
        machine: {
          name: 'Trias-600'
        }
      }
    }
  });

  await prisma.configurationOption.deleteMany({
    where: {
      configuration: {
        name: {
          contains: 'Trias-600'
        }
      }
    }
  });

  await prisma.configuration.deleteMany({
    where: {
      name: {
        contains: 'Trias-600'
      }
    }
  });

  await prisma.configurationTab.deleteMany({
    where: {
      machine: {
        name: 'Trias-600'
      }
    }
  });

  await prisma.machine.deleteMany({
    where: {
      name: 'Trias-600'
    }
  });

  // 1. Get Trias Machine Group
  const triasGroup = await prisma.machineGroup.findFirst({
    where: { name: 'Trias' }
  });

  if (!triasGroup) {
    throw new Error('Trias machine group not found. Please run trias-machine-seed first.');
  }

  // 2. Create Trias-600 Test Machine
  const trias600Machine = await prisma.machine.create({
    data: {
      name: 'Trias-600',
      description: 'Trias-600 FDAD Test Machine with enterprise configuration testing',
      groupId: triasGroup.id,
      tags: ['FDAD', '600mm', 'test-machine', 'enterprise'],
      isActive: true,
    },
  });

  console.log('✅ Trias-600 test machine created:', trias600Machine.name);

  // 3. Create Configuration Tabs
  const generalTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'General Configuration',
      description: 'Basic machine parameters and settings with validation tests',
      order: 1,
      isActive: true,
    },
  });

  const performanceTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Performance Settings',
      description: 'Performance parameters with number inputs and sliders',
      order: 2,
      isActive: true,
    },
  });

  const advancedTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Advanced Features',
      description: 'Advanced configuration options',
      order: 3,
      isActive: true,
    },
  });

  const testingTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Testing & Validation',
      description: 'Configurations for testing validation and error handling',
      order: 4,
      isActive: true,
    },
  });

  console.log('✅ Configuration tabs created');

  // 4. Create test configurations

  // === GENERAL TAB ===
  
  // Required TEXT Configuration
  const machineNameConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Machine Name',
      description: 'Custom name for your machine installation',
      helpText: 'Enter a unique name for your machine (3-50 characters, alphanumeric)',
      type: 'TEXT',
      isRequired: true,
      aiLogicHint: 'Validation: min=3, max=50, pattern=alphanumeric+spaces+hyphens+underscores',
      isActive: true,
    },
  });

  // Required SINGLE_CHOICE Configuration
  const motorPowerConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Motor Power',
      description: 'Select the motor power for optimal performance',
      helpText: 'Higher power enables faster processing but increases energy consumption',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      aiLogicHint: 'Consider production volume and material hardness',
      isActive: true,
    },
  });

  // Optional BOOLEAN Configuration
  const safetyPackageConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Advanced Safety Package',
      description: 'Enhanced safety systems for operator protection',
      helpText: 'Includes emergency stops, light curtains, and safety monitoring',
      type: 'BOOLEAN',
      isRequired: false,
      isActive: true,
    },
  });

  // === PERFORMANCE TAB ===
  
  // Required NUMBER Configuration (slider)
  const speedConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Processing Speed',
      description: 'Set the processing speed for your production requirements',
      helpText: 'Higher speeds increase throughput but may affect quality. Range: 10-1000 rpm',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'inputType=slider, unit=rpm, min=10, max=1000, step=10, presets=Low(100),Medium(400),High(700)',
      isActive: true,
    },
  });

  // Required NUMBER Configuration (stepper)
  const operatorsConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Number of Operators',
      description: 'How many operators will work with this machine',
      helpText: 'Affects safety requirements and workspace design (1-8 persons)',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'inputType=stepper, unit=persons, min=1, max=8, step=1',
      isActive: true,
    },
  });

  // Required NUMBER Configuration for temperature (range simulation)
  const temperatureMinConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Min Operating Temperature',
      description: 'Minimum operating temperature for your environment',
      helpText: 'Machine will operate safely above this temperature (-20 to 60°C)',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'inputType=number, unit=°C, min=-20, max=60, step=1, related=temperatureMax',
      isActive: true,
    },
  });

  const temperatureMaxConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Max Operating Temperature',
      description: 'Maximum operating temperature for your environment',
      helpText: 'Machine will operate safely below this temperature (0 to 80°C)',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'inputType=number, unit=°C, min=0, max=80, step=1, related=temperatureMin',
      isActive: true,
    },
  });

  // === ADVANCED TAB ===
  
  // Optional NUMBER Configuration
  const customVoltageConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Custom Voltage',
      description: 'Specify custom voltage requirements for your installation',
      helpText: 'Enter voltage in Volts (110-690V), leave empty for standard',
      type: 'NUMBER',
      isRequired: false,
      aiLogicHint: 'inputType=number, unit=V, min=110, max=690, presets=EU(400),US(480),UK(230)',
      isActive: true,
    },
  });

  // Optional TEXT Configuration with strict pattern
  const serialPrefixConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Serial Number Prefix',
      description: 'Define a custom serial number prefix for tracking',
      helpText: 'Format: 2-4 uppercase letters followed by dash (e.g., TR-, PROD-, LAB-)',
      type: 'TEXT',
      isRequired: false,
      aiLogicHint: 'pattern=^[A-Z]{2,4}-$, examples=TR-,PROD-,LAB-',
      isActive: true,
    },
  });

  // === TESTING TAB ===
  
  // Required TEXT with very strict validation (will cause errors)
  const strictTestConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Strict Validation Test',
      description: 'This configuration has very strict validation rules for testing',
      helpText: 'Must be exactly 42 characters: TEST-XXXX-XXXX-XXXX-XXXX-END (will show validation errors)',
      type: 'TEXT',
      isRequired: true,
      aiLogicHint: 'pattern=^TEST-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-END$, length=42',
      isActive: true,
    },
  });

  // Required NUMBER with narrow range (will cause warnings)
  const precisionConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Precision Measurement',
      description: 'A precision measurement with narrow optimal range',
      helpText: 'Very narrow operating range (0-10mm), optimal 3-7mm, will show warnings outside optimal',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'inputType=number, unit=mm, min=0, max=10, step=0.1, recommendedMin=3, recommendedMax=7',
      isActive: true,
    },
  });

  console.log('✅ All configurations created');

  // 5. Create Configuration Options

  // Motor Power Options
  await prisma.configurationOption.createMany({
    data: [
      {
        configurationId: motorPowerConfig.id,
        value: '7.5kw',
        displayName: '7.5 kW Standard',
        description: 'Suitable for medium production loads',
        priceModifier: 0,
        isDefault: true,
        isActive: true,
      },
      {
        configurationId: motorPowerConfig.id,
        value: '11kw',
        displayName: '11 kW Enhanced',
        description: 'Recommended for higher throughput',
        priceModifier: 3500,
        isDefault: false,
        isActive: true,
      },
      {
        configurationId: motorPowerConfig.id,
        value: '15kw',
        displayName: '15 kW Premium',
        description: 'Maximum performance for heavy-duty applications',
        priceModifier: 7000,
        isDefault: false,
        isActive: true,
      },
      {
        configurationId: motorPowerConfig.id,
        value: '22kw',
        displayName: '22 kW Extreme',
        description: 'Extreme performance for specialized applications',
        priceModifier: 12000,
        isDefault: false,
        isActive: true,
      }
    ],
  });

  // Safety Package Options
  await prisma.configurationOption.createMany({
    data: [
      {
        configurationId: safetyPackageConfig.id,
        value: 'enabled',
        displayName: 'Enable Advanced Safety',
        description: 'Includes all advanced safety features and monitoring',
        priceModifier: 4500,
        isDefault: false,
        isActive: true,
      }
    ],
  });

  console.log('✅ Configuration options created');

  // 6. Link Configurations to Tabs
  
  // General Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: generalTab.id, configurationId: machineNameConfig.id, order: 1 },
      { tabId: generalTab.id, configurationId: motorPowerConfig.id, order: 2 },
      { tabId: generalTab.id, configurationId: safetyPackageConfig.id, order: 3 },
    ],
  });

  // Performance Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: performanceTab.id, configurationId: speedConfig.id, order: 1 },
      { tabId: performanceTab.id, configurationId: operatorsConfig.id, order: 2 },
      { tabId: performanceTab.id, configurationId: temperatureMinConfig.id, order: 3 },
      { tabId: performanceTab.id, configurationId: temperatureMaxConfig.id, order: 4 },
    ],
  });

  // Advanced Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: advancedTab.id, configurationId: customVoltageConfig.id, order: 1 },
      { tabId: advancedTab.id, configurationId: serialPrefixConfig.id, order: 2 },
    ],
  });

  // Testing Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: testingTab.id, configurationId: strictTestConfig.id, order: 1 },
      { tabId: testingTab.id, configurationId: precisionConfig.id, order: 2 },
    ],
  });

  console.log('✅ Tab-Configuration links created');

  // 7. Summary
  console.log('\n🎉 Trias-600 Test Machine seeding completed!');
  console.log('\n📋 Created configurations by tab:');
  console.log('   General Tab (3 configs):');
  console.log('   • Machine Name (TEXT, required, pattern validation)');
  console.log('   • Motor Power (SINGLE_CHOICE, required, 4 options)');
  console.log('   • Safety Package (BOOLEAN, optional)');
  console.log('\n   Performance Tab (4 configs):');
  console.log('   • Processing Speed (NUMBER, required, slider input type)');
  console.log('   • Number of Operators (NUMBER, required, stepper input type)');
  console.log('   • Min Operating Temperature (NUMBER, required)');
  console.log('   • Max Operating Temperature (NUMBER, required)');
  console.log('\n   Advanced Tab (2 configs):');
  console.log('   • Custom Voltage (NUMBER, optional, with presets)');
  console.log('   • Serial Number Prefix (TEXT, optional, strict pattern)');
  console.log('\n   Testing Tab (2 configs):');
  console.log('   • Strict Validation Test (TEXT, required, very strict rules)');
  console.log('   • Precision Measurement (NUMBER, required, narrow range)');
  console.log('\n🧪 Test Features:');
  console.log('   ✅ Different input types encoded in aiLogicHint');
  console.log('   ✅ Required vs optional fields');
  console.log('   ✅ Various validation scenarios');
  console.log('   ✅ Configurations that will trigger validation errors');
  console.log('   ✅ Number ranges and presets in metadata');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Update frontend to parse aiLogicHint for input types');
  console.log('   2. Implement validation parsing from helpText/aiLogicHint');
  console.log('   3. Test all new configuration components');
}

// Export the seeding function
export { seedTrias600SimpleMachine };

// Run if called directly
if (require.main === module) {
  seedTrias600SimpleMachine()
    .catch((e) => {
      console.error('❌ Trias-600 test seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 