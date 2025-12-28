"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteProfileDto = void 0;
const class_validator_1 = require("class-validator");
class CompleteProfileDto {
}
exports.CompleteProfileDto = CompleteProfileDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Las especialidades son obligatorias' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CompleteProfileDto.prototype, "specializationIds", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La biografía es obligatoria' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50, { message: 'La biografía debe tener al menos 50 caracteres' }),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Los años de experiencia son obligatorios' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CompleteProfileDto.prototype, "yearsOfExperience", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Los idiomas son obligatorios' }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CompleteProfileDto.prototype, "languages", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La ciudad es obligatoria' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El país es obligatorio' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CompleteProfileDto.prototype, "country", void 0);
//# sourceMappingURL=complete-profile.dto.js.map