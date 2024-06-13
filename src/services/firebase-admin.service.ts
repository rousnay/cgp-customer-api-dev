import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

import { ConfigService } from '@config/config.service';

@Injectable()
export class FirebaseAdminService {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {
    const serviceAccount: ServiceAccount = {
      projectId: this.configService.firebaseProjectId,
      clientEmail: this.configService.firebaseClientEmail,
      privateKey: this.configService.firebasePrivateKey.replace(/\\n/g, '\n'),
    };

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  async sendNotification(
    tokens: string[],
    payload: admin.messaging.MessagingPayload,
  ): Promise<admin.messaging.BatchResponse> {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: payload.notification,
      data: payload.data,
      // data: JSON.stringify(payload.data),
    };

    return await this.app.messaging().sendEachForMulticast(message);

    // Mocking the response
    // const response = {
    //   successCount: tokens.length,
    //   failureCount: 0,
    //   responses: tokens.map((token) => ({
    //     success: true,
    //     messageId: `mock_message_id_${token}`,
    //   })),
    // };

    // console.log('Mocked FCM Response:', response);
    // return response as admin.messaging.BatchResponse;
  }

  async sendDeliveryRequestNotification(
    token: string,
    title: string,
    message: string,
    data: { [key: string]: string },
    // payload: admin.messaging.MessagingPayload,
  ): Promise<any> {
    const payload = {
      notification: {
        title: title,
        body: message,
      },
      data: data,
    };

    try {
      const response = await admin.messaging().send({
        token: token,
        ...payload,
      });
      console.log('Successfully sent message:', response);
      // Extract the message ID from the response
      const messageId = response.split('/').pop();
      return messageId;
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}
