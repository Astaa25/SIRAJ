/// Model data domain untuk catatan kesehatan dan rekam medis Poskestren SIRAJ
class HealthRecord {
  final String id;
  final String studentId;
  final String studentName;
  final String status; // 'Pemeriksaan', 'Istirahat Asrama', 'Rawat Inap Poskestren', 'Rujukan RS'
  final int stage; // 1 to 4
  final String diagnosis;
  final double? temperature;
  final String? bloodPressure;
  final int? heartRate;
  final List<String> medicines;
  final String? doctorNotes;
  final DateTime recordedAt;
  final bool isReferred;

  const HealthRecord({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.status,
    required this.stage,
    required this.diagnosis,
    this.temperature,
    this.bloodPressure,
    this.heartRate,
    this.medicines = const [],
    this.doctorNotes,
    required this.recordedAt,
    this.isReferred = false,
  });

  bool get hasFever => temperature != null && temperature! >= 37.5;
  String get stageText => 'Tahap $stage dari 4';
}
