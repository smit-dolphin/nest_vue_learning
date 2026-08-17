import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService:AuthService){}

    @Post('login')
    loginUser(@Body() body:CreateUserDto){
        return this.authService.loginUser(body)

    }
}
