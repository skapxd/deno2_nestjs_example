import { ApiProperty } from "@nestjs/swagger";

export class Counter {
  @ApiProperty({ default: 0 })
  counter: number;

  constructor(args: Counter) {
    Object.assign(this, args);
  }
}

export class CounterDto {
  static event = "counter";

  @ApiProperty({ default: CounterDto.event })
  type = CounterDto.event;

  @ApiProperty({ type: Counter })
  data: Counter;

  constructor(args: Counter) {
    this.data = args;
  }

  toString() {
    return `event: ${CounterDto.event}\ndata: ${JSON.stringify(this.data)}\n\n`;
  }
}

export class NotificationsDto extends MessageEvent<string> {
  static event = "notification";

  @ApiProperty({ default: NotificationsDto.event })
  event: string;

  @ApiProperty({ default: "notification value" })
  override data: string;

  constructor(args: string) {
    super(NotificationsDto.event, { data: args });
  }
}
