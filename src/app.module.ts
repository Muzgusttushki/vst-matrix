import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './api/payments/payments.module';
import { readFileSync } from 'fs';
import { format } from 'util';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionsModule } from './services/actions/actions.module';


const url = format(
  'mongodb://%s:%s@%s/db1?replicaSet=%s&authSource=%s&ssl=true',
  'cluster',
  'Vh7usUCZydYRQqPP',
  [
    'rc1b-ijpctx9t0lhynznu.mdb.yandexcloud.net:27018'
  ].join(','),
  'rs01',
  'db1'
);

const options = {
  useNewUrlParser: true,
  replicaSet: {
    sslCA: readFileSync('/usr/local/share/ca-certificates/Yandex/YandexInternalRootCA.crt')
  },
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
};



@Module({
  imports: [PaymentsModule,
    MongooseModule.forRoot(url, options),
    ActionsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
