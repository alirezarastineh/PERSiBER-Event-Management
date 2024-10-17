import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class CreateGuestDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsBoolean()
  readonly freeEntry?: boolean;

  @IsOptional()
  @IsString()
  attended?: string;

  @IsOptional()
  @IsString()
  readonly invitedFrom?: string;

  @IsOptional()
  @IsBoolean()
  readonly isStudent?: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly isLady?: boolean = false;

  @IsOptional()
  @IsDateString()
  readonly untilWhen?: Date | null;
}
