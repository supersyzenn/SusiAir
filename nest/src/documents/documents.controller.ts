import { Controller, Get, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { EmptyQueryDto } from '../common/query.dto';
@Controller('documents')
export class DocumentsController {
  constructor(private readonly service:DocumentsService) {}
  @Get() list(@Query() _query:EmptyQueryDto) { return this.service.list(); }
}
