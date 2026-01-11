import { IsNotEmpty, IsEnum } from 'class-validator';
import { ContactRequestStatus } from '../entities/contact-request.entity';

export class UpdateContactRequestStatusDto {
    @IsNotEmpty()
    @IsEnum(ContactRequestStatus)
    status: ContactRequestStatus;
}
