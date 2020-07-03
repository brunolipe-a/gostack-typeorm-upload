import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne(transactionId);

    if (!transaction) {
      throw new AppError('Transaction not found', 400);
    }

    await transactionRepository.delete(transaction.id);
  }
}

export default DeleteTransactionService;
