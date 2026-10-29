import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { documentState } from '../common/calculations';
@Injectable()
export class DocumentsService {
  constructor(private readonly data:DataService) {}
  list() {
    const { today } = this.data;
    const warningDays = this.data.documents.thresholds.warningDays;
    return { today,warningDays,documents:this.data.documents.documents.map(doc => ({ ...doc,...documentState(doc.expiryDate,today,warningDays) })) };
  }
}
