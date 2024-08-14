import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  readonly name: string;

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
  readonly hasLeft?: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly isStudent?: boolean = false;

  @IsOptional()
  @IsDateString()
  readonly untilWhen?: Date | null;
}
