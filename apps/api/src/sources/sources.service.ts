import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SOURCES } from './sources.data';

@Injectable()
export class SourcesService implements OnModuleInit {
  private readonly log = new Logger(SourcesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Keeps the ready-made list in the database in sync with sources.data.ts on every start. */
  async onModuleInit() {
    try {
      await this.prisma.$transaction(
        SOURCES.map((s, i) =>
          this.prisma.source.upsert({ where: { id: s.id }, create: { ...s, sortOrder: i }, update: { ...s, sortOrder: i } }),
        ),
      );
    } catch (e) {
      this.log.error(`Could not sync ready-made sources. Is the database up and pushed? ${(e as Error).message}`);
    }
  }

  list() {
    return this.prisma.source.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  get(id: string) {
    return this.prisma.source.findUnique({ where: { id } });
  }
}
