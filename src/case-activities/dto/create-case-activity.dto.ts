import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { ActivityType } from '../entities/case-activity.entity';

export class CreateCaseActivityDto {
    @IsEnum(ActivityType)
    @IsNotEmpty()
    type: ActivityType;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @IsOptional()
    caseId?: number;

    @IsDateString()
    @IsNotEmpty()
    scheduledDate: string;

    @IsString()
    @IsNotEmpty()
    scheduledTime: string;

    @IsString()
    @IsOptional()
    documentUrl?: string;
}
