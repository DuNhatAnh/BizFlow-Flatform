namespace BizFlow.Application.DTOs.Staff;

public class CreateStaffRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Fullname { get; set; } = string.Empty;
    public string Role { get; set; } = "Cashier";
}
