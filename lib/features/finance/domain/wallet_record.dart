/// Model data domain untuk catatan dompet digital & uang saku santri SIRAJ
class WalletRecord {
  final String id;
  final String studentId;
  final String studentName;
  final int balance;
  final String syahriahStatus; // 'Lunas', 'Tertunda', 'Tenggang'
  final List<WalletTransaction> recentTransactions;

  const WalletRecord({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.balance,
    required this.syahriahStatus,
    this.recentTransactions = const [],
  });

  bool get isSyahriahPaid => syahriahStatus.toLowerCase().startsWith('lunas');
}

class WalletTransaction {
  final String id;
  final String title;
  final String category; // 'Kantin', 'Koperasi', 'TopUp', 'Laundry'
  final int amount; // negative for expense, positive for top-up
  final DateTime timestamp;
  final String merchantOrSource;

  const WalletTransaction({
    required this.id,
    required this.title,
    required this.category,
    required this.amount,
    required this.timestamp,
    required this.merchantOrSource,
  });

  bool get isCredit => amount > 0;
}
