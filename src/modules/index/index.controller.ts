import { Controller, Get } from '@nestjs/common';

@Controller()
export class IndexController {
  @Get()
  async index() {
    return {
      message: `Welcome to the Deno 2 - NestJS -- Example API!`,
    };
  }
}
