import { PartialType } from '@nestjs/mapped-types';
import { CreateLawyerServiceDto } from './create-lawyer-service.dto';

export class UpdateLawyerServiceDto extends PartialType(CreateLawyerServiceDto) { }
