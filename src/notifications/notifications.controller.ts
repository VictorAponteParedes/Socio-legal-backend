import { Body, Controller, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Post('test')
    async sendTestNotification(@Body() body: { token: string; title?: string; message?: string }) {
        const { token, title, message } = body;
        return await this.notificationsService.sendPushNotification(
            token,
            title || '¡Hola desde NestJS!',
            message || 'Esta es una notificación de prueba enviada desde el backend.',
        );
    }
}
