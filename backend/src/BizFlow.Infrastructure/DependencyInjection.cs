using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using BizFlow.Application.Common.Interfaces;
using BizFlow.Application.Interfaces;
using BizFlow.Infrastructure.Persistence;

namespace BizFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(connectionString,
                builder => builder.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<IOrderService, BizFlow.Infrastructure.Services.OrderService>();
        services.AddScoped<BizFlow.Application.Interfaces.IProductService, BizFlow.Infrastructure.Services.ProductService>();
        services.AddScoped<BizFlow.Application.Interfaces.ICategoryService, BizFlow.Infrastructure.Services.CategoryService>();
        services.AddScoped<IInventoryService, BizFlow.Infrastructure.Services.InventoryService>();
        services.AddScoped<IStaffService, BizFlow.Infrastructure.Services.StaffService>();
        services.AddScoped<IReportsService, BizFlow.Infrastructure.Services.ReportsService>();
        services.AddScoped<ICashService, BizFlow.Infrastructure.Services.CashService>();
        services.AddScoped<IPayrollService, BizFlow.Infrastructure.Services.PayrollService>();
        services.AddScoped<IStoreService, BizFlow.Infrastructure.Services.StoreService>();
        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentTenantService, BizFlow.Infrastructure.Services.CurrentTenantService>();
        services.AddScoped<ICurrentUserService, BizFlow.Infrastructure.Services.CurrentUserService>();
        services.AddScoped<IAttendanceService, BizFlow.Infrastructure.Services.AttendanceService>();
        services.AddScoped<IShiftService, BizFlow.Infrastructure.Services.ShiftService>();
        services.AddScoped<ITenantSettingService, BizFlow.Infrastructure.Services.TenantSettingService>();
        services.AddScoped<IDashboardService, BizFlow.Infrastructure.Services.DashboardService>();
        services.AddScoped<ITaxService, BizFlow.Application.Services.TaxService>();
        services.AddScoped<INumberSequenceService, BizFlow.Infrastructure.Services.NumberSequenceService>();
        services.AddScoped<IEmailService, BizFlow.Infrastructure.Services.SmtpEmailService>();


        // Register Redis Cache
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = configuration.GetConnectionString("RedisConnection") ?? "localhost:6379";
        });

        return services;
    }
}

