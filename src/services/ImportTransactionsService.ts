import parse from 'csv-parse';
import { getRepository, In } from 'typeorm';
import fs from 'fs';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface CsvRows {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);
    const contactsReadStream = fs.createReadStream(filePath);

    const categories: string[] = [];
    const transactionList: CsvRows[] = [];

    const parser = parse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = contactsReadStream.pipe(parser);

    parseCSV.on('data', csvRow => {
      const [title, type, value, category] = csvRow.map((cell: string) =>
        cell.trim(),
      );

      categories.push(category);
      transactionList.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const categoriesExists = await categoriesRepository.find({
      where: In(categories),
    });

    const categoriesExistsTitle = categoriesExists.map(
      category => category.title,
    );

    const addCategories = categories
      .filter(category => !categoriesExistsTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepository.create(
      addCategories.map(title => ({ title })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...categoriesExists];

    const createTransactions = transactionsRepository.create(
      transactionList.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          cat => cat.title === transaction.category,
        ),
      })),
    );

    await transactionsRepository.save(createTransactions);

    await fs.promises.unlink(filePath);

    return createTransactions;
  }
}

export default ImportTransactionsService;
