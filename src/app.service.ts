import { Injectable } from '@nestjs/common';
import { PaymentsService } from './api/payments/payments.service';

@Injectable()
export class AppService {
  constructor() {

  }

  getHello(): string {
    return 'Hello World!';
  }
}
