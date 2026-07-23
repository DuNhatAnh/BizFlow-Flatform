using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace BizFlow.Application.DTOs.TenantSettings;

public class UpdateTenantSettingsDto
{
    [Required]
    public Dictionary<string, string> Settings { get; set; } = new Dictionary<string, string>();
}
