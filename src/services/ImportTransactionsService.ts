import path from 'path';
import Transaction from '../models/Transaction';
import { loadCSV } from '../utils';

class ImportTransactionsService {
  async execute(): Promise<Transaction[]> {
    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      'import_template.csv',
    );

    const data = await loadCSV(csvFilePath);

    console.log(data);
  }
}

export default new ImportTransactionsService();
