import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTriasMachine() {
  console.log('🌱 Seeding Trias machine...');

  // 1. Create Trias Machine Group
  const triasGroup = await prisma.machineGroup.upsert({
    where: { name: 'Trias' },
    update: {},
    create: {
      name: 'Trias',
      description: 'Trias grinding machine series with multiple roller length options',
      color: '#2563eb',
      icon: 'machine-grinding',
      isActive: true,
    },
  });

  console.log('✅ Trias machine group created:', triasGroup.name);

  // 2. Create Trias Machines (300, 600, 800)
  let trias300Machine = await prisma.machine.findFirst({
    where: { name: 'Trias-300' },
  });

  if (!trias300Machine) {
    trias300Machine = await prisma.machine.create({
      data: {
        name: 'Trias-300',
        description: 'Trias-300 FDAD with 300mm roller length',
        groupId: triasGroup.id,
        tags: ['FDAD', '300mm', 'compact'],
        isActive: true,
      },
    });
  }

  let trias600Machine = await prisma.machine.findFirst({
    where: { name: 'Trias-600' },
  });

  if (!trias600Machine) {
    trias600Machine = await prisma.machine.create({
      data: {
        name: 'Trias-600',
        description: 'Trias-600 FDAD with 600mm roller length',
        groupId: triasGroup.id,
        tags: ['FDAD', '600mm', 'standard'],
        isActive: true,
      },
    });
  }

  let trias800Machine = await prisma.machine.findFirst({
    where: { name: 'Trias-800' },
  });

  if (!trias800Machine) {
    trias800Machine = await prisma.machine.create({
      data: {
        name: 'Trias-800',
        description: 'Trias-800 FDAC with 800mm roller length',
        groupId: triasGroup.id,
        tags: ['FDAC', '800mm', 'large'],
        isActive: true,
      },
    });
  }

  console.log('✅ Trias machines created:', trias300Machine.name, trias600Machine.name, trias800Machine.name);

  // 3. Create Configuration Tabs for Trias-300
  const generalTab = await prisma.configurationTab.create({
    data: {
      machineId: trias300Machine.id,
      name: 'General',
      description: 'General configuration settings',
      order: 1,
      isActive: true,
    },
  });

  const equipmentTab = await prisma.configurationTab.create({
    data: {
      machineId: trias300Machine.id,
      name: 'Equipment',
      description: 'Equipment and hardware configurations',
      order: 2,
      isActive: true,
    },
  });

  const automationTab = await prisma.configurationTab.create({
    data: {
      machineId: trias300Machine.id,
      name: 'Automation',
      description: 'Automation and control system configurations',
      order: 3,
      isActive: true,
    },
  });

  const servicesTab = await prisma.configurationTab.create({
    data: {
      machineId: trias300Machine.id,
      name: 'Services',
      description: 'Additional services and support options',
      order: 4,
      isActive: true,
    },
  });

  console.log('✅ Configuration tabs created');

  // 4. Create Configurations and Options

  // === GENERAL TAB CONFIGURATIONS ===
  
  // 1. Consultation Value
  const consultationValueConfig = await prisma.configuration.create({
    data: {
      name: 'Consultation Value',
      description: 'Vorabgefüllt',
      helpText: 'Wert wird automatisch generiert, fortführend, kann nicht geändert werden',
      type: 'TEXT',
      isRequired: false,
      isActive: true,
    },
  });

  // 2. Bühler Contact
  const buhlerContactConfig = await prisma.configuration.create({
    data: {
      name: 'Bühler Contact',
      description: 'Vorabgefüllt',
      helpText: 'Bühler User, der das Tool bedient. Kann geändert werden',
      type: 'TEXT',
      isRequired: false,
      isActive: true,
    },
  });

  // 3. Customer Name
  const customerNameConfig = await prisma.configuration.create({
    data: {
      name: 'Customer Name',
      description: 'Eingabefeld',
      helpText: '',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
    },
  });

  // 4. Customer Contact Person
  const customerContactPersonConfig = await prisma.configuration.create({
    data: {
      name: 'Customer Contact Person',
      description: 'Eingabefeld',
      helpText: '',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
    },
  });

  // 5. Contact Person E-Mail
  const contactPersonEmailConfig = await prisma.configuration.create({
    data: {
      name: 'Contact Person E-Mail',
      description: 'Eingabefeld',
      helpText: 'Mailadresse',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
    },
  });

  // 6. Customer Country
  const customerCountryConfig = await prisma.configuration.create({
    data: {
      name: 'Customer Country',
      description: 'Selection / Suche',
      helpText: 'Auswahlliste von allen Ländern der Erde',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  // Add comprehensive country list
  const countries = [
    'Germany', 'Switzerland', 'Austria', 'France', 'Italy', 'Spain', 'Netherlands',
    'Belgium', 'United Kingdom', 'Poland', 'Czech Republic', 'Hungary', 'Slovakia',
    'Slovenia', 'Croatia', 'Romania', 'Bulgaria', 'Greece', 'Portugal', 'Ireland',
    'Denmark', 'Sweden', 'Norway', 'Finland', 'Iceland', 'Estonia', 'Latvia', 
    'Lithuania', 'Luxembourg', 'Malta', 'Cyprus', 'China', 'Japan', 'South Korea',
    'Taiwan', 'Hong Kong', 'Singapore', 'Malaysia', 'Thailand', 'Vietnam', 
    'Philippines', 'Indonesia', 'India', 'Pakistan', 'Bangladesh', 'Sri Lanka',
    'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Colombia',
    'Peru', 'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Australia',
    'New Zealand', 'South Africa', 'Egypt', 'Morocco', 'Tunisia', 'Algeria',
    'Nigeria', 'Kenya', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Zimbabwe',
    'Russia', 'Ukraine', 'Belarus', 'Turkey', 'Israel', 'Saudi Arabia', 'UAE',
    'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Jordan', 'Lebanon', 'Iran', 'Iraq'
  ];

  for (const country of countries) {
    await prisma.configurationOption.create({
      data: {
        configurationId: customerCountryConfig.id,
        value: country.toLowerCase().replace(/\s+/g, '_'),
        displayName: country,
        isDefault: country === 'Germany',
        isActive: true,
      },
    });
  }

  // 7. Customer Language
  const customerLanguageConfig = await prisma.configuration.create({
    data: {
      name: 'Customer Language',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const languages = ['English', 'German', 'French', 'Italian', 'Spanish', 'Portuguese', 'Chinese', 'Japanese', 'Korean'];
  for (const language of languages) {
    await prisma.configurationOption.create({
      data: {
        configurationId: customerLanguageConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // 8. Target Application
  const targetApplicationConfig = await prisma.configuration.create({
    data: {
      name: 'Target Application',
      description: 'Selection /Suche',
      helpText: 'Die fett markierten sind Selektion 1, wenn diese getätigt wurde, muss eine unterselektion getätigt werden. Wenn OTHERS gewählt wird, muss die Applikation in einem Freitextfeld genauer spezifiert werden. In der DB sollen beide Werte in einem separaten Feld gespeichert werden (bspw.: Electronic Materials, Functional Inks. Wenn möglich soll auch direct nach einer Endapplikation gesucht werden können.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  // Target Application options with detailed subcategories
  const targetApplications = [
    { 
      value: 'electronic_materials', 
      displayName: 'Electronic Materials',
      description: 'Functional inks, Silver pastes, aluminium pastes, Metal pastes, Glass solder pastes, MLCC'
    },
    { 
      value: 'functional_materials', 
      displayName: 'Functional Materials',
      description: 'Sealants, Adhesives, Lubricants, Ceramic pastes, High performance composites'
    },
    { 
      value: 'printing_inks', 
      displayName: 'Printing Inks',
      description: 'UV curable inks, Packaging inks, Security inks, Sheet fed inks, Web offset inks'
    },
    { 
      value: 'cosmetics_self_care', 
      displayName: 'Cosmetics & Self Care',
      description: 'Lipstick, Lip Balm / Gloss, Sunscreen, Foundations, BB Cream, Hair styling, Waxes'
    },
    { 
      value: 'others', 
      displayName: 'Others',
      description: ''
    }
  ];

  for (const app of targetApplications) {
    await prisma.configurationOption.create({
      data: {
        configurationId: targetApplicationConfig.id,
        value: app.value,
        displayName: app.displayName,
        description: app.description,
        isActive: true,
      },
    });
  }

  // 9. Machine Production Country
  const machineProductionCountryConfig = await prisma.configuration.create({
    data: {
      name: 'Machine Production Country',
      description: 'Selection',
      helpText: 'Gewählter Wert soll später Einfluss auf Lieferzeiten und hinterlegte Preise haben',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const productionCountries = ['China', 'Switzerland', 'No Preference'];
  for (const country of productionCountries) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineProductionCountryConfig.id,
        value: country.toLowerCase().replace(/\s+/g, '_'),
        displayName: country,
        isDefault: country === 'No Preference',
        isActive: true,
      },
    });
  }

  // === EQUIPMENT TAB CONFIGURATIONS (for Trias-300) ===

  // 1. Marking
  const markingConfig = await prisma.configuration.create({
    data: {
      name: 'Marking',
      description: 'Selection',
      helpText: 'Die Auswahl soll aufgrund des eingegebenen Landes schon vorausgewählt sein, wobei alle europäische Länder = CE Mark haben und die USA / Kanada das UL /CSA. Bei anderen Ländern bleibt das leer',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const markingOptions = ['CE Mark', 'UL Mark', 'No Mark', 'Other'];
  for (const marking of markingOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: markingConfig.id,
        value: marking.toLowerCase().replace(/\s+/g, '_'),
        displayName: marking,
        isActive: true,
      },
    });
  }

  // 2. Explosion Protection
  const explosionProtectionConfig = await prisma.configuration.create({
    data: {
      name: 'Explosion Protection',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const explosionProtectionOptions = [
    { value: 'no_protection', displayName: 'No Protection', isDefault: true },
    { value: 'atex_zone_ii_europe', displayName: 'ATEX, Zone II (Europe)' },
    { value: 'ul_ex_zone_ii_usa', displayName: 'UL-EX, Zone II (USA)' },
    { value: 'iecex_zone_ii_international', displayName: 'IECEx, Zone II (International)' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of explosionProtectionOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: explosionProtectionConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 3. Machine Frame Surface
  const machineFrameSurfaceConfig = await prisma.configuration.create({
    data: {
      name: 'Machine Frame Surface',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const frameSurfaceOptions = [
    { value: 'mild_steel_buhler', displayName: 'Mild Steel, Bühler Industrial Design', isDefault: true },
    { value: 'stainless_steel', displayName: 'Stainless Steel, Surface quality Ra <0.6 μm' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of frameSurfaceOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineFrameSurfaceConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 4. Machine Design
  const machineDesignConfig = await prisma.configuration.create({
    data: {
      name: 'Machine Design',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const machineDesignOptions = [
    { value: 'open_version', displayName: 'Open Version', isDefault: true },
    { value: 'clean_room_version', displayName: 'Clean Room Version' }
  ];

  for (const option of machineDesignOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineDesignConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 5. Gears Material
  const gearsMaterialConfig = await prisma.configuration.create({
    data: {
      name: 'Gears Material',
      description: 'Selection',
      helpText: 'Wenn bei Machine Design "Open Version" gewählt, dann ist "Cast iron" vorselektiert. Sonst ist "Plastic gears" vorselektiert',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const gearsMaterialOptions = [
    { value: 'cast_iron_bevelled', displayName: 'Cast iron gears, bevelled', isDefault: true },
    { value: 'plastic_gears_bevelled', displayName: 'Plastic gears, bevelled' }
  ];

  for (const option of gearsMaterialOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: gearsMaterialConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 6. Machine Side Cover
  const machineSideCoverConfig = await prisma.configuration.create({
    data: {
      name: 'Machine Side Cover',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const sideCoverOptions = [
    { value: 'open_side_cover', displayName: 'Open side cover for air circulation', isDefault: true },
    { value: 'closed_side_covers', displayName: 'Closed side covers' }
  ];

  for (const option of sideCoverOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineSideCoverConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 7. V-Belt Cover
  const vBeltCoverConfig = await prisma.configuration.create({
    data: {
      name: 'V-Belt Cover',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const vBeltCoverOptions = [
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'with', displayName: 'With' }
  ];

  for (const option of vBeltCoverOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: vBeltCoverConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 8. Aspiration Nozzle
  const aspirationNozzleConfig = await prisma.configuration.create({
    data: {
      name: 'Aspiration Nozzle',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const aspirationNozzleOptions = [
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'with_pivotable', displayName: 'With (Pivotable: Ø 80mm)' }
  ];

  for (const option of aspirationNozzleOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: aspirationNozzleConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 9. Machine stand / Stand Foot
  const machineStandConfig = await prisma.configuration.create({
    data: {
      name: 'Machine stand / Stand Foot',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const machineStandOptions = [
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'with_adjustable', displayName: 'With (Adjustable: 50 – 140 mm)' }
  ];

  for (const option of machineStandOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineStandConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 10. Power drive
  const powerDriveConfig = await prisma.configuration.create({
    data: {
      name: 'Power drive',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const powerDriveOptions = [
    { value: '11_kw', displayName: '11 kW', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of powerDriveOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: powerDriveConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 11. Rollers
  const rollersConfig = await prisma.configuration.create({
    data: {
      name: 'Rollers',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const rollersOptions = [
    { value: 'ooo_steel', displayName: 'OOO (Steel)', isDefault: true },
    { value: 'ppp_steel', displayName: 'PPP (Steel)' },
    { value: 'pvp_steel', displayName: 'PVP (Steel)' },
    { value: 'vvv_steel', displayName: 'VVV (Steel)' },
    { value: 'pvp_steel_ceramic', displayName: 'PVP (P = Steel, V = Ceramic)' },
    { value: 'vvv_ceramic', displayName: 'VVV (Ceramic)' }
  ];

  for (const option of rollersOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: rollersConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 12. Cooling System
  const coolingSystemConfig = await prisma.configuration.create({
    data: {
      name: 'Cooling System',
      description: 'Selection',
      helpText: 'Wenn Bei Rollers = "OOO" gewählt, sind nur die atmospheric options verfügbar. Sonst sind nur die pressurized options verfügbar.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const coolingSystemOptions = [
    { value: 'flow_atmospheric', displayName: 'Flow through with atmospheric conditions', isDefault: true },
    { value: 'closed_atmospheric', displayName: 'Closed/Circuit with atmospheric conditions' },
    { value: 'flow_pressurized', displayName: 'Flow through with pressurized conditions' },
    { value: 'closed_pressurized', displayName: 'Closed/Circuit with pressurized conditions' }
  ];

  for (const option of coolingSystemOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: coolingSystemConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 13. Roller Preheating Function
  const rollerPreheatingConfig = await prisma.configuration.create({
    data: {
      name: 'Roller Preheating Function',
      description: 'Selection',
      helpText: 'Wenn bei Application "Printing Inks" gewählt wird, ist "With" vorgewählt. Wenn bei Cooling System "Flow through" gewählt wurde, ist nur "without" anwählbar',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const rollerPreheatingOptions = [
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'with_recommended', displayName: 'With (Recommended for Inks)' }
  ];

  for (const option of rollerPreheatingOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: rollerPreheatingConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 14. Hopper plates: Front
  const hopperPlatesFrontConfig = await prisma.configuration.create({
    data: {
      name: 'Hopper plates: Front',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const hopperPlatesFrontOptions = [
    { value: 'stainless_steel', displayName: 'Stainless Steel', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of hopperPlatesFrontOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: hopperPlatesFrontConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 15. Hopper plates: Side
  const hopperPlatesSideConfig = await prisma.configuration.create({
    data: {
      name: 'Hopper plates: Side',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const hopperPlatesSideOptions = [
    { value: 'thermosetting_plastic_cw229', displayName: 'Thermosetting plastic, CW229', isDefault: true },
    { value: 'thermosetting_plastic_pom', displayName: 'Thermosetting plastic, POM' },
    { value: 'bronze', displayName: 'Bronze' },
    { value: 'cast_iron', displayName: 'Cast Iron' },
    { value: 'stainless_steel', displayName: 'Stainless Steel' }
  ];

  for (const option of hopperPlatesSideOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: hopperPlatesSideConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 16. Hopper Level Control
  const hopperLevelControlConfig = await prisma.configuration.create({
    data: {
      name: 'Hopper Level Control',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const hopperLevelControlOptions = [
    { value: 'with_full_control', displayName: 'With Full Control', isDefault: true },
    { value: 'only_dry_running_protection', displayName: 'Only Dry Running Protection' }
  ];

  for (const option of hopperLevelControlOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: hopperLevelControlConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 17. Product Feeding System
  const productFeedingSystemConfig = await prisma.configuration.create({
    data: {
      name: 'Product Feeding System',
      description: 'Selection',
      helpText: 'Wenn "Press Out" gewählt, öffnet sich "Press out Feeding" Selection. Sonst öffnet sich "Pump Feeding" Selection',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const productFeedingSystemOptions = [
    { value: 'feeding_press_out_system', displayName: 'Feeding with Press Out System', isDefault: true },
    { value: 'feeding_with_pump', displayName: 'Feeding with Pump' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of productFeedingSystemOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: productFeedingSystemConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 18. Control of Press Out
  const controlOfPressOutConfig = await prisma.configuration.create({
    data: {
      name: 'Control of Press Out',
      description: 'Selection',
      helpText: 'Wird nur angezeigt, wenn bei "Product Feeding System" = Feeding with Press Out System" gewählt',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlOfPressOutOptions = [
    { value: 'control_via_machine_automation', displayName: 'Control via machine automation system', isDefault: true },
    { value: 'control_via_feeding_valve_24vdc', displayName: 'Control via feeding valve (24VDC)' },
    { value: 'control_via_potential_free_contact', displayName: 'Control via potential free contact valve' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlOfPressOutOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlOfPressOutConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 19. Control of Pump
  const controlOfPumpConfig = await prisma.configuration.create({
    data: {
      name: 'Control of Pump',
      description: 'Selection',
      helpText: 'Wird nur angezeigt, wenn bei "Product Feeding System" = Feeding with Pump" gewählt',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlOfPumpOptions = [
    { value: 'feeding_pump_without_power_stack', displayName: 'Feeding with pump (without power stack)', isDefault: true },
    { value: 'feeding_pump_with_power_stack', displayName: 'Feeding with pump (with power stack)' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlOfPumpOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlOfPumpConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 20. Pump Drive in kW
  const pumpDriveConfig = await prisma.configuration.create({
    data: {
      name: 'Pump Drive in kW',
      description: 'Eingabe',
      helpText: 'Wird nur angezeigt, wenn bei "Control of Pump" = Feeding with pump (with power stack)" angewählt',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
    },
  });

  // 21. Mounting of Level Control
  const mountingLevelControlConfig = await prisma.configuration.create({
    data: {
      name: 'Mounting of Level Control',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const mountingLevelControlOptions = [
    { value: 'right_water_side', displayName: 'Right (water side)', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of mountingLevelControlOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: mountingLevelControlConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 22. Knife Holder
  const knifeHolderConfig = await prisma.configuration.create({
    data: {
      name: 'Knife Holder',
      description: '-',
      helpText: 'Position wird im Frontend nicht angezeigt, aber im Backend wird immer diese Option gewählt',
      type: 'TEXT',
      isRequired: true,
      isActive: true,
    },
  });

  // 23. Scraper Knifes
  const scraperKnifesConfig = await prisma.configuration.create({
    data: {
      name: 'Scraper Knifes',
      description: 'Selection',
      helpText: 'Ceramic knives are more robust and have less wear but can only be used with a product temperature below 50° Celsius.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const scraperKnifesOptions = [
    { value: '25_steel_knives', displayName: '25 steel knives (40 x 0.6 x 350mm)', isDefault: true },
    { value: '5_ceramic_knives', displayName: '5 ceramic knives (40 x 0.6 x 350 mm)' }
  ];

  for (const option of scraperKnifesOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: scraperKnifesConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 24. Apron (Outlet Sheet)
  const apronOutletSheetConfig = await prisma.configuration.create({
    data: {
      name: 'Apron (Outlet Sheet)',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const apronOutletSheetOptions = [
    { value: 'stainless_steel_conical_150mm', displayName: 'Stainless steel, conical shape, 150 mm', isDefault: true },
    { value: 'stainless_steel_straight_340mm', displayName: 'Stainless steel, straight shape, 340 mm' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of apronOutletSheetOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: apronOutletSheetConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 25. Heating of Apron / Scraper
  const heatingApronScraperConfig = await prisma.configuration.create({
    data: {
      name: 'Heating of Apron / Scraper',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const heatingApronScraperOptions = [
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'with', displayName: 'With' }
  ];

  for (const option of heatingApronScraperOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: heatingApronScraperConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 26. Safety bar for cleaning
  const safetyBarCleaningConfig = await prisma.configuration.create({
    data: {
      name: 'Safety bar for cleaning',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const safetyBarCleaningOptions = [
    { value: 'with_aluminium_electronic', displayName: 'With (Aluminium, electronically secured)', isDefault: true },
    { value: 'without', displayName: 'Without' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of safetyBarCleaningOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: safetyBarCleaningConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 27. Collecting trough
  const collectingTroughConfig = await prisma.configuration.create({
    data: {
      name: 'Collecting trough',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const collectingTroughOptions = [
    { value: 'with_stainless_steel_electric', displayName: 'With (Stainless steel, electrically secured)', isDefault: true },
    { value: 'without', displayName: 'Without' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of collectingTroughOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: collectingTroughConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 28. Protection device for rolls
  const protectionDeviceRollsConfig = await prisma.configuration.create({
    data: {
      name: 'Protection device for rolls',
      description: 'Selection',
      helpText: 'We recommend a protective hood for your operator safety. A draw-in guard is only applicable for low viscosity products.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const protectionDeviceRollsOptions = [
    { value: 'protective_hood_stainless', displayName: 'Protective hood (stainless steel)', isDefault: true },
    { value: 'draw_in_guard_gap1', displayName: 'Draw-in guard at Gap 1 (stainless steel)' },
    { value: 'both_devices', displayName: 'Both devices (hood and draw-in guard)' },
    { value: 'without', displayName: 'Without' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of protectionDeviceRollsOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: protectionDeviceRollsConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 29. Safety Line
  const safetyLineConfig = await prisma.configuration.create({
    data: {
      name: 'Safety Line',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const safetyLineOptions = [
    { value: 'with_mandatory_usa_canada', displayName: 'With (Mandatory for USA & Canada)', isDefault: true },
    { value: 'without', displayName: 'Without' }
  ];

  for (const option of safetyLineOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: safetyLineConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 30. Water Filter
  const waterFilterConfig = await prisma.configuration.create({
    data: {
      name: 'Water Filter',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const waterFilterOptions = [
    { value: 'with', displayName: 'With' },
    { value: 'without', displayName: 'Without', isDefault: true }
  ];

  for (const option of waterFilterOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: waterFilterConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 31. Water Supply with Quick Action Lock
  const waterSupplyQuickActionConfig = await prisma.configuration.create({
    data: {
      name: 'Water Supply with Quick Action Lock',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const waterSupplyQuickActionOptions = [
    { value: 'with', displayName: 'With' },
    { value: 'without', displayName: 'Without', isDefault: true }
  ];

  for (const option of waterSupplyQuickActionOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: waterSupplyQuickActionConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 32. Automatic lubrication system
  const automaticLubricationConfig = await prisma.configuration.create({
    data: {
      name: 'Automatic lubrication system',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const automaticLubricationOptions = [
    { value: 'with', displayName: 'With' },
    { value: 'without', displayName: 'Without', isDefault: true }
  ];

  for (const option of automaticLubricationOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: automaticLubricationConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // === AUTOMATION TAB CONFIGURATIONS (for Trias-300) ===

  // 1. Control System
  const controlSystemConfig = await prisma.configuration.create({
    data: {
      name: 'Control System',
      description: 'Selection',
      helpText: 'Schon ausgefüllt',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  await prisma.configurationOption.create({
    data: {
      configurationId: controlSystemConfig.id,
      value: 'premium_v5_control',
      displayName: 'Premium V5 control',
      description: 'PLC Control Siemens ET-200SP with CPU151X, Operating Panel NonEx: Siemens IPC277G 12", Ex: Stahl Orca 12", Software Bühler Play One, Main Motor Control Frequency controlled main drive',
      isDefault: true,
      isActive: true,
    },
  });

  // 2. Interface to Distributed Control System (DCS)
  const interfaceDcsConfig = await prisma.configuration.create({
    data: {
      name: 'Interface to Distributed Control System (DCS)',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const interfaceDcsOptions = [
    { value: 'with', displayName: 'With' },
    { value: 'without', displayName: 'Without', isDefault: true }
  ];

  for (const option of interfaceDcsOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: interfaceDcsConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 3. Language Control System
  const languageControlSystemConfig = await prisma.configuration.create({
    data: {
      name: 'Language Control System',
      description: 'Selection',
      helpText: 'Wenn möglich, basierend auf der Auswahl von Customer Language vorselektieren. Ansonsten English = Default',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const languageControlOptions = [
    'English', 'Chinese', 'German', 'French', 'Italian', 'Spanish', 'Japanese', 'Korean'
  ];

  for (const language of languageControlOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: languageControlSystemConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // 4. Power Supply
  const powerSupplyConfig = await prisma.configuration.create({
    data: {
      name: 'Power Supply',
      description: 'Selection',
      helpText: 'Soll vorabgewählt sein, anhand des Landes, das ausgewählt wurde. Eine Legende findest du weiter hinten.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  await prisma.configurationOption.create({
    data: {
      configurationId: powerSupplyConfig.id,
      value: 'preselected_by_country',
      displayName: 'Vorabgewählt anhand des Landes',
      description: 'Die Legende (hinten) aufführen',
      isDefault: true,
      isActive: true,
    },
  });

  // 5. Grid Type
  const gridTypeConfig = await prisma.configuration.create({
    data: {
      name: 'Grid Type',
      description: 'Selection',
      helpText: 'Soll nur erscheinen, wenn Japan als Land ausgewählt wurde',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const gridTypeOptions = [
    { value: 'delta_grid_type', displayName: 'Delta Grid Type', isDefault: true },
    { value: 'star_grid_type', displayName: 'Star Grid Type' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of gridTypeOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: gridTypeConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 6. HMI Box Material
  const hmiBoxMaterialConfig = await prisma.configuration.create({
    data: {
      name: 'HMI Box Material',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const hmiBoxMaterialOptions = [
    { value: 'stainless_steel', displayName: 'Stainless Steel', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of hmiBoxMaterialOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: hmiBoxMaterialConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 7. Roller Pressing
  const rollerPressingConfig = await prisma.configuration.create({
    data: {
      name: 'Roller Pressing',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const rollerPressingOptions = [
    { value: 'with_motor_automation', displayName: 'With motor / automation system', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of rollerPressingOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: rollerPressingConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 8. Scraper Knife positioning
  const scraperKnifePositioningConfig = await prisma.configuration.create({
    data: {
      name: 'Scraper Knife positioning',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const scraperKnifePositioningOptions = [
    { value: 'automatic_step_motor', displayName: 'Automatic (with step motor)', isDefault: true },
    { value: 'manually_star_handle', displayName: 'Manually (with star handle)' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of scraperKnifePositioningOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: scraperKnifePositioningConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 9. Language HMI
  const languageHmiConfig = await prisma.configuration.create({
    data: {
      name: 'Language HMI',
      description: 'Selection',
      helpText: 'Basierend auf Language Control System',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  // 10. Control Cabinet: Design
  const controlCabinetDesignConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Design',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlCabinetDesignOptions = [
    { value: 'mild_steel_buhler_design', displayName: 'Mild Steel, Bühler Industry Design', isDefault: true },
    { value: 'no_cabinet', displayName: 'No Cabinet' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlCabinetDesignOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetDesignConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 11. Control Cabinet: Size
  const controlCabinetSizeConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Size',
      description: 'Selection',
      helpText: 'Sofern Protection Class = UL oder ATEX, bzw. UL-EX, dann 1200 x 2200 x 600 vorselektieren',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlCabinetSizeOptions = [
    { value: '800x2200x600', displayName: '800 x 2200 x 600 (W x H x D)', isDefault: true },
    { value: '1200x2200x600', displayName: '1200 x 2200 x 600 mm (W x H x D)' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlCabinetSizeOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetSizeConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 12. Control Cabinet: Ambient Temperature
  const controlCabinetAmbientTempConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Ambient Temperature',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlCabinetAmbientTempOptions = [
    { value: '5_40_celsius', displayName: '5 – 40° Celsius', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlCabinetAmbientTempOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetAmbientTempConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 13. Control Cabinet: Cable Access
  const controlCabinetCableAccessConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Cable Access',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const controlCabinetCableAccessOptions = [
    { value: 'bottom_or_above', displayName: 'Cables can enter from bottom or above', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlCabinetCableAccessOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetCableAccessConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 14. Control Cabinet: Distance to equipment
  const controlCabinetDistanceConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Distance to equipment',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const controlCabinetDistanceOptions = [
    { value: 'distance_under_100m', displayName: 'Distance / Cable Length < 100 meters' },
    { value: 'distance_over_100m', displayName: 'Distance / Cable Length > 100 meters' }
  ];

  for (const option of controlCabinetDistanceOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetDistanceConfig.id,
        value: option.value,
        displayName: option.displayName,
        isActive: true,
      },
    });
  }

  // 15. Control Cabinet: Cables to Equipment
  const controlCabinetCablesConfig = await prisma.configuration.create({
    data: {
      name: 'Control Cabinet: Cables to Equipment',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: false,
      isActive: true,
    },
  });

  const controlCabinetCablesOptions = [
    { value: 'complete_set_cables', displayName: 'Complete Set of Cables' },
    { value: 'only_main_motor_cable', displayName: 'Only Cable for Main Motor' },
    { value: 'without_cables', displayName: 'Without Cables' },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of controlCabinetCablesOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: controlCabinetCablesConfig.id,
        value: option.value,
        displayName: option.displayName,
        isActive: true,
      },
    });
  }

  // === SERVICES TAB CONFIGURATIONS (for Trias-300) ===

  // 1. Tool Set for roller exchange
  const toolSetRollerExchangeConfig = await prisma.configuration.create({
    data: {
      name: 'Tool Set for roller exchange',
      description: 'Counter',
      helpText: 'Per Default soll 1 stehen, kann auf 0 gesetzt werden. FDAD-95220-810',
      type: 'NUMBER',
      isRequired: true,
      isActive: true,
    },
  });

  // 2. Additional scraper knife sets
  const additionalScraperKnifeSetsConfig = await prisma.configuration.create({
    data: {
      name: 'Additional scraper knife sets',
      description: 'Counter',
      helpText: 'Zwei counter, dasjenige Material, das bei Scraper Knife gewählt wurde, soll defaultmässig auf 5 stehen, das andere soll default mässig auf 0 stehen.',
      type: 'MULTIPLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const additionalScraperKnifeOptions = [
    { value: 'steel_set_25pcs', displayName: '- 1 + Set (25 pcs steel set, 40 x 0.6 x 350 mm)' },
    { value: 'ceramic_set_5pcs', displayName: '- 1 + Set (5 pcs ceramic set, 40 x 0.6 x 350 mm)' }
  ];

  for (const option of additionalScraperKnifeOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: additionalScraperKnifeSetsConfig.id,
        value: option.value,
        displayName: option.displayName,
        isActive: true,
      },
    });
  }

  // 3. myBühler Customer Portal (free)
  const myBuhlerPortalConfig = await prisma.configuration.create({
    data: {
      name: 'myBühler Customer Portal (free)',
      description: 'Selection',
      helpText: 'Wenn With gewählt wird, öffnet sich weitere Felder, wo die E-Mail-Adressen und die Rechte der User befragt werden. Die Standard-Rechte sind dabei immer auf "Admin". Zudem gibt es bei jedem User eine Checkbox: Training.',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const myBuhlerPortalOptions = [
    { value: 'with', displayName: 'With' },
    { value: 'without', displayName: 'Without', isDefault: true }
  ];

  for (const option of myBuhlerPortalOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: myBuhlerPortalConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 4. TotalCare Service Contracts (Request for Quotation)
  const totalCareServiceConfig = await prisma.configuration.create({
    data: {
      name: 'TotalCare Service Contracts (Request for Quotation)',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const totalCareServiceOptions = [
    { value: 'inspect_care', displayName: 'Inspect Care' },
    { value: 'maintain_care', displayName: 'Maintain Care' },
    { value: 'maintain_care_plus', displayName: 'Maintain Care Plus' },
    { value: 'without', displayName: 'Without', isDefault: true },
    { value: 'other', displayName: 'Other' }
  ];

  for (const option of totalCareServiceOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: totalCareServiceConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 5. Factory Acceptance Test (FAT)
  const factoryAcceptanceTestConfig = await prisma.configuration.create({
    data: {
      name: 'Factory Acceptance Test (FAT)',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const factoryAcceptanceTestOptions = [
    { value: 'no', displayName: 'No', isDefault: true },
    { value: 'yes', displayName: 'Yes' }
  ];

  for (const option of factoryAcceptanceTestOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: factoryAcceptanceTestConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 6. Start-up & commissioning
  const startUpCommissioningConfig = await prisma.configuration.create({
    data: {
      name: 'Start-up & commissioning',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const startUpCommissioningOptions = [
    { value: 'yes', displayName: 'Yes', isDefault: true },
    { value: 'no', displayName: 'No' }
  ];

  for (const option of startUpCommissioningOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: startUpCommissioningConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 7. Machine / Operator Training
  const machineOperatorTrainingConfig = await prisma.configuration.create({
    data: {
      name: 'Machine / Operator Training',
      description: 'Selection',
      helpText: '',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const machineOperatorTrainingOptions = [
    { value: 'yes_customer_side', displayName: 'Yes: On Customer Side' },
    { value: 'yes_buhler_center', displayName: 'Yes: In Bühler Application Center' },
    { value: 'no', displayName: 'No', isDefault: true }
  ];

  for (const option of machineOperatorTrainingOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: machineOperatorTrainingConfig.id,
        value: option.value,
        displayName: option.displayName,
        isDefault: option.isDefault || false,
        isActive: true,
      },
    });
  }

  // 8. Language: Operating Manual
  const languageOperatingManualConfig = await prisma.configuration.create({
    data: {
      name: 'Language: Operating Manual',
      description: 'Selection',
      helpText: 'Von Customer Language übernehmen, es muss ein Freitextfeld haben, weil in Europa in der effektiven Landessprache des Kunden ausgestellt werden muss',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  const languageDocumentationOptions = [
    'English', 'Chinese', 'German', 'French', 'Italian', 'Spanish', 'Japanese', 'Korean'
  ];

  for (const language of languageDocumentationOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: languageOperatingManualConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // Add "Other (Freitextfeld)" option
  await prisma.configurationOption.create({
    data: {
      configurationId: languageOperatingManualConfig.id,
      value: 'other_freetext',
      displayName: 'Other (Freitextfeld)',
      isActive: true,
    },
  });

  // 9. Language: User Manual
  const languageUserManualConfig = await prisma.configuration.create({
    data: {
      name: 'Language: User Manual',
      description: 'Selection',
      helpText: 'Von Customer Language übernehmen, es muss ein Freitextfeld haben, weil in Europa in der effektiven Landessprache des Kunden ausgestellt werden muss',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  for (const language of languageDocumentationOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: languageUserManualConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // Add "Other (Freitextfeld)" option
  await prisma.configurationOption.create({
    data: {
      configurationId: languageUserManualConfig.id,
      value: 'other_freetext',
      displayName: 'Other (Freitextfeld)',
      isActive: true,
    },
  });

  // 10. Language: Spare Parts Catalogue
  const languageSparePartsCatalogueConfig = await prisma.configuration.create({
    data: {
      name: 'Language: Spare Parts Catalogue',
      description: 'Selection',
      helpText: 'Von Customer Language übernehmen, es muss ein Freitextfeld haben, weil in Europa in der effektiven Landessprache des Kunden ausgestellt werden muss',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  for (const language of languageDocumentationOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: languageSparePartsCatalogueConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // Add "Other (Freitextfeld)" option
  await prisma.configurationOption.create({
    data: {
      configurationId: languageSparePartsCatalogueConfig.id,
      value: 'other_freetext',
      displayName: 'Other (Freitextfeld)',
      isActive: true,
    },
  });

  // 11. Language: Control Schematic
  const languageControlSchematicConfig = await prisma.configuration.create({
    data: {
      name: 'Language: Control Schematic',
      description: 'Selection',
      helpText: 'Von Customer Language übernehmen, es muss ein Freitextfeld haben, weil in Europa in der effektiven Landessprache des Kunden ausgestellt werden muss',
      type: 'SINGLE_CHOICE',
      isRequired: true,
      isActive: true,
    },
  });

  for (const language of languageDocumentationOptions) {
    await prisma.configurationOption.create({
      data: {
        configurationId: languageControlSchematicConfig.id,
        value: language.toLowerCase(),
        displayName: language,
        isDefault: language === 'English',
        isActive: true,
      },
    });
  }

  // Add "Other (Freitextfeld)" option
  await prisma.configurationOption.create({
    data: {
      configurationId: languageControlSchematicConfig.id,
      value: 'other_freetext',
      displayName: 'Other (Freitextfeld)',
      isActive: true,
    },
  });

  // 5. Link Configurations to Tabs
  console.log('✅ Linking configurations to tabs...');

  // General Tab Configurations
  const generalConfigs = [
    consultationValueConfig,
    buhlerContactConfig,
    customerNameConfig,
    customerContactPersonConfig,
    contactPersonEmailConfig,
    customerCountryConfig,
    customerLanguageConfig,
    targetApplicationConfig,
    machineProductionCountryConfig
  ];

  for (let i = 0; i < generalConfigs.length; i++) {
    await prisma.tabConfiguration.create({
      data: {
        tabId: generalTab.id,
        configurationId: generalConfigs[i].id,
        order: i + 1,
      },
    });
  }

  // Equipment Tab Configurations (for Trias-300)
  const equipmentConfigs = [
    markingConfig,
    explosionProtectionConfig,
    machineFrameSurfaceConfig,
    machineDesignConfig,
    gearsMaterialConfig,
    machineSideCoverConfig,
    vBeltCoverConfig,
    aspirationNozzleConfig,
    machineStandConfig,
    powerDriveConfig,
    rollersConfig,
    coolingSystemConfig,
    rollerPreheatingConfig,
    hopperPlatesFrontConfig,
    hopperPlatesSideConfig,
    hopperLevelControlConfig,
    productFeedingSystemConfig,
    controlOfPressOutConfig,
    controlOfPumpConfig,
    pumpDriveConfig,
    mountingLevelControlConfig,
    knifeHolderConfig,
    scraperKnifesConfig,
    apronOutletSheetConfig,
    heatingApronScraperConfig,
    safetyBarCleaningConfig,
    collectingTroughConfig,
    protectionDeviceRollsConfig,
    safetyLineConfig,
    waterFilterConfig,
    waterSupplyQuickActionConfig,
    automaticLubricationConfig
  ];

  for (let i = 0; i < equipmentConfigs.length; i++) {
    await prisma.tabConfiguration.create({
      data: {
        tabId: equipmentTab.id,
        configurationId: equipmentConfigs[i].id,
        order: i + 1,
      },
    });
  }

  // Automation Tab Configurations (for Trias-300)
  const automationConfigs = [
    controlSystemConfig,
    interfaceDcsConfig,
    languageControlSystemConfig,
    powerSupplyConfig,
    gridTypeConfig,
    hmiBoxMaterialConfig,
    rollerPressingConfig,
    scraperKnifePositioningConfig,
    languageHmiConfig,
    controlCabinetDesignConfig,
    controlCabinetSizeConfig,
    controlCabinetAmbientTempConfig,
    controlCabinetCableAccessConfig,
    controlCabinetDistanceConfig,
    controlCabinetCablesConfig
  ];

  for (let i = 0; i < automationConfigs.length; i++) {
    await prisma.tabConfiguration.create({
      data: {
        tabId: automationTab.id,
        configurationId: automationConfigs[i].id,
        order: i + 1,
      },
    });
  }

  // Services Tab Configurations (for Trias-300)
  const servicesConfigs = [
    toolSetRollerExchangeConfig,
    additionalScraperKnifeSetsConfig,
    myBuhlerPortalConfig,
    totalCareServiceConfig,
    factoryAcceptanceTestConfig,
    startUpCommissioningConfig,
    machineOperatorTrainingConfig,
    languageOperatingManualConfig,
    languageUserManualConfig,
    languageSparePartsCatalogueConfig,
    languageControlSchematicConfig
  ];

  for (let i = 0; i < servicesConfigs.length; i++) {
    await prisma.tabConfiguration.create({
      data: {
        tabId: servicesTab.id,
        configurationId: servicesConfigs[i].id,
        order: i + 1,
      },
    });
  }

  console.log('✅ Trias machine seeding completed successfully!');
  console.log(`📊 Created:`);
  console.log(`   - Machine Group: ${triasGroup.name}`);
  console.log(`   - Machines: ${trias300Machine.name}, ${trias600Machine.name}, ${trias800Machine.name}`);
  console.log(`   - Configuration Tabs: 4 (for ${trias300Machine.name})`);
  console.log(`   - General Configurations: ${generalConfigs.length}`);
  console.log(`   - Equipment Configurations: ${equipmentConfigs.length}`);
  console.log(`   - Automation Configurations: ${automationConfigs.length}`);
  console.log(`   - Services Configurations: ${servicesConfigs.length}`);
  console.log(`   - Total Configurations: ${generalConfigs.length + equipmentConfigs.length + automationConfigs.length + servicesConfigs.length}`);
}

async function main() {
  try {
    await seedTriasMachine();
  } catch (error) {
    console.error('❌ Error seeding Trias machine:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

export { main as seedTriasMachine }; 