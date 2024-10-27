import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DataService } from "./data.service.ts";

@Controller()
@ApiTags("Data")
export class DataController {
  constructor(private readonly service: DataService) {}

  @Get()
  getData() {
    return this.service.getData();
  }
}
