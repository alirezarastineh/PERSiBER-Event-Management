import { IsOptional, IsString } from 'class-validator';

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
}
