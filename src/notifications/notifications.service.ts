import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor() {
    this.initializeFirebase();
  }

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (admin.apps.length === 0) {
      try {
        let serviceAccount: any;
        const serviceAccountPath = path.resolve(
          process.cwd(),
          'serviceAccountKey.json',
        );

        if (fs.existsSync(serviceAccountPath)) {
          serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, 'utf8'),
          );
          console.log('✅ Firebase: Cargado desde archivo local');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
          const buffer = Buffer.from(
            process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
            'base64',
          );
          serviceAccount = JSON.parse(buffer.toString('utf8'));
          console.log('✅ Firebase: Cargado desde variable de entorno BASE64');
        } else {
          console.error(
            '❌ FATAL: No se encontró serviceAccountKey.json NI variable FIREBASE_SERVICE_ACCOUNT_BASE64',
          );
          return;
        }

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin Initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
      }
    }
  }

  async sendPushNotification(
    token: string,
    title: string,
    body: string,
    data?: any,
  ) {
    if (!token) {
      console.warn('⚠️ No token provided for push notification');
      return;
    }

    try {
      const message: admin.messaging.Message = {
        token: token,
        notification: {
          title: title,
          body: body,
        },
        data: data || {}, // Datos adicionales opcionales
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'default', // Importante para Android 8+
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log('🚀 Notification sent successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  }
}
