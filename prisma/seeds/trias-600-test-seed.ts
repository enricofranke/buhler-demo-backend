import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTrias600TestMachine() {
  console.log('🌱 Seeding Trias-600 Test Machine with comprehensive configurations...');

  // 0. Clean up existing Trias-600 data to avoid duplicates
  console.log('🧹 Cleaning up existing Trias-600 data...');
  
  // Delete in correct order due to foreign key constraints
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

  // 1. Get or create Trias Machine Group
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
      description: 'Trias-600 FDAD Test Machine with comprehensive configuration options',
      groupId: triasGroup.id,
      tags: ['FDAD', '600mm', 'test-machine', 'enterprise'],
      isActive: true,
    },
  });

  console.log('✅ Trias-600 test machine created:', trias600Machine.name);

  // 3. Create Configuration Tabs for Testing
  const generalTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'General Configuration',
      description: 'Basic machine parameters and settings',
      order: 1,
      isActive: true,
    },
  });

  const performanceTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Performance & Ranges',
      description: 'Performance settings with sliders and range inputs',
      order: 2,
      isActive: true,
    },
  });

  const advancedTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Advanced Features',
      description: 'Advanced configuration options with validations',
      order: 3,
      isActive: true,
    },
  });

  const testingTab = await prisma.configurationTab.create({
    data: {
      machineId: trias600Machine.id,
      name: 'Testing & Validation',
      description: 'Test configurations for validation and error handling',
      order: 4,
      isActive: true,
    },
  });

  console.log('✅ Configuration tabs created');

  // 4. Create comprehensive test configurations

  // === GENERAL TAB CONFIGURATIONS ===
  
  // TEXT Configuration with validation
  const machineNameConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Machine Name',
      description: 'Custom name for your machine installation',
      helpText: 'Enter a unique name for your machine (3-50 characters)',
      type: 'TEXT',
      isRequired: true,
      aiLogicHint: 'Should reflect the production environment and location. Validation: 3-50 chars, alphanumeric. Metadata: showCharacterCount=true, examples=Production Line A',
      isActive: true
    },
  });

  // SINGLE_CHOICE Configuration
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

  // BOOLEAN Configuration
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

  // === PERFORMANCE TAB CONFIGURATIONS ===
  
  // NUMBER Configuration with slider
  const speedConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Processing Speed',
      description: 'Set the processing speed for your production requirements',
      helpText: 'Higher speeds increase throughput but may affect quality. Range: 10-1000 rpm, input type: slider, presets: Low(100), Medium(400), High(700), Extreme(950)',
      type: 'NUMBER',
      isRequired: true,
      aiLogicHint: 'Slider input type, unit=rpm, min=10, max=1000, step=10, recommendedMin=100, recommendedMax=800',
      isActive: true,
    },
  });

  // NUMBER Configuration with stepper
  const operatorsConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Number of Operators',
      description: 'How many operators will work with this machine',
      helpText: 'Affects safety requirements and workspace design',
      type: 'NUMBER',
      isRequired: true,
      isActive: true,
      validation: {
        min: 1,
        max: 8,
        step: 1
      },
      metadata: {
        inputType: 'stepper',
        unit: 'persons',
        presetValues: [
          { label: 'Single', value: 1, description: 'One operator setup' },
          { label: 'Team', value: 2, description: 'Two operator team' },
          { label: 'Shift', value: 4, description: 'Full shift coverage' }
        ]
      }
    },
  });

  // RANGE Configuration
  const temperatureRangeConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Operating Temperature Range',
      description: 'Define the operating temperature range for your environment',
      helpText: 'Machine will operate safely within this temperature range',
      type: 'RANGE',
      isRequired: true,
      isActive: true,
      validation: {
        min: -20,
        max: 80,
        step: 1
      },
      metadata: {
        unit: '°C',
        showRangeSize: true,
        presetRanges: [
          { label: 'Indoor Standard', min: 15, max: 25, description: 'Standard indoor environment', unit: '°C' },
          { label: 'Industrial', min: 5, max: 40, description: 'Industrial environment', unit: '°C' },
          { label: 'Extreme', min: -10, max: 60, description: 'Extreme conditions', unit: '°C' }
        ]
      }
    },
  });

  // === ADVANCED TAB CONFIGURATIONS ===
  
  // NUMBER Configuration with free input
  const customVoltageConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Custom Voltage',
      description: 'Specify custom voltage requirements for your installation',
      helpText: 'Enter voltage in Volts (e.g., 230, 400, 480)',
      type: 'NUMBER',
      isRequired: false,
      isActive: true,
      validation: {
        min: 110,
        max: 690,
        step: 1
      },
      metadata: {
        inputType: 'number',
        unit: 'V',
        presetValues: [
          { label: 'EU Standard', value: 400, description: 'European standard voltage', unit: 'V' },
          { label: 'US Standard', value: 480, description: 'US industrial standard', unit: 'V' },
          { label: 'UK Standard', value: 230, description: 'UK standard voltage', unit: 'V' }
        ]
      }
    },
  });

  // TEXT Configuration with pattern validation
  const serialNumberConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Serial Number Prefix',
      description: 'Define a custom serial number prefix for tracking',
      helpText: 'Format: 2-4 uppercase letters followed by dash (e.g., TR-)',
      type: 'TEXT',
      isRequired: false,
      isActive: true,
      validation: {
        minLength: 3,
        maxLength: 5,
        pattern: '^[A-Z]{2,4}-$',
        patternMessage: 'Must be 2-4 uppercase letters followed by a dash'
      },
      metadata: {
        showCharacterCount: true,
        formatExamples: [
          { value: 'TR-', description: 'Trias prefix' },
          { value: 'PROD-', description: 'Production prefix' },
          { value: 'LAB-', description: 'Laboratory prefix' }
        ]
      }
    },
  });

  // === TESTING TAB CONFIGURATIONS ===
  
  // Configuration that will cause validation errors (required but hard to fill correctly)
  const strictConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Strict Validation Test',
      description: 'This configuration has strict validation rules for testing',
      helpText: 'Must be exactly 42 characters with specific pattern',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
      validation: {
        minLength: 42,
        maxLength: 42,
        pattern: '^TEST-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-END$',
        patternMessage: 'Must match pattern: TEST-XXXX-XXXX-XXXX-XXXX-END'
      },
      metadata: {
        showCharacterCount: true,
        formatExamples: [
          { value: 'TEST-1234-ABCD-5678-EFGH-END', description: 'Valid pattern example' }
        ]
      }
    },
  });

  // Range with narrow limits to trigger warnings
  const narrowRangeConfig = await prisma.configuration.create({
    data: {
      name: 'Trias-600 Precision Range',
      description: 'A narrow range configuration for precision testing',
      helpText: 'Very narrow operating range - warnings will appear outside optimal range',
      type: 'RANGE',
      isRequired: true,
      isActive: true,
      validation: {
        min: 0,
        max: 10,
        step: 0.1,
        recommendedMin: 3,
        recommendedMax: 7
      },
      metadata: {
        unit: 'mm',
        showRangeSize: true,
        presetRanges: [
          { label: 'Optimal', min: 3.5, max: 6.5, description: 'Recommended range', unit: 'mm' },
          { label: 'Safe', min: 2.0, max: 8.0, description: 'Safe operating range', unit: 'mm' }
        ]
      }
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
        isRecommended: true,
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
        isAiSuggested: true,
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
        isRecommended: true,
      }
    ],
  });

  console.log('✅ Configuration options created');

  // 6. Link Configurations to Tabs
  
  // General Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: generalTab.id, configurationId: machineNameConfig.id },
      { tabId: generalTab.id, configurationId: motorPowerConfig.id },
      { tabId: generalTab.id, configurationId: safetyPackageConfig.id },
    ],
  });

  // Performance Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: performanceTab.id, configurationId: speedConfig.id },
      { tabId: performanceTab.id, configurationId: operatorsConfig.id },
      { tabId: performanceTab.id, configurationId: temperatureRangeConfig.id },
    ],
  });

  // Advanced Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: advancedTab.id, configurationId: customVoltageConfig.id },
      { tabId: advancedTab.id, configurationId: serialNumberConfig.id },
    ],
  });

  // Testing Tab Configurations
  await prisma.tabConfiguration.createMany({
    data: [
      { tabId: testingTab.id, configurationId: strictConfig.id },
      { tabId: testingTab.id, configurationId: narrowRangeConfig.id },
    ],
  });

  console.log('✅ Tab-Configuration links created');

  // 7. Summary
  console.log('\n🎉 Trias-600 Test Machine seeding completed!');
  console.log('\n📋 Created configurations:');
  console.log('   General Tab (3 configs):');
  console.log('   • Machine Name (TEXT, required, with pattern validation)');
  console.log('   • Motor Power (SINGLE_CHOICE, required, 4 options)');
  console.log('   • Safety Package (BOOLEAN, optional)');
  console.log('\n   Performance Tab (3 configs):');
  console.log('   • Processing Speed (NUMBER/slider, required, with presets)');
  console.log('   • Number of Operators (NUMBER/stepper, required)');
  console.log('   • Temperature Range (RANGE, required, with presets)');
  console.log('\n   Advanced Tab (2 configs):');
  console.log('   • Custom Voltage (NUMBER/input, optional, with presets)');
  console.log('   • Serial Number Prefix (TEXT, optional, strict pattern)');
  console.log('\n   Testing Tab (2 configs):');
  console.log('   • Strict Validation Test (TEXT, required, very strict rules)');
  console.log('   • Precision Range (RANGE, required, narrow with warnings)');
  console.log('\n🧪 Test Features:');
  console.log('   ✅ All new configuration types (NUMBER, RANGE)');
  console.log('   ✅ Different input types (slider, stepper, number input)');
  console.log('   ✅ Validation with min/max and patterns');
  console.log('   ✅ Required vs optional fields');
  console.log('   ✅ Preset values and ranges');
  console.log('   ✅ Configurations that will trigger errors/warnings');
  console.log('   ✅ Metadata with units and examples');
}

// Export the seeding function
export { seedTrias600TestMachine };

// Run if called directly
if (require.main === module) {
  seedTrias600TestMachine()
    .catch((e) => {
      console.error('❌ Trias-600 test seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
} 