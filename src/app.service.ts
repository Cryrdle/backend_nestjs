import { Injectable, Inject } from '@nestjs/common';
import { ethers } from 'ethers';
// import Web3 from 'web3';
import * as tokenJson from './assets/CryrdleManual.json';
import { ErrorMessageDTO, TxnResponseDTO } from './dto';
import dotenv from 'dotenv';
import { CoinsService } from './coins/coins.service';
dotenv.config()

// const CRYRDLE_ADDRESS = "0x45e58025aFaa1Bb2334Fbb84C6DddB7a978281dB"
const TEST_ADDRESS = "0xA2d937F18e9E7fC8d295EcAeBb10Acbd5e77e9eC"
const CRYRDLE_ADDRESS = "0xcDBF47C1fc051997b517c8a4c94f1e5441CbE69e"
const CRYRDLE_ABI = tokenJson.abi; // see ts.config, requires: "resolveJsonModule": true, "allowSyntheticDefaultImports": true,

@Injectable()
export class AppService {
  provider = null;
  signer = null;
  cryrdleContract = null;
  // webInstance = Web3;

  CURRENT_GAME:number = 0;
  ENTRY_FEE_ETH:number = null;
  ENTRY_FEE_WEI = null;
  COIN_OF_THE_DAY_IDX:number = null;
  COIN_OF_THE_DAY_SYMBOL:string = "ETHER";
  PARTICIPANTS = [];

  constructor(private coinsService: CoinsService) {
    this.provider = ethers.providers.getDefaultProvider('sepolia', {
      infura: process.env.INFURA_API_KEY
    });
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.cryrdleContract = new ethers.Contract(CRYRDLE_ADDRESS, CRYRDLE_ABI, this.signer);
  }

  getContractAddress(): string {
    return CRYRDLE_ADDRESS;
  }

  //---SMART CONTRACT RESTful API

  // calling get current info calls all methods which updates class variables
  async getCurrentGameInfo(): Promise<any> {  
    const game = await this.getCurrentGame();
    const players = await this.getParticipants();
    const fee = await this.getParticipationFee();
    const coin_idx = await this.getCoinOfTheDay();

    this.CURRENT_GAME = game;
    this.PARTICIPANTS = players;
    this.COIN_OF_THE_DAY_IDX = coin_idx;
    const coin_symbol = await this.getWinningCoinSymbol(coin_idx);
    this.COIN_OF_THE_DAY_SYMBOL = coin_symbol;

    console.log("stored values:")
    console.log("game:", this.CURRENT_GAME);
    console.log("fee:", this.ENTRY_FEE_ETH);
    console.log("coin:", this.COIN_OF_THE_DAY_SYMBOL);

    // return {game, players, fee, coin};
    return {game, players, fee, coin_symbol};
  }

  //---GETTERS
  async getCurrentGame(): Promise<number> {
    const currentGameBN = await this.cryrdleContract.currentGameNum();
    const currentGame = parseInt(currentGameBN);
    this.CURRENT_GAME = currentGame;
    console.log("currentGame:", this.CURRENT_GAME);
    return currentGame;
  }

  async getParticipants(): Promise<string[]> {
    const participants = await this.cryrdleContract.getParticipants();
    this.PARTICIPANTS = participants;
    console.log("participants:", this.PARTICIPANTS);
    return participants;
  }

  async getParticipationFee(): Promise<number> {
    const entryFeeBN = await this.cryrdleContract.getParticipationFee();
    const entryFeeStr = ethers.utils.formatUnits(entryFeeBN);
    this.ENTRY_FEE_ETH = parseFloat(entryFeeStr);
    this.ENTRY_FEE_WEI = ethers.utils.parseEther(entryFeeStr);
    console.log("Entry fee in ETH:", this.ENTRY_FEE_ETH);
    return this.ENTRY_FEE_ETH;
  }

  async getUserIsPaid(address: string): Promise<boolean> {
    console.log("checking if user is paid.....");
    const participants = await this.cryrdleContract.getParticipants();
    console.log("address:", address);
    console.log("participants:", participants);
    const response = participants.map(p => p.toLowerCase()).includes(address)
    // const response = participants.includes(address.toLowerCase())
    console.log("exists?", response);
    return response;
  }

  // onlyOwner
  // Returns the index, see coin.service.ts to return coin object
  async getCoinOfTheDay(): Promise<number> {
    const coinBN = await this.cryrdleContract.getCoinOfTheDay();
    const coinInt = parseInt(coinBN);
    this.COIN_OF_THE_DAY_IDX = coinInt;
    console.log("coinOfTheDay:", this.COIN_OF_THE_DAY_IDX);
    return coinInt;
  }

  async getWinningCoinSymbol(coinIdx: number): Promise<string> {
    // call mongoDB to get coin symbol and return index
    console.log("getting winning coin symbol.....");
    return await this.coinsService.getWinningCoinSymbol(coinIdx);
  }
  
  //---SETTERS

  // TEMP -- onlyOwner -- not required for full keeper-automated gameply
  async setCoinOfTheDay(coinIdx: number): Promise<TxnResponseDTO | ErrorMessageDTO> {
    let txnError = null;
    let setCoinTxnReceipt = null;

    try {
      const setCoinTxn = await this.cryrdleContract.setCoinOfTheDay(coinIdx);
      setCoinTxnReceipt = await setCoinTxn.wait();
    } catch (error) {
      txnError = error 
    }
    
    if (txnError) {
      return {
        message: "Error while setting coin of the day",
        detailedMessage: JSON.stringify(txnError),
      }
    } else {
      this.COIN_OF_THE_DAY_IDX = coinIdx;
      this.CURRENT_GAME += 1;
      console.log("coin of day:", this.COIN_OF_THE_DAY_IDX)
      console.log("current game:", this.CURRENT_GAME)
    }
    return {
      message: "Successfully set coin of the day",
      transactionHash: setCoinTxnReceipt.transactionHash,
      etherscanLink: `https://sepolia.io/tx/${setCoinTxnReceipt.transactionHash}`,
    }
  }

  // allows called to join Cryrdle for current game
  async setJoinCryrdle(): Promise<TxnResponseDTO | ErrorMessageDTO> {
    let txnError = null;
    let joinTxnReceipt = null;

    try {
      const joinTxn = await this.cryrdleContract.joinCryrdle(
        { "value" : this.ENTRY_FEE_WEI, "gasLimit": 10000000 }
      );
      joinTxnReceipt = await joinTxn.wait();
    } catch (error) {
      txnError = error 
    }
    
    if (txnError) {
      return {
        message: "Error while joining Cryrdle",
        detailedMessage: JSON.stringify(txnError),
      }
    }
    return {
      message: `Successfully joined Cryrdle for game: #${this.CURRENT_GAME}`,
      transactionHash: joinTxnReceipt.transactionHash,
      etherscanLink: `https://sepolia.io/tx/${joinTxnReceipt.transactionHash}`,
    }
  }
  
}
