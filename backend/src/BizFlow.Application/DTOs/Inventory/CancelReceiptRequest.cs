using System.ComponentModel.DataAnnotations;

namespace BizFlow.Application.DTOs.Inventory;

public class CancelReceiptRequest
{
    [Required(ErrorMessage = "Vui lòng nhập lý do hủy phiếu")]
    public string CancelReason { get; set; } = string.Empty;
}
