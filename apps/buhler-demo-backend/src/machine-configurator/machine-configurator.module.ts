import { Module } from '@nestjs/common';
import { MachineGroupModule } from './machine-group/machine-group.module';
import { MachineModule } from './machine/machine.module';
import { ConfigurationModule } from './configuration/configuration.module';
import { ConfigurationTabModule } from './configuration-tab/configuration-tab.module';

@Module({
  imports: [
    MachineGroupModule,
    MachineModule,
    ConfigurationModule,
    ConfigurationTabModule,
  ],
  exports: [
    MachineGroupModule,
    MachineModule,
    ConfigurationModule,
    ConfigurationTabModule,
  ],
})
export class MachineConfiguratorModule {} 