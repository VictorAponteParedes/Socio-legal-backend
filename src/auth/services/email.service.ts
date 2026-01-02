import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        this.resend = new Resend(apiKey);
    }

    async sendPasswordResetCode(email: string, code: string, userName: string): Promise<void> {
        try {
            await this.resend.emails.send({
                from: 'SocioLegal <onboarding@resend.dev>', // Email verificado en Resend
                to: email,
                subject: 'Código de Recuperación de Contraseña - SocioLegal',
                html: this.getPasswordResetTemplate(code, userName),
            });
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('No se pudo enviar el correo electrónico');
        }
    }

    private getPasswordResetTemplate(code: string, userName: string): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .container {
                        background-color: #ffffff;
                        border-radius: 12px;
                        padding: 40px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 28px;
                        font-weight: bold;
                        color: #3B82F6;
                        margin-bottom: 10px;
                    }
                    .code-box {
                        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                    }
                    .code {
                        font-size: 42px;
                        font-weight: bold;
                        color: #ffffff;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }
                    .message {
                        color: #64748B;
                        font-size: 14px;
                        text-align: center;
                        margin-top: 30px;
                    }
                    .warning {
                        background-color: #FEF3C7;
                        border-left: 4px solid #F59E0B;
                        padding: 15px;
                        margin-top: 20px;
                        border-radius: 4px;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #E5E7EB;
                        color: #9CA3AF;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">⚖️ SocioLegal</div>
                        <h2 style="color: #1F2937; margin: 0;">Recuperación de Contraseña</h2>
                    </div>
                    
                    <p>Hola <strong>${userName}</strong>,</p>
                    
                    <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código de verificación:</p>
                    
                    <div class="code-box">
                        <div class="code">${code}</div>
                    </div>
                    
                    <p style="text-align: center; color: #64748B;">
                        Este código es válido por <strong>15 minutos</strong>
                    </p>
                    
                    <div class="warning">
                        <strong>⚠️ Importante:</strong> Si no solicitaste este cambio, ignora este correo. Tu contraseña permanecerá sin cambios.
                    </div>
                    
                    <div class="message">
                        Si tienes problemas, contáctanos en soporte@sociolegal.com
                    </div>
                    
                    <div class="footer">
                        © ${new Date().getFullYear()} SocioLegal. Todos los derechos reservados.
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}
