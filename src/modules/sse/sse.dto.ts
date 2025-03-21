import { ApiProperty } from '@nestjs/swagger';

export class Counter {
  @ApiProperty({ default: 0 })
  counter: number;

  constructor(args: Counter) {
    Object.assign(this, args);
  }
}

export class CounterDto extends MessageEvent<Counter> {
  static event = 'counter';

  @ApiProperty({ default: CounterDto.event })
  event: string;

  @ApiProperty({ type: Counter })
  data: Counter;

  constructor(args: Counter) {
    super(CounterDto.event, { data: args });
  }
}

export class NotificationsDto extends MessageEvent<string> {
  static event = 'notification';

  @ApiProperty({ default: NotificationsDto.event })
  event: string;

  @ApiProperty({ default: 'notification value' })
  data: string;

  constructor(args: string) {
    super(NotificationsDto.event, { data: args });
  }
}
