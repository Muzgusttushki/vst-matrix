import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './Schemas/PaymentSchema';
import { ActionsModule } from '../../services/actions/actions.module';
import { ActionSchema } from '../../services/actions/Schemas/ActionSchema';

@Module({
  providers: [PaymentsService],
  controllers: [PaymentsController],

  imports: [
    MongooseModule.forFeature([
      { name: "t_payments", schema: PaymentSchema },
      { name: "buyers", schema: ActionSchema }
    ]),

    ActionsModule
  ]
})

export class PaymentsModule { }
