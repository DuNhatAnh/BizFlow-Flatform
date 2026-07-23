using System;
using System.Collections.Generic;

namespace BizFlow.Application.Common.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    IEnumerable<string> Permissions { get; }
    bool IsInRole(string role);
}
