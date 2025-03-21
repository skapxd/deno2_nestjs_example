import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TypeNotificationData {
  @IsString()
  message: string;
}

export class NotificationsDto {
  @IsString()
  event: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => TypeNotificationData)
  data: TypeNotificationData;
}
