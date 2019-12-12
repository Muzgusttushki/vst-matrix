import { Controller, Get, Param } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Get("synth/:phone")
    async synth(@Param("phone") phone: string): Promise<String> {
        await this.paymentsService.Synthesize(phone);
        
        return 'OK';
    }
}
