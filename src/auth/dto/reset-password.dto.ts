import { IsEmail, IsNotEmpty, IsString, MinLength, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
    code: string;

    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es obligatoria' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    newPassword: string;
}
