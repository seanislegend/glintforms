import {createExportHandler} from '@/lib/schemas/export-utils';
import {questionsExportConfig} from './questions-export-helpers';

export const POST = createExportHandler(questionsExportConfig);
