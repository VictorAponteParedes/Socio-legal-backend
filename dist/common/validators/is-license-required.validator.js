"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsLicenseRequiredConstraint = void 0;
exports.IsLicenseRequired = IsLicenseRequired;
const class_validator_1 = require("class-validator");
const user_constants_1 = require("../constants/user.constants");
let IsLicenseRequiredConstraint = class IsLicenseRequiredConstraint {
    validate(license, args) {
        const object = args.object;
        if (object.role === user_constants_1.UserRole.LAWYER) {
            return license !== undefined && license !== null && license.trim() !== '';
        }
        return true;
    }
    defaultMessage(args) {
        return 'La matrícula es obligatoria para abogados';
    }
};
exports.IsLicenseRequiredConstraint = IsLicenseRequiredConstraint;
exports.IsLicenseRequiredConstraint = IsLicenseRequiredConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], IsLicenseRequiredConstraint);
function IsLicenseRequired(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsLicenseRequiredConstraint,
        });
    };
}
//# sourceMappingURL=is-license-required.validator.js.map