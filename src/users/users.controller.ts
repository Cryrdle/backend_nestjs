import { Controller, Body, Get, Post, Query, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto, UpdateGuessesDto, UpdateGuessesResponseDto } from './dto';
import { ErrorMessageDTO } from 'src/dto';


@Controller()
export class UsersController {
  constructor(
    private readonly appService: UsersService
  ) {}

  //---GETTERS
  
  @Get("users")
  getAllUsers(): Promise<any> {
    console.log("get all users");
    return this.appService.findAll();
  }
  
  @Get("users/:address")
  getUser(@Param('address') address: string): Promise<any> {
    console.log("get user for address: ", address);
    return this.appService.getUser(address);
  }

  // @Get("users/guesses/:gameNum/:address")
  // getMyGuesses(@Param('gameNum','address') address: string): Promise<any> {
  //   console.log("getting guesses of user: ", address);
  //   return this.appService.getMyGuesses(address);
  // }

  //---SETTERS

  @ApiBody({ description: 'body: {address: string}'})
  @Post("create-user")
  createUser(@Body() body: CreateUserDto): Promise<any> | ErrorMessageDTO {
    const { address } = body;
    return this.appService.createUser(address);
  }

  // update users guess array (hardcode address for now)
  @ApiBody({ description: 'Example payload: {"address":"0x123", "gameNum":42, guess:"BTC"}'})
  @Post("set-guess")
  async addGuess(@Body() body: UpdateGuessesDto): Promise<UpdateGuessesResponseDto | ErrorMessageDTO> {
    const { address, guess } = body;
    return this.appService.addGuess(address, guess);
  }
}