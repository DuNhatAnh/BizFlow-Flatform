using BizFlow.Infrastructure;
using BizFlow.WebApi.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
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

// Configure CORS for Next.js Frontend (local dev environment)
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Initialize Database and Seed Data
using (var scope = app.Services.CreateScope())
{
    try 
    {
        var db = scope.ServiceProvider.GetRequiredService<BizFlow.Infrastructure.Persistence.ApplicationDbContext>();
        
        // Supabase has default tables (auth, storage), so EnsureCreated() fails to run.
        // We manually check if our table exists, and if not, execute the raw create script.
        var conn = db.Database.GetDbConnection();
        conn.Open();
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = "SELECT count(*) FROM pg_class WHERE relname = 'products'";
            var count = (long)cmd.ExecuteScalar();
            if (count == 0)
            {
                var script = db.Database.GenerateCreateScript();
                db.Database.ExecuteSqlRaw(script);
            }
        }
        conn.Close();
        db.Database.ExecuteSqlRaw("ALTER TABLE product_units ALTER COLUMN \"ConversionRate\" TYPE numeric(15,4);");
        
        // Migrate Quantity to numeric to support float quantities
        db.Database.ExecuteSqlRaw("ALTER TABLE inventory_transactions ALTER COLUMN \"Quantity\" TYPE numeric(15,4);");
        db.Database.ExecuteSqlRaw("ALTER TABLE order_items ALTER COLUMN \"Quantity\" TYPE numeric(15,4);");

        var storeTenantId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        if (!db.Categories.Any())
        {
            db.Categories.AddRange(
                new BizFlow.Domain.Entities.Category { Id = 1, TenantId = storeTenantId, Name = "Vật liệu xây dựng" },
                new BizFlow.Domain.Entities.Category { Id = 2, TenantId = storeTenantId, Name = "Thiết bị điện" },
                new BizFlow.Domain.Entities.Category { Id = 3, TenantId = storeTenantId, Name = "Nước giải khát" },
                new BizFlow.Domain.Entities.Category { Id = 4, TenantId = storeTenantId, Name = "Hàng tạp hóa" }
            );
            db.SaveChanges();
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

// Enable CORS
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

app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
