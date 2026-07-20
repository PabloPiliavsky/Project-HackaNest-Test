import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateHackathonDto } from './dto/create-hackathon.dto';
import { UpdateHackathonDto } from './dto/update-hackathon.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HackathonsService {
  constructor(private prisma: PrismaService) { }

  create(createHackathonDto: CreateHackathonDto) {
    return this.prisma.hackathon.create({
      data: createHackathonDto,
    });
  }

  findAll() {
    return this.prisma.hackathon.findMany({
      orderBy: { start: 'desc' }
    });
  }

  async findOne(id: number) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: id },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }

    return hackathon;
  }

  update(id: number, updateHackathonDto: UpdateHackathonDto) {
    return this.prisma.hackathon.update({
      where: { id: id },
      data: updateHackathonDto,
    });
  }

  remove(id: number) {
    return this.prisma.hackathon.delete({
      where: { id: id },
    });
  }

  async join(hackathonId: number, personId: number) {
    const hackathon = await this.findOne(hackathonId);

    if (!hackathon.isActive) {
      throw new BadRequestException('Hackathon is not longer active');
    }

    if (new Date() > hackathon.end) {
      throw new BadRequestException('Hackathon has already ended');
    }

    const existingParticipant = await this.prisma.hackathonParticipant.findUnique({
      where: {
        personId_hackathonId: {
          personId: personId,
          hackathonId: hackathonId,
        }
      }
    });

    if (existingParticipant) {
      throw new BadRequestException('You are already enrolled in this hackathon');
    }

    return this.prisma.hackathonParticipant.create({
      data: {
        personId: personId,
        hackathonId: hackathonId,
      }
    });
  }
}
