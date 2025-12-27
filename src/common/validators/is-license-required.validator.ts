import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { UserRole } from '../constants/user.constants';

@ValidatorConstraint({ async: false })
export class IsLicenseRequiredConstraint implements ValidatorConstraintInterface {
    validate(license: any, args: ValidationArguments) {
        const object = args.object as any;
        if (object.role === UserRole.LAWYER) {
            return license !== undefined && license !== null && license.trim() !== '';
        }
        return true; // For clients, license is not required
    }

    defaultMessage(args: ValidationArguments) {
        return 'La matrícula es obligatoria para abogados';
    }
}

export function IsLicenseRequired(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsLicenseRequiredConstraint,
        });
    };
}
