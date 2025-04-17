import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateBpplistDto {
  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly attended?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Kourosh', 'Sobhan', 'Mutual'], {
    message: 'Organizer must be either "Kourosh", "Sobhan", or "Mutual".',
  })
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
