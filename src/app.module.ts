import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { CoinsModule } from './coins/coins.module';
import { CoinsController } from './coins/coins.controller';
import { CoinsService } from './coins/coins.service';
import { Coin, CoinSchema } from './coins/schemas/coin.schema';


@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }),
    MongooseModule.forFeature([{ name: Coin.name, schema: CoinSchema }]),
    UsersModule,
    CoinsModule,
  ],
  controllers: [AppController, CoinsController],
  providers: [AppService, CoinsService],
})
export class AppModule {}