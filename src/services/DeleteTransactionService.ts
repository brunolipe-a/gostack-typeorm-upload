// import AppError from '../errors/AppError';

import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute({ id }: { id: string }): Promise<void> {
    try {
      const transactionsRepository = getCustomRepository(
        TransactionsRepository,
      );
      // const transaction = await transactionsRepository.findByIds([id]);
      await transactionsRepository.delete(id);
    } catch (e) {
      throw new AppError('Não foi possivel apagar');
    }
  }
}

export default new DeleteTransactionService();
