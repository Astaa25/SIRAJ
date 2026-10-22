import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/siraj_colors.dart';
import '../../../core/widgets/siraj_button.dart';
import '../../../core/widgets/siraj_card.dart';
import '../../../core/widgets/siraj_status_chip.dart';
import '../domain/wallet_record.dart';

/// Screen Dompet Digital Santri SIRAJ (Uang Saku & Syahriah)
class WalletScreen extends StatefulWidget {
  final WalletRecord? initialRecord;

  const WalletScreen({super.key, this.initialRecord});

  @override
  State<WalletScreen> createState() => _WalletScreenState();
}

class _WalletScreenState extends State<WalletScreen> {
  late WalletRecord _wallet;

  @override
  void initState() {
    super.initState();
    _wallet = widget.initialRecord ??
        WalletRecord(
          id: 'WAL-2026-001',
          studentId: 'SAN-2026070114',
          studentName: 'Ahmad Fauzan Rabbani',
          balance: 185000,
          syahriahStatus: 'Lunas - Oktober 2026',
          recentTransactions: [
            WalletTransaction(
              id: 'TX-001',
              title: 'Makan Siang & Susu Kedelai',
              category: 'Kantin',
              amount: -15000,
              timestamp: DateTime(2026, 10, 22, 12, 15),
              merchantOrSource: 'Kantin Darussalam',
            ),
            WalletTransaction(
              id: 'TX-002',
              title: 'Kitab Matan Al-Ghayah wa At-Taqrib',
              category: 'Koperasi',
              amount: -25000,
              timestamp: DateTime(2026, 10, 21, 16, 30),
              merchantOrSource: 'Koperasi Santri',
            ),
            WalletTransaction(
              id: 'TX-003',
              title: 'Top Up Saldo via BSI VA',
              category: 'TopUp',
              amount: 150000,
              timestamp: DateTime(2026, 10, 20, 09, 10),
              merchantOrSource: 'BSI Virtual Account',
            ),
            WalletTransaction(
              id: 'TX-004',
              title: 'Laundry Seragam Putih & Sarung',
              category: 'Laundry',
              amount: -12000,
              timestamp: DateTime(2026, 10, 19, 14, 05),
              merchantOrSource: 'Laundry Pondok',
            ),
          ],
        );
  }

  void _showTopUpSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      backgroundColor: Colors.white,
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Isi Saldo Uang Saku',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: SirajColors.deepForest,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: SirajColors.mint,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: SirajColors.borderEmerald),
                ),
                child: const Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'BSI Virtual Account Pesantren',
                      style: TextStyle(fontSize: 12, color: SirajColors.textSecondary),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '988 2026 0701 1400',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: SirajColors.deepForest,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Atas Nama: Ahmad Fauzan Rabbani (Santri Darussalam)',
                      style: TextStyle(fontSize: 11, color: SirajColors.textSecondary),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Batas Harian: Maks. Rp 25.000 / hari untuk menjaga kezuhudan santri.',
                style: TextStyle(fontSize: 12, color: SirajColors.textSecondary, fontStyle: FontStyle.italic),
              ),
              const SizedBox(height: 20),
              SirajButton(
                label: 'Salin Nomor VA & Buka M-Banking',
                icon: const Icon(Icons.copy, color: Colors.white, size: 18),
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Nomor VA BSI berhasil disalin ke clipboard!'),
                      backgroundColor: SirajColors.emerald600,
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: SirajColors.mint,
      appBar: AppBar(
        title: const Text('Dompet Santri & Syahriah'),
        backgroundColor: SirajColors.deepForest,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Saldo Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [SirajColors.deepForest, SirajColors.forest],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: const [
                BoxShadow(
                  color: Color.fromRGBO(6, 39, 30, 0.25),
                  blurRadius: 16,
                  offset: Offset(0, 8),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _wallet.studentName,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SirajStatusChip(
                      status: SirajAttendanceStatus.hadir,
                      customLabel: 'Syahriah: ${_wallet.syahriahStatus}',
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                const Text(
                  'Saldo Uang Saku',
                  style: TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  currencyFormatter.format(_wallet.balance),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _showTopUpSheet,
                        icon: const Icon(Icons.add_circle_outline, size: 18),
                        label: const Text('Top Up Saldo'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: SirajColors.gold,
                          foregroundColor: SirajColors.deepForest,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Daily Spending Notice
          SirajCard(
            backgroundColor: SirajColors.white,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: SirajColors.mint,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.info_outline, color: SirajColors.emerald600, size: 22),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Limit Belanja Santri',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: SirajColors.textPrimary),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Maks. Rp 25.000/hari di Kantin & Koperasi sesuai Tata Tertib Pondok.',
                        style: TextStyle(fontSize: 11, color: SirajColors.textSecondary),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Mutasi Transaksi
          const Text(
            'Riwayat Transaksi Terakhir',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: SirajColors.textPrimary,
            ),
          ),
          const SizedBox(height: 12),

          ..._wallet.recentTransactions.map((tx) {
            final isCredit = tx.isCredit;
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: SirajCard(
                child: Row(
                  children: [
                    Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: isCredit
                            ? SirajColors.successBg
                            : SirajColors.warningBg,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        isCredit ? Icons.arrow_downward : Icons.shopping_bag_outlined,
                        color: isCredit ? SirajColors.hadirText : SirajColors.terlambatText,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tx.title,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: SirajColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${tx.merchantOrSource} · ${DateFormat('dd MMM, HH:mm').format(tx.timestamp)}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: SirajColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '${isCredit ? '+' : ''}${currencyFormatter.format(tx.amount)}',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: isCredit ? SirajColors.hadirText : SirajColors.terlambatText,
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}
