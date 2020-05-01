import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';
import AppError from '../errors/AppError';

// import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category_title: string;
}

class CreateTransactionService {
  public async execute({
    category_title,
    title,
    type,
    value,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);
    const balance = await transactionRepository.getBalance();

    let category = await categoryRepository.findOne({
      where: { title: category_title },
    });
    if (!category) {
      category = await categoryRepository.create({
        title: category_title,
      });

      await categoryRepository.save(category);
    }

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Não pode tirar dinheiro que não existe');
    }

    try {
      const transaction = await transactionRepository.create({
        title,
        type,
        value,
        category_id: category.id,
      });

      await transactionRepository.save(transaction);

      return transaction;
    } catch (e) {
      throw new AppError('Erro');
    }
  }
}

export default new CreateTransactionService();
