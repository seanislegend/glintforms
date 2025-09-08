import {createExportHandler} from '@/lib/schemas/export-utils';
import {responsesExportConfig} from './responses-export-helpers';

export const POST = createExportHandler(responsesExportConfig);
