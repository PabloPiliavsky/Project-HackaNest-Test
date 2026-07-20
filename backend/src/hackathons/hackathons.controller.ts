import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';

@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) {}

  @Post()
  create(@Body() createHackathonDto: CreateHackathonDto) {
    return this.hackathonsService.create(createHackathonDto);
  }

  @Get()
  findAll() {
    return this.hackathonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHackathonDto: UpdateHackathonDto) {
    return this.hackathonsService.update(id, updateHackathonDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hackathonsService.remove(id);
  }
}
