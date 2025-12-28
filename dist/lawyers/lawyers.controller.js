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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LawyersController = void 0;
const common_1 = require("@nestjs/common");
const lawyers_service_1 = require("./lawyers.service");
const update_lawyer_profile_dto_1 = require("./dto/update-lawyer-profile.dto");
const complete_profile_dto_1 = require("./dto/complete-profile.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_constants_1 = require("../common/constants/user.constants");
let LawyersController = class LawyersController {
    constructor(lawyersService) {
        this.lawyersService = lawyersService;
    }
    findAll() {
        return this.lawyersService.findAll();
    }
    findOne(id) {
        return this.lawyersService.findOne(id);
    }
    findBySpecialization(id) {
        return this.lawyersService.findBySpecialization(id);
    }
    findByCity(city) {
        return this.lawyersService.findByCity(city);
    }
    getMyProfile(user) {
        return this.lawyersService.getMyProfile(user.userId);
    }
    checkProfileCompletion(user) {
        return this.lawyersService.checkProfileCompletion(user.userId);
    }
    completeProfile(user, completeDto) {
        return this.lawyersService.completeProfile(user.userId, completeDto);
    }
    updateMyProfile(user, updateDto) {
        return this.lawyersService.updateMyProfile(user.userId, updateDto);
    }
    softDelete(user) {
        return this.lawyersService.softDelete(user.userId);
    }
    reactivate(user) {
        return this.lawyersService.reactivate(user.userId);
    }
};
exports.LawyersController = LawyersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('specialization/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findBySpecialization", null);
__decorate([
    (0, common_1.Get)('city/:city'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('city')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "findByCity", null);
__decorate([
    (0, common_1.Get)('me/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "getMyProfile", null);
__decorate([
    (0, common_1.Get)('me/completion'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "checkProfileCompletion", null);
__decorate([
    (0, common_1.Post)('me/complete-profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "completeProfile", null);
__decorate([
    (0, common_1.Patch)('me/profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_lawyer_profile_dto_1.UpdateLawyerProfileDto]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "updateMyProfile", null);
__decorate([
    (0, common_1.Delete)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "softDelete", null);
__decorate([
    (0, common_1.Post)('me/reactivate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_constants_1.UserRole.LAWYER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LawyersController.prototype, "reactivate", null);
exports.LawyersController = LawyersController = __decorate([
    (0, common_1.Controller)('lawyers'),
    __metadata("design:paramtypes", [lawyers_service_1.LawyersService])
], LawyersController);
//# sourceMappingURL=lawyers.controller.js.map