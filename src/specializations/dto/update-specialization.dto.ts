import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSpecializationDto {
    @IsOptional()
    @IsString()
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;
}
