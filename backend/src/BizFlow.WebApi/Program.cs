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
        void SafeSql(string sql) {
            try { db.Database.ExecuteSqlRaw(sql); }
            catch (Exception ex) { Console.WriteLine("SafeSql Error: " + ex.Message); }
        }

        SafeSql(@"CREATE TABLE IF NOT EXISTS inventory_receipts (
            ""Id"" uuid NOT NULL,
            ""TenantId"" uuid NOT NULL,
            ""ReceiptCode"" text,
            ""Type"" text NOT NULL,
            ""Date"" timestamp with time zone NOT NULL,
            ""TotalAmount"" numeric(15,2) NOT NULL,
            ""Note"" text,
            ""DelivererReceiverName"" text,
            ""ReferenceDocumentNo"" text,
            ""ReferenceDocumentDate"" timestamp with time zone,
            ""ReferenceDocumentIssuer"" text,
            ""WarehouseLocation"" text,
            ""CreatedBy"" uuid,
            CONSTRAINT ""PK_inventory_receipts"" PRIMARY KEY (""Id"")
        );");

        SafeSql(@"CREATE TABLE IF NOT EXISTS inventory_receipt_details (
            ""Id"" uuid NOT NULL,
            ""ReceiptId"" uuid NOT NULL,
            ""ProductId"" uuid NOT NULL,
            ""DocumentQuantity"" numeric(18,4) NOT NULL,
            ""Quantity"" numeric(18,4) NOT NULL,
            ""UnitPrice"" numeric(15,2) NOT NULL,
            ""TotalPrice"" numeric(15,2) NOT NULL,
            CONSTRAINT ""PK_inventory_receipt_details"" PRIMARY KEY (""Id"")
        );");

        SafeSql(@"CREATE TABLE IF NOT EXISTS accounting_ledger_s2 (
            ""Id"" uuid NOT NULL,
            ""TenantId"" uuid NOT NULL,
            ""ProductId"" uuid NOT NULL,
            ""ReceiptId"" uuid,
            ""Date"" timestamp with time zone NOT NULL,
            ""Type"" text NOT NULL,
            ""QuantityIn"" numeric(18,4) NOT NULL,
            ""ValueIn"" numeric(15,2) NOT NULL,
            ""QuantityOut"" numeric(18,4) NOT NULL,
            ""ValueOut"" numeric(15,2) NOT NULL,
            ""QuantityBalance"" numeric(18,4) NOT NULL,
            ""ValueBalance"" numeric(15,2) NOT NULL,
            CONSTRAINT ""PK_accounting_ledger_s2"" PRIMARY KEY (""Id"")
        );");

        SafeSql("ALTER TABLE product_units ALTER COLUMN \"ConversionRate\" TYPE numeric(15,4);");
        
        // Migrate Quantity to numeric to support float quantities
        SafeSql("ALTER TABLE inventory_transactions ALTER COLUMN \"Quantity\" TYPE numeric(15,4);");
        SafeSql("ALTER TABLE order_items ALTER COLUMN \"Quantity\" TYPE numeric(15,4);");
        
        // Add PriceType and UnitPrice
        SafeSql("ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS \"PriceType\" integer NOT NULL DEFAULT 0;");
        SafeSql("ALTER TABLE inventory_transactions ADD COLUMN IF NOT EXISTS \"UnitPrice\" numeric(18,4) NOT NULL DEFAULT 0;");

        // Add TT88 Fields to inventory_receipts and inventory_receipt_details
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"DelivererReceiverName\" text;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"ReferenceDocumentNo\" text;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"ReferenceDocumentDate\" timestamp with time zone;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"ReferenceDocumentIssuer\" text;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"WarehouseLocation\" text;");
        SafeSql("ALTER TABLE inventory_receipt_details ADD COLUMN IF NOT EXISTS \"DocumentQuantity\" numeric(18,4) NOT NULL DEFAULT 0;");

        // Add missing EF Core fields from init.sql mismatch
        SafeSql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"IsActive\" boolean NOT NULL DEFAULT TRUE;");
        SafeSql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"IsDeleted\" boolean NOT NULL DEFAULT FALSE;");
        SafeSql("ALTER TABLE products ADD COLUMN IF NOT EXISTS \"StockQuantity\" numeric(18,4) NOT NULL DEFAULT 0;");
        SafeSql("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS \"CogsMethod\" integer NOT NULL DEFAULT 0;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"Status\" integer NOT NULL DEFAULT 0;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"CancelledAt\" timestamp with time zone;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"CancelledBy\" uuid;");
        SafeSql("ALTER TABLE inventory_receipts ADD COLUMN IF NOT EXISTS \"CancelReason\" text;");

        // Add HR Fields to users
        SafeSql("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"Phone\" text;");
        SafeSql("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"IdentityCard\" text;");
        SafeSql("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"DateOfBirth\" timestamp with time zone;");
        SafeSql("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"JoinDate\" timestamp with time zone;");
        
        // Migrate Cashier to Employee
        SafeSql("UPDATE users SET \"Role\" = 'Employee' WHERE \"Role\" = 'Cashier';");

        // Add Category Multi-level Fields
        SafeSql("ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"ParentId\" integer;");
        SafeSql("ALTER TABLE categories ADD COLUMN IF NOT EXISTS \"Color\" text;");

        // Add Customer Debt Limit Field
        SafeSql("ALTER TABLE customers ADD COLUMN IF NOT EXISTS \"DebtLimit\" numeric(15,2) NOT NULL DEFAULT 10000000;");

        // Ensure audit_logs table exists
        SafeSql(@"CREATE TABLE IF NOT EXISTS audit_logs (
            ""Id"" uuid NOT NULL,
            ""TenantId"" uuid NOT NULL,
            ""UserId"" uuid NOT NULL,
            ""Action"" text NOT NULL,
            ""EntityName"" text,
            ""EntityId"" text,
            ""Timestamp"" timestamp with time zone NOT NULL,
            ""Details"" text,
            CONSTRAINT ""PK_audit_logs"" PRIMARY KEY (""Id"")
            -- We don't strictly enforce FK here to avoid migration conflicts, but EF will use it
        );");

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

        if (!db.Customers.Any())
        {
            db.Customers.AddRange(
                new BizFlow.Domain.Entities.Customer
                {
                    Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                    TenantId = storeTenantId,
                    Fullname = "Chú Ba",
                    Phone = "0912345678",
                    TotalDebt = 5200000.00m,
                    CreatedAt = DateTime.UtcNow
                },
                new BizFlow.Domain.Entities.Customer
                {
                    Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                    TenantId = storeTenantId,
                    Fullname = "Cô Tư",
                    Phone = "0987654321",
                    TotalDebt = 1500000.00m,
                    CreatedAt = DateTime.UtcNow
                },
                new BizFlow.Domain.Entities.Customer
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    TenantId = storeTenantId,
                    Fullname = "Anh Năm",
                    Phone = "0905556667",
                    TotalDebt = 0.00m,
                    CreatedAt = DateTime.UtcNow
                }
            );
            db.SaveChanges();
        }

        // Seed default product images in database description metadata if not present
        foreach (var product in db.Products.ToList())
        {
            var desc = product.Description ?? string.Empty;
            if (!desc.Contains("[ImageUrl:"))
            {
                if (product.Name.Contains("Sắt") || product.Name.Contains("thép"))
                {
                    product.Description = (desc + " [ImageUrl: https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=500]").Trim();
                }
                else if (product.Name.Contains("Gạch"))
                {
                    product.Description = (desc + " [ImageUrl: https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500]").Trim();
                }
                else if (product.Name.Contains("Cát"))
                {
                    product.Description = (desc + " [ImageUrl: https://images.unsplash.com/photo-1604147706283-d7119b5b822c?w=500]").Trim();
                }
                else if (product.Name.Contains("Xi măng"))
                {
                    product.Description = (desc + " [ImageUrl: https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500]").Trim();
                }
                else if (product.Name.Contains("Đá"))
                {
                    product.Description = (desc + " [ImageUrl: https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=500]").Trim();
                }
            }
        }
        db.SaveChanges();

        // Force reset seeded user passwords to default plain text (AuthService will auto-hash on login)
        var seededAdmin = db.Users.FirstOrDefault(u => u.Username.ToLower() == "admin@bizflow.com");
        if (seededAdmin != null)
        {
            seededAdmin.PasswordHash = "admin123";
            seededAdmin.IsActive = true;
        }
        var seededOwner = db.Users.FirstOrDefault(u => u.Username.ToLower() == "owner@bizflow.com");
        if (seededOwner != null)
        {
            seededOwner.PasswordHash = "owner123";
            seededOwner.IsActive = true;
        }
        var seededEmployee = db.Users.FirstOrDefault(u => u.Username.ToLower() == "employee@bizflow.com");
        if (seededEmployee != null)
        {
            seededEmployee.PasswordHash = "employee123";
            seededEmployee.IsActive = true;
        }
        var seededCashier = db.Users.FirstOrDefault(u => u.Username.ToLower() == "cashier@bizflow.com");
        if (seededCashier != null)
        {
            seededCashier.PasswordHash = "cashier123";
            seededCashier.IsActive = true;
        }
        db.SaveChanges();


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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();
