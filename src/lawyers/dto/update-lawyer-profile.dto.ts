import { IsOptional, IsString, IsInt, IsArray, IsBoolean, Min, Max } from 'class-validator';

export class UpdateLawyerProfileDto {
    @IsOptional()
    @IsString()
    bio?: string;

    @IsOptional()
    @IsArray()
    specializationIds?: number[];

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(50)
    yearsOfExperience?: number;

    @IsOptional()
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsString()
    officeAddress?: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
