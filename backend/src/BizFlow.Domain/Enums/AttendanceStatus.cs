namespace BizFlow.Domain.Enums;

public enum AttendanceStatus
{
    Present,     // Đi làm đúng giờ
    Late,        // Đi muộn
    LeaveEarly,  // Về sớm
    Absent,      // Vắng mặt (nghỉ)
    Invalid      // Lỗi hoặc gian lận
}
