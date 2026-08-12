import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get(':id')
    getSingleUser(@Param('id') id: string) {
        return this.usersService.getSingleUser(id);
    }

    @Post()
    createUser(@Body() body: { email: string; password: string }) {
        return this.usersService.createUser(body);
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() body: Partial<{ email: string; password: string }>) {
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
