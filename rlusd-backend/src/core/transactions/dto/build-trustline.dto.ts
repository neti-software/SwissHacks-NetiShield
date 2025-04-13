import { IsString } from 'class-validator';

export class BuildTrustlineDto {
  @IsString()
  account: string;
}
