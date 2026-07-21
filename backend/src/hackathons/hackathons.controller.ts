import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UnauthorizedException } from '@nestjs/common';
import { HackathonsService } from './hackathons.service';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { RolesGuard } from 'src/auth/roles/roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import * as express from 'express';
import { auth } from '../auth/auth';

@ApiTags('Hackathons')
@Controller('hackathons')
export class HackathonsController {
  constructor(private readonly hackathonsService: HackathonsService) { }

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Crear nueva hackathon (Solo Admins)' })
  async create(@Body() createHackathonDto: CreateHackathonDto, @Req() req: express.Request) {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>)
    });
    if (!session || !session.user) {
      throw new UnauthorizedException('Need to be logged in to perform this action');
    }
    const person = await this.hackathonsService.findPersonByUserId(session.user.id);
    createHackathonDto.authorId = person.id;
    return this.hackathonsService.create(createHackathonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las hackathons' })
  findAll() {
    return this.hackathonsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener hackathon por ID' })
  findOne(@Param('id') id: string) {
    return this.hackathonsService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Actualizar hackathon (Solo Admins)' })
  update(@Param('id') id: string, @Body() updateHackathonDto: UpdateHackathonDto) {
    return this.hackathonsService.update(id, updateHackathonDto);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Eliminar hackathon (Solo Admins)' })
  remove(@Param('id') id: string) {
    return this.hackathonsService.remove(id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Unirse a un hackathon' })
  async join(@Param('id') id: string, @Req() req: express.Request) {
    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>)
    });
    if (!session || !session.user) {
      throw new UnauthorizedException('Need to be logged in to perform this action');
    }
    return this.hackathonsService.joinByUserId(id, session.user.id);
  }
}
