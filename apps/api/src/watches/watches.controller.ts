import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ClientIdentity, CurrentClient } from '../auth/current-user';
import { CreateWatchInput, WatchesService } from './watches.service';

@Controller('watches')
export class WatchesController {
  constructor(private readonly watches: WatchesService) {}

  /** What the confirm screen shows: the goal as we understood it. Saves nothing. */
  @Post('parse')
  parse(@Body() body: CreateWatchInput) {
    return this.watches.parse(body ?? {});
  }

  @Get()
  list(@CurrentClient() client: ClientIdentity) {
    return this.watches.list(client);
  }

  @Post()
  create(@CurrentClient() client: ClientIdentity, @Body() body: CreateWatchInput) {
    return this.watches.create(client, body ?? {});
  }

  @Get(':id')
  get(@CurrentClient() client: ClientIdentity, @Param('id') id: string) {
    return this.watches.get(client, id);
  }

  @Patch(':id')
  update(@CurrentClient() client: ClientIdentity, @Param('id') id: string, @Body() body: { status?: string }) {
    return this.watches.update(client, id, body ?? {});
  }

  @Delete(':id')
  remove(@CurrentClient() client: ClientIdentity, @Param('id') id: string) {
    return this.watches.remove(client, id);
  }

  /** Runs a check immediately instead of waiting for the schedule. Handy for testing. */
  @Post(':id/check')
  checkNow(@CurrentClient() client: ClientIdentity, @Param('id') id: string) {
    return this.watches.checkNow(client, id);
  }
}
