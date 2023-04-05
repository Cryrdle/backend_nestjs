import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateGuessesResponseDto } from './dto/index';
import { ErrorMessageDTO } from 'src/dto';

// import { InjectConnection } from '@nestjs/mongoose';
// import { Connection } from 'mongoose';
// constructor(@InjectConnection() private connection: Connection) {} // << for native mongodb

let GAME_NUM:number = 3; // updated each day, stored here (for now?)

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
  async getUser(address: string): Promise<User> {
    return this.userModel.findOne({address: address}).exec();
  }
  
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
  
  //--SETTERS
  async createUser(address: string): Promise<User> {
    const createdUser = new this.userModel({address: address});
    return createdUser.save();
  }

  // async getMyGuesses(address: string[]): Promise<User> {
  //   const userObject = await this.userModel.findOne({address: address}).exec()
  //   const userGuesses = userObject.games.find((game) => game.gameNum === GAME_NUM);
  //   return userGuesses;
  // }

  async addGuess(address: string, guess: string): Promise<UpdateGuessesResponseDto | ErrorMessageDTO> {
    try {
      const user = await this.userModel.findOne({ address }).exec();

      /* TODO: Add middleware:
        -user exists, 
        -user has paid, 
        -no repeated guesses
        -user has not won already
       */
      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }
      
      const gameIndex = user.games.findIndex((game) => game.gameNum === GAME_NUM);

      if (gameIndex === -1) {
        console.log("...game not found, adding game");
        user.games.push({
          gameNum: GAME_NUM,
          guesses: [guess],
        });
        await user.save();
      } else { 
        // await this.userModel.findOneAndUpdate(
        await this.userModel.updateOne(
          { address: address, 'games.gameNum': GAME_NUM },
          { $push: { 'games.$.guesses': guess } },
        );
      }

      return {
        success: true,
        message: 'Guess added successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}