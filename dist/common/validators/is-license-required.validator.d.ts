import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsLicenseRequiredConstraint implements ValidatorConstraintInterface {
    validate(license: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsLicenseRequired(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
