import { Expose } from 'class-transformer';

export class RolesDto {
  @Expose()
  id: number;

  @Expose()
  name: string;
}
