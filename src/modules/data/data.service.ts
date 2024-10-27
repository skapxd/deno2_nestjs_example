import { Injectable } from "@nestjs/common";

@Injectable()
export class DataService {
  getData() {
    return { data: { message: "Hello World!" } };
  }
}
