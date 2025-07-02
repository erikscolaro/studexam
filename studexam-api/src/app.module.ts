import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ProvaModule } from './provva/prova/prova.module';
import { PackageModule } from './package/package.module';
import { CollectionModule } from './collection/collection.module';
import { CategoryModule } from './category/category.module';
import { CardModule } from './card/card.module';
import { IssueModule } from './issue/issue.module';
import { SubscriptionModule } from './subscription/subscription.module';
import * as config from '../config.json';
import Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        //TODO
      }),
      isGlobal: true,
      load: [() => config],
    }),
    UserModule,
    ProvaModule,
    PackageModule,
    CollectionModule,
    CategoryModule,
    CardModule,
    IssueModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
