/// Model data domain untuk catatan setoran hafalan dan murajaah tahfidz
class TahfidzRecord {
  final String id;
  final String studentId;
  final String surahName;
  final int startVerse;
  final int endVerse;
  final String activityType; // ziyadah, murajaah
  final int score; // 0 - 100
  final String gradeLabel; // Mumtaz, Jayyid Jiddan, Jayyid
  final String teacherName;
  final String? notes;
  final DateTime timestamp;

  const TahfidzRecord({
    required this.id,
    required this.studentId,
    required this.surahName,
    required this.startVerse,
    required this.endVerse,
    required this.activityType,
    required this.score,
    required this.gradeLabel,
    required this.teacherName,
    this.notes,
    required this.timestamp,
  });

  bool get isMutqin => score >= 85;
}
