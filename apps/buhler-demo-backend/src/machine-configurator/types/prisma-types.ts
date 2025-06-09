import { Prisma } from '@prisma/client';

// ===================================
// QUERY VALIDATORS (Reusable & Type-Safe)
// ===================================

// Machine Group validators
export const machineGroupWithMachines = Prisma.validator<Prisma.MachineGroupDefaultArgs>()({
  include: { machines: true },
});

// Machine validators  
export const machineWithBasicRelations = Prisma.validator<Prisma.MachineDefaultArgs>()({
  include: {
    group: true,
    configurationTabs: true,
  },
});

export const machineWithFullConfiguration = Prisma.validator<Prisma.MachineDefaultArgs>()({
  include: {
    group: true,
    configurationTabs: {
      include: {
        tabConfigurations: {
          include: {
            configuration: {
              include: {
                options: true,
                validationRules: true,
                parentDependencies: true,
                childDependencies: true,
              },
            },
          },
        },
      },
    },
  },
});

// Configuration validators
export const configurationWithOptions = Prisma.validator<Prisma.ConfigurationDefaultArgs>()({
  include: {
    options: true,
    validationRules: true,
    parentDependencies: true,
    childDependencies: true,
  },
});

// ConfigurationTab validators
export const configurationTabWithConfigurations = Prisma.validator<Prisma.ConfigurationTabDefaultArgs>()({
  include: {
    machine: true,
    tabConfigurations: {
      include: {
        configuration: {
          include: {
            options: true,
          },
        },
      },
    },
  },
});

// ===================================
// TYPE-SAFE PAYLOAD TYPES
// ===================================

// Machine Group types
export type MachineGroupWithMachines = Prisma.MachineGroupGetPayload<typeof machineGroupWithMachines>;

// Machine types
export type MachineWithBasicRelations = Prisma.MachineGetPayload<typeof machineWithBasicRelations>;
export type MachineWithFullConfiguration = Prisma.MachineGetPayload<typeof machineWithFullConfiguration>;

// Configuration types
export type ConfigurationWithOptions = Prisma.ConfigurationGetPayload<typeof configurationWithOptions>;

// ConfigurationTab types
export type ConfigurationTabWithConfigurations = Prisma.ConfigurationTabGetPayload<typeof configurationTabWithConfigurations>;

export type TabConfigurationComplete = Prisma.TabConfigurationGetPayload<{
  include: {
    configuration: {
      include: {
        options: true;
        validationRules: true;
        parentDependencies: { include: { parentConfiguration: { include: { options: true } } } };
        childDependencies: { include: { childConfiguration: { include: { options: true } } } };
      };
    };
  };
}>;

// ===================================
// INPUT TYPES (Re-exports for convenience)
// ===================================
export type MachineGroupCreateInput = Prisma.MachineGroupCreateInput;
export type MachineGroupUpdateInput = Prisma.MachineGroupUpdateInput;
export type MachineCreateInput = Prisma.MachineCreateInput;
export type MachineUpdateInput = Prisma.MachineUpdateInput;
export type ConfigurationCreateInput = Prisma.ConfigurationCreateInput;
export type ConfigurationUpdateInput = Prisma.ConfigurationUpdateInput;

// ===================================
// BASE PRISMA TYPES (Re-exports)
// ===================================
export type { 
  MachineGroup, 
  Machine, 
  Configuration, 
  ConfigurationOption,
  ConfigurationTab,
  TabConfiguration,
  ConfigurationDependency,
  ValidationRule,
  ConfigurationType,
  ConfigurationDependencyAction,
  ValidationRuleType
} from '@prisma/client'; 