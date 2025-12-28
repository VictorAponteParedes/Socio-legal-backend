"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.enableCors({
        origin: configService.get('cors.origin'),
        credentials: true,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    const port = configService.get('port') || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Application is running on:`);
    console.log(`   - Local:    http://localhost:${port}/api`);
    console.log(`   - Network:  http://192.168.22.173:${port}/api`);
    console.log(`   - Android:  http://10.0.2.2:${port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map