/* backend/src/transactions/dto/create-transaction.dto.ts */
import { TransactionType } from '../entities/transaction.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

export class CreateTransactionDto {
  wallet: Wallet;
  type: TransactionType;
  amount: number;
}
