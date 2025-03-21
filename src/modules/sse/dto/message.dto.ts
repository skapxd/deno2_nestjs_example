import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class MessageData {
  @IsString()
  phone: string;

  @IsString()
  message: string;
}

export class MessageDto {
  @IsString()
  event: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => MessageData)
  data: MessageData;
}
