import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBpplistDto {
  @IsString()
  readonly name: string;

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
  readonly hasLeft?: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly isStudent?: boolean = false;

  @IsOptional()
  @IsDateString()
  readonly untilWhen?: Date | null;
}
