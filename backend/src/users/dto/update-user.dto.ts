import { PartialType } from '@nestjs/mapped-types'; // takes all options of CreateUserDto and makes them optional
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) { }
