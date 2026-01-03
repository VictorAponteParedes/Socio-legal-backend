import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'El correo es requerido' })
    @IsEmail({}, { message: 'Correo inválido' })
    email: string;

    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @IsString()
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @IsOptional()
    @IsString()
    fcmToken?: string;
}
