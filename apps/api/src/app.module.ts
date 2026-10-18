import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CheckerService } from './checker/checker.service';
import { TestPageController } from './dev/test-page.controller';
import { EventsController } from './events/events.controller';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { SourcesController } from './sources/sources.controller';
import { SourcesService } from './sources/sources.service';
import { WatchesController } from './watches/watches.controller';
import { WatchesService } from './watches/watches.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [HealthController, WatchesController, SourcesController, EventsController, TestPageController],
  providers: [PrismaService, WatchesService, SourcesService, CheckerService],
})
export class AppModule {}
