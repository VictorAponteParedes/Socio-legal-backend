import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLawyerServiceDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    price: number;

    @IsNotEmpty()
    @IsString()
    duration: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
