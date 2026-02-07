import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { CaseResult } from '../entities/case-closure.entity';

export class CloseCaseDto {
    @IsEnum(CaseResult)
    @IsNotEmpty()
    result: CaseResult;

    @IsString()
    @IsNotEmpty()
    closureReason: string;

    @IsString()
    @IsOptional()
    clientComment?: string;

    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(5)
    rating?: number;
}
