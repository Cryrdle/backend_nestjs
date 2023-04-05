import { Controller, Body, Get, Post, Query, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { SetCoinDTO, TxnResponseDTO, ErrorMessageDTO, JoinGameDTO } from './dto';
import { ApiBody } from '@nestjs/swagger';


@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService
  ) {}

  //---GETTERS  

  @Get("contract-address")
  getContractAddress(): string {
    return this.appService.getContractAddress(); // << retrieve from app.service
  }

  @Get("is-paid/:address")
  getUserIsPaid(@Param('address') address: string): Promise<boolean> {
    console.log("get user is paid for address: ", address);
    return this.appService.getUserIsPaid(address);
  }

  @Get("secret-win-index")
  getCoinOfTheDay(): Promise<number> {
    return this.appService.getCoinOfTheDay();
  }

  @Get("refresh-coins-list")
  async saveCoinsToMongoDB(): Promise<void> {
    // const metadata = await this.cmcService.getMetadata();
    // const coins = Object.values(metadata.data);
    // await this.mongoService.saveToMongoDB(coins);
  }

  @Get("fee")
  getParticipationFee(): Promise<number> {
    return this.appService.getParticipationFee();
  }

  @Get("current-game")
  getCurrentGame(): Promise<number> {
    return this.appService.getCurrentGame();
  }

  // @Get("participants")

  @Get("current-game-info")
  async getCurrentGameInfo(): Promise<any> {
    return await this.appService.getCurrentGameInfo();
  }

  //---SETTERS

  //only owner
  @ApiBody({ description: 'Example payload (integer[1,100])'})
  @Post("set-coin-of-the-day")
  setCoinOfTheDay(@Body() body: SetCoinDTO): Promise<TxnResponseDTO | ErrorMessageDTO> {
    const { coinIdx } = body;
    return this.appService.setCoinOfTheDay(coinIdx);
  }

  // MOVE TO FRONT END ELSE OWNER WILL KEEP JOINING
  // @ApiBody({ description: 'Example payload (address)'}) << udpate to include address and fee
  @Post("join-game-for-game-num")
  setjoinCryrdle(): Promise<TxnResponseDTO | ErrorMessageDTO> {
  // setjoinCryrdle(@Body() body: JoinGameDTO): Promise<TxnResponseDTO | ErrorMessageDTO> {
    // const { gameNum } = body;
    // { address, fee} = body; // << we take fee stored in backend (?)
    return this.appService.setJoinCryrdle();
    // return this.appService.setJoinCryrdle();
  }
}

// @Get("daily-points/:address")
// getPlayerDayPointBalance(@Param('address') address: string): Promise<number> {
//   return this.appService.getPlayerDayPointBalance(address);
// }

// @Get("total-points/:address")
// getPlayerTotalPointBalance(@Param('address') address: string): Promise<number> {
//   return this.appService.getPlayerTotalPointBalance(address);
// }