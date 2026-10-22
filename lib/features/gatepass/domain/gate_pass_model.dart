/// Model data domain untuk izin penjemputan Gate Pass santri
class GatePassModel {
  final String id;
  final String studentId;
  final String studentName;
  final String guardianId;
  final String authorizedPickerName;
  final String pickerNik;
  final String reason;
  final DateTime validFrom;
  final DateTime validUntil;
  final String ed25519Signature;
  final String status; // aktif, selesai, dibatalkan
  final DateTime? usedAt;
  final String? verifiedByGuardId;

  const GatePassModel({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.guardianId,
    required this.authorizedPickerName,
    required this.pickerNik,
    required this.reason,
    required this.validFrom,
    required this.validUntil,
    required this.ed25519Signature,
    this.status = 'aktif',
    this.usedAt,
    this.verifiedByGuardId,
  });

  bool get isUsed => usedAt != null;
  bool get isExpired => DateTime.now().isAfter(validUntil);
}
