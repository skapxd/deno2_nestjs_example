import { Controller, Get } from "@nestjs/common";
import { readFile } from "node:fs/promises";

@Controller()
export class IndexController {
  @Get()
  async index() {
    const file = await readFile("public/index.html", "utf-8");

    return file;
  }
}
