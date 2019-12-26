import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MessagePattern } from '@nestjs/microservices';
import { LocaleDate } from 'src/utils/LocaleDate';
import { UserListDTO } from './DTO/Microservices/UserListDTO';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @MessagePattern("payments->filters")
    async filters(stage: {
        BrokenDataRange: number[]
        AccessKeys: string[]
    }) {
        const times = new LocaleDate(stage.BrokenDataRange);

        const request = await this.paymentsService.Filters(times.toDate("primary"),
            times.toDate("second"),
            stage.AccessKeys);

        return request;
    }

    @MessagePattern("payments->users")
    async users(stage: UserListDTO, AccessKeys: string[]) {

    }
}
