import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateFieldOfPracticeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
