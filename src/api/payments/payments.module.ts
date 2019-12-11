import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './Schemas/PaymentSchema';

@Module({
  providers: [PaymentsService],
  controllers: [PaymentsController],

  imports: [
    MongooseModule.forFeature([
      { name: "payments", schema: PaymentSchema }
    ])
  ]
})

export class PaymentsModule { }
