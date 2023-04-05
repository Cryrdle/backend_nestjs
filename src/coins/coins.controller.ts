import { Controller, Body, Get, Post, Query, Param } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { ApiBody } from '@nestjs/swagger';
import { UpdateCoinsListDto } from './dto'
import { ErrorMessageDTO } from 'src/dto';

// let TODAY_WINNING_COIN:string = "DOGE";

@Controller()
export class CoinsController {
  constructor(
    private readonly appService: CoinsService
  ) {
    // this.updateCoinsList(); // uncomment when not constantly restarting server
  }

  //---GETTERS

  @Get("user/:coinIdx")
  getWinningCoin(@Param('index') index: number): Promise<any> {
    console.log("get winning coin by index: ", index);
    return this.appService.getWinningCoin(index);
  }

  @Get("coins")
  getAllCoins(): Promise<object[]> {
    console.log("get all coins");
    return this.appService.findAll();
  }

  //---SETTERS

  @Post("update-coins-list")
  updateCoinsList(): Promise<UpdateCoinsListDto | ErrorMessageDTO> {
    return this.appService.dailyReset();
  }

}