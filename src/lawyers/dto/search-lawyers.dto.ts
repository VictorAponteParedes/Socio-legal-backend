import { IsOptional, IsString, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchLawyersDto {
    @IsOptional()
    @IsString()
    search?: string;
    @IsOptional()
    @IsArray()
    @Type(() => Number)
    @IsNumber({}, { each: true })
    specializationIds?: number[];

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;
}
