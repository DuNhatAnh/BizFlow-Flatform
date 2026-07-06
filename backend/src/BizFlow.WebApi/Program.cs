using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BizFlow.Infrastructure;
using BizFlow.WebApi.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddSignalR();

// Show detailed model validation errors (helps debug 400s)
builder.Services.Configure<Microsoft.AspNetCore.Mvc.ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value?.Errors.Any() == true)
            .ToDictionary(
                kv => kv.Key,
                kv => kv.Value!.Errors.Select(e =>
                    string.IsNullOrEmpty(e.ErrorMessage) ? e.Exception?.Message : e.ErrorMessage
                ).ToArray()
            );
        Console.WriteLine("=== MODEL VALIDATION FAILED ===");
        foreach (var err in errors)
            Console.WriteLine($"  Field '{err.Key}': {string.Join(", ", err.Value!)}");
        return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(new { message = "D\u1eef li\u1ec7u kh\u00f4ng h\u1ee3p l\u1ec7", errors });
    };
});

// Register Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register Clean Architecture Infrastructure services (DbContext)
builder.Services.AddInfrastructureServices(builder.Configuration);

// Register NotificationService and AuthService
builder.Services.AddScoped<BizFlow.Application.Interfaces.INotificationService, BizFlow.WebApi.Services.NotificationService>();
builder.Services.AddScoped<BizFlow.Application.Interfaces.IAuthService, BizFlow.Infrastructure.Services.AuthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

// Configure CORS for Next.js Frontend (local dev environment)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8080", "http://127.0.0.1:8080")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddAuthorization(options =>
{
    // Global fallback policy (fail-closed, secure by default)
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();

    options.AddPolicy(BizFlow.Domain.Constants.Permissions.StaffRead, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.StaffManage, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.PayrollRead, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.PayrollManage, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.ProductsManage, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.ProductsRead, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString(), BizFlow.Domain.Enums.UserRole.Employee.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.OrdersCreate, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString(), BizFlow.Domain.Enums.UserRole.Employee.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.OrdersRead, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString(), BizFlow.Domain.Enums.UserRole.Employee.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.CustomersManage, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.CustomersRead, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Owner.ToString(), BizFlow.Domain.Enums.UserRole.Manager.ToString(), BizFlow.Domain.Enums.UserRole.Employee.ToString()));
    options.AddPolicy(BizFlow.Domain.Constants.Permissions.SystemManage, policy => policy.RequireRole(BizFlow.Domain.Enums.UserRole.Admin.ToString()));
});

var app = builder.Build();

// Initialize Database and Seed Data
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<BizFlow.Infrastructure.Persistence.ApplicationDbContext>();
        
        // Automatically apply pending migrations (EF Core Baseline)
        await db.Database.MigrateAsync();

        // Run Reference Data Seeder unconditionally
        await BizFlow.Infrastructure.Persistence.Seeders.ReferenceDataSeeder.SeedAsync(db);

        // Run Development Data Seeder only if configured
        if (app.Environment.IsDevelopment() && app.Configuration.GetValue<bool>("EnableDevSeed"))
        {
            await BizFlow.Infrastructure.Persistence.Seeders.DevelopmentDataSeeder.SeedAsync(db);
        }

    }
    catch (Exception ex)
    {
        Console.WriteLine("Database seeding failed: " + ex.Message);
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("CorsPolicy");

// Middleware: log raw request body for POST/PUT to help debug 400s
app.Use(async (context, next) =>
{
    if ((context.Request.Method == "POST" || context.Request.Method == "PUT")
        && context.Request.ContentType?.Contains("application/json") == true)
    {
        context.Request.EnableBuffering();
        var body = await new System.IO.StreamReader(context.Request.Body).ReadToEndAsync();
        context.Request.Body.Position = 0;
        Console.WriteLine($"=== RAW REQUEST BODY [{context.Request.Method} {context.Request.Path}] ===");
        Console.WriteLine(body.Length > 2000 ? body[..2000] + "..." : body);
    }
    await next();
});

app.UseAuthentication();
app.UseMiddleware<BizFlow.WebApi.Middleware.TenantResolutionMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
