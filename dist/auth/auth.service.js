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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../users/entities");
const user_constants_1 = require("../common/constants/user.constants");
let AuthService = class AuthService {
    constructor(userRepository, clientRepository, lawyerRepository, jwtService) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.lawyerRepository = lawyerRepository;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('El correo ya está registrado');
        }
        if (registerDto.role === user_constants_1.UserRole.LAWYER) {
            if (!registerDto.license) {
                throw new common_1.BadRequestException('La matrícula es obligatoria para abogados');
            }
            const existingLawyer = await this.lawyerRepository.findOne({
                where: { license: registerDto.license },
            });
            if (existingLawyer) {
                throw new common_1.ConflictException('La matrícula ya está registrada');
            }
        }
        let newUser;
        if (registerDto.role === user_constants_1.UserRole.CLIENT) {
            newUser = this.clientRepository.create({
                name: registerDto.name,
                lastname: registerDto.lastname,
                email: registerDto.email,
                password: registerDto.password,
                role: user_constants_1.UserRole.CLIENT,
            });
            await this.clientRepository.save(newUser);
        }
        else {
            newUser = this.lawyerRepository.create({
                name: registerDto.name,
                lastname: registerDto.lastname,
                email: registerDto.email,
                password: registerDto.password,
                license: registerDto.license,
                role: user_constants_1.UserRole.LAWYER,
            });
            await this.lawyerRepository.save(newUser);
        }
        const token = this.generateToken(newUser);
        const { password, ...userWithoutPassword } = newUser;
        return {
            message: 'Usuario registrado exitosamente',
            user: userWithoutPassword,
            token,
        };
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            select: ['id', 'email', 'password', 'name', 'lastname', 'role', 'status'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const isPasswordValid = await user.validatePassword(loginDto.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales incorrectas');
        }
        const token = this.generateToken(user);
        const { password, ...userWithoutPassword } = user;
        return {
            message: 'Login exitoso',
            user: userWithoutPassword,
            token,
        };
    }
    async validateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return user;
    }
    generateToken(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        return this.jwtService.sign(payload);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.Client)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Lawyer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map