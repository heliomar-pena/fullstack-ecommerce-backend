import { IsNotEmpty } from 'class-validator';

export class JwtPayloadDto {
  @IsNotEmpty()
  public id: number;
}
