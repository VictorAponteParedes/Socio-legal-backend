import { IsEmail, IsString, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../common/constants/user.constants';
import { IsLicenseRequired } from '../../common/validators/is-license-required.validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'El apellido es obligatorio' })
    @IsString()
    lastname: string;

    @IsNotEmpty({ message: 'El correo es obligatorio' })
    @IsEmail({}, { message: 'Correo inválido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es obligatoria' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsNotEmpty({ message: 'El rol es obligatorio' })
    @IsEnum(UserRole, { message: 'El rol debe ser client o lawyer' })
    role: UserRole;

    // Only for lawyers - conditional validation
    @IsOptional()
    @IsString()
    @IsLicenseRequired()
    license?: string;
}
