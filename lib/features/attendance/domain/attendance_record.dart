/// Model data domain untuk catatan absensi santri per sesi
class AttendanceRecord {
  final String id;
  final String studentId;
  final String studentName;
  final String sessionId;
  final String sessionTitle;
  final DateTime date;
  final DateTime? actualRecordedTime;
  final String status; // hadir, terlambat, sakit, izin, alpa, masbuk
  final int latenessMinutes;
  final String? teacherName;
  final String? notes;

  const AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.sessionId,
    required this.sessionTitle,
    required this.date,
    this.actualRecordedTime,
    required this.status,
    this.latenessMinutes = 0,
    this.teacherName,
    this.notes,
  });

  bool get isLate => latenessMinutes > 0;
  bool get isPresent => status == 'hadir';
}
