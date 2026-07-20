import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHackathonDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'The name must have at least 3 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  // @Type transforms the plain text (String) that arrives in the JSON to a real Date object
  @Type(() => Date)
  @IsDate()
  start: Date;

  @Type(() => Date)
  @IsDate()
  end: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Since hackathons are created by an admin "Person", we need their ID
  @IsNotEmpty()
  authorId: number;
}
