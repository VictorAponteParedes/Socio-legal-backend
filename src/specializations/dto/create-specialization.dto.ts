import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateSpecializationDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50, { message: 'El ícono no puede exceder 50 caracteres' })
    icon?: string;
}
