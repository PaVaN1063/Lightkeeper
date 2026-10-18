import { Body, Controller, Param, Post } from '@nestjs/common';
import { ClientIdentity, CurrentClient } from '../auth/current-user';
import { WatchesService } from '../watches/watches.service';

@Controller('events')
export class EventsController {
  constructor(private readonly watches: WatchesService) {}

  /** "Useful / Not useful" on an alert. Send { value: null } to clear it. */
  @Post(':id/feedback')
  feedback(@CurrentClient() client: ClientIdentity, @Param('id') id: string, @Body() body: { value?: string | null }) {
    return this.watches.setFeedback(client, id, body?.value ?? null);
  }
}
