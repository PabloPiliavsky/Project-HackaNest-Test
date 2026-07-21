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

  async findOne(id: string) {
    const hackathon = await this.prisma.hackathon.findUnique({
      where: { id: id },
      include: {
        participants: {
          include: {
            person: true,
          },
        },
      },
    });

    if (!hackathon) {
      throw new NotFoundException(`Hackathon with ID ${id} not found`);
    }

    return hackathon;
  }

  update(id: string, updateHackathonDto: UpdateHackathonDto) {
    return this.prisma.hackathon.update({
      where: { id: id },
      data: updateHackathonDto,
    });
  }

  remove(id: string) {
    return this.prisma.hackathon.delete({
      where: { id: id },
    });
  }

  async join(hackathonId: string, personId: string) {
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

  async findPersonByUserId(userId: string) {
    const person = await this.prisma.person.findUnique({
      where: { userId },
    });
    if (!person) {
      throw new NotFoundException(`Person profile not found for user ${userId}`);
    }
    return person;
  }

  async joinByUserId(hackathonId: string, userId: string) {
    const person = await this.findPersonByUserId(userId);
    return this.join(hackathonId, person.id);
  }
}
