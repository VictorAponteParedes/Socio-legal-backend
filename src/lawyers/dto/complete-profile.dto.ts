import { IsNotEmpty, IsString, IsInt, IsArray, Min, Max, MinLength } from 'class-validator';

export class CompleteProfileDto {
    @IsNotEmpty({ message: 'Las especialidades son obligatorias' })
    @IsArray()
    specializationIds: number[];

    @IsNotEmpty({ message: 'La biografía es obligatoria' })
    @IsString()
    @MinLength(50, { message: 'La biografía debe tener al menos 50 caracteres' })
    bio: string;

    @IsNotEmpty({ message: 'Los años de experiencia son obligatorios' })
    @IsInt()
    @Min(0)
    @Max(50)
    yearsOfExperience: number;

    @IsNotEmpty({ message: 'Los idiomas son obligatorios' })
    @IsArray()
    languages: string[];

    @IsNotEmpty({ message: 'La ciudad es obligatoria' })
    @IsString()
    city: string;

    @IsNotEmpty({ message: 'El país es obligatorio' })
    @IsString()
    country: string;
}
