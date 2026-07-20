import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HackathonsModule } from './hackathons/hackathons.module';
import { UsersModule } from './users/users.module';
import { PersonsModule } from './persons/persons.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [HackathonsModule, UsersModule, PersonsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
