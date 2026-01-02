import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProposalDto {
    @IsNotEmpty()
    @IsString()
    message: string;

    @IsOptional()
    @IsNumber()
    proposedFee?: number;

    @IsOptional()
    @IsString()
    estimatedDuration?: string;
}
