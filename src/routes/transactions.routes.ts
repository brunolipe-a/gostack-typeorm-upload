import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactionsList = await transactionsRepository.find({
    relations: ['category'],
    select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
  });
  const balance = await transactionsRepository.getBalance(transactionsList);

  return response.json({ transactions: transactionsList, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTrasition = new CreateTransactionService();

  const transaction = await createTrasition.execute({
    title,
    value,
    type,
    category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute(id);

  return response.send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importCSV = new ImportTransactionsService();

    const transactions = await importCSV.execute(request.file.path);

    return response.json(transactions);
  },
);

export default transactionsRouter;
