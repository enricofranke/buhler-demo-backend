import { PartialType } from '@nestjs/swagger';
import { CreateConfigurationTabDto } from './create-configuration-tab.dto';

export class UpdateConfigurationTabDto extends PartialType(CreateConfigurationTabDto) {}