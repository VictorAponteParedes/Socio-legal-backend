import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateContactRequestDto {
    @IsNotEmpty()
    @IsUUID()
    lawyerId: string;

    @IsOptional()
    @IsString()
    message?: string;
}
