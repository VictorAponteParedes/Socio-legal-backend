import { IsEnum, IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';
import { CaseUpdateType } from '../entities/case-update.entity';

export class CreateCaseUpdateDto {
    @IsEnum(CaseUpdateType)
    type: CaseUpdateType;

    @IsString()
    @MaxLength(100)
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    attachmentUrl?: string;

    @IsOptional()
    @IsDateString()
    eventDate?: string;
}
