import { Controller, Get } from '@nestjs/common';
import { SourcesService } from './sources.service';

@Controller('sources')
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  @Get()
  async list() {
    const rows = await this.sources.list();
    return rows.map((s) => ({ id: s.id, badge: s.badge, name: s.name, goal: s.goal, url: s.url, site: new URL(s.url).hostname.replace(/^www\./, ''), category: s.category }));
  }
}
