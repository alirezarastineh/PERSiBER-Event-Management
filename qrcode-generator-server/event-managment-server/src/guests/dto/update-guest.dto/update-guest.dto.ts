import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateGuestDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsBoolean()
  readonly alreadyPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly freeEntry?: boolean;

  @IsOptional()
  @IsString()
  readonly attended?: string;

  @IsOptional()
  @IsString()
  readonly invitedFrom?: string;
}
