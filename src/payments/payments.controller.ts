import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('create-intent')
  async createPaymentIntent(@Body() body: { amount: number }) {
    return await this.paymentsService.createPaymentIntent(body.amount);
  }
}
