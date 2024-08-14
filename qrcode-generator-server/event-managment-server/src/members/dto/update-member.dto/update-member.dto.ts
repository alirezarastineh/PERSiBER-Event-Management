import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly attended?: string;

  @IsOptional()
  @IsString()
  readonly organizer?: string;

  @IsOptional()
  @IsString()
  readonly invitedFrom?: string;

  @IsOptional()
  @IsBoolean()
  readonly hasLeft?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly isStudent?: boolean;

  @IsOptional()
  @IsDateString()
  readonly untilWhen?: Date | null;
}
