using System.Threading.Tasks;
using BizFlow.Application.DTOs.Auth;

namespace BizFlow.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<UserProfileResponse> GetUserProfileAsync(System.Guid userId);
    Task UpdateUserProfileAsync(System.Guid userId, UpdateProfileRequest request, BizFlow.Domain.Enums.UserRole currentUserRole);
    Task ChangePasswordAsync(System.Guid userId, ChangePasswordRequest request);
}
