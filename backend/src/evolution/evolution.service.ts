import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionService {
  private readonly apiUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
  private readonly apiKey = process.env.EVOLUTION_API_KEY || 'apikey';

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    return {
      'apikey': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  async createInstance(instanceName: string, webhookUrl?: string) {
    try {
      const payload: any = {
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
      };

      if (webhookUrl) {
        payload.webhook = webhookUrl;
        payload.webhook_by_events = false;
        payload.events = [
          "QRCODE_UPDATED",
          "MESSAGES_UPSERT",
          "MESSAGES_UPDATE",
          "CONNECTION_UPDATE"
        ];
      }

      const response = await firstValueFrom(
        this.httpService.post(`${this.apiUrl}/instance/create`, payload, {
          headers: this.getHeaders(),
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error creating Evolution instance',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async sendText(instanceName: string, number: string, text: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.apiUrl}/message/sendText/${instanceName}`,
          { number, text },
          { headers: this.getHeaders() },
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error sending text message',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async fetchInstances() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/instance/fetchInstances`, {
          headers: this.getHeaders(),
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || 'Error fetching instances',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
