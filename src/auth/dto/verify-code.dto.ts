import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyCodeDto {
    @IsEmail({}, { message: 'Email inválido' })
    @IsNotEmpty({ message: 'El email es obligatorio' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'El código es obligatorio' })
    @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
    code: string;
}
