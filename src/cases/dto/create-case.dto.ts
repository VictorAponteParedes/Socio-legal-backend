import { IsNotEmpty, IsString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateCaseDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsString()
    category: string;

    @IsOptional()
    @IsIn(['baja', 'media', 'alta'])
    urgency?: string;

    @IsOptional()
    @IsNumber()
    budget?: number;

    @IsOptional()
    @IsString()
    documentUrl?: string;
}
