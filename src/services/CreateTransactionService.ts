import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<{
    category: Category;
    id: string;
    title: string;
    type: 'income' | 'outcome';
    value: number;
    category_id: string;
    created_at: Date;
    updated_at: Date;
  }> {
    if (!(type === 'income' || type === 'outcome')) {
      throw new AppError('Incorrect operation type');
    }
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    let categoryByDb = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryByDb) {
      categoryByDb = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryByDb);
    }

    const transactionList = await transactionRepository.find();
    const { total } = await transactionRepository.getBalance(transactionList);

    if (type === 'outcome' && total < value) {
      throw new AppError('Insufficient funds');
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryByDb.id,
    });

    await transactionRepository.save(transaction);

    delete transaction.category_id;

    return {
      ...transaction,
      category: categoryByDb,
    };
  }
}

export default CreateTransactionService;
