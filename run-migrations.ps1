$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  BizFlow - Khoi tao co so du lieu" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Buoc 1: Kiem tra dotnet-ef tool
Write-Host "[1/3] Kiem tra cong cu dotnet-ef..." -ForegroundColor Yellow
$toolList = dotnet tool list --global 2>&1
if ($toolList -notmatch "dotnet-ef") {
    Write-Host "  -> Chua co dotnet-ef, dang cai dat..." -ForegroundColor Gray
    dotnet tool install --global dotnet-ef
    Write-Host "  OK: Da cai dat dotnet-ef." -ForegroundColor Green
} else {
    Write-Host "  OK: dotnet-ef da duoc cai dat." -ForegroundColor Green
}

Write-Host ""

# Buoc 2: Tao Migration
Write-Host "[2/3] Tao Migration InitialCreate..." -ForegroundColor Yellow
Set-Location -Path "$PSScriptRoot\backend"

$migrationFolder = "src\BizFlow.Infrastructure\Persistence\Migrations"
if (Test-Path $migrationFolder) {
    Write-Host "  -> Xoa migration cu..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $migrationFolder
}

dotnet ef migrations add InitialCreate --project src\BizFlow.Infrastructure --startup-project src\BizFlow.WebApi --output-dir Persistence\Migrations

Write-Host "  OK: Tao Migration thanh cong." -ForegroundColor Green
Write-Host ""

# Buoc 3: Apply Migration len PostgreSQL
Write-Host "[3/3] Ap dung Migration len PostgreSQL..." -ForegroundColor Yellow
Write-Host "  -> Dang ket noi toi: localhost:5432/bizflow_db ..." -ForegroundColor Gray

dotnet ef database update --project src\BizFlow.Infrastructure --startup-project src\BizFlow.WebApi

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  HOAN THANH! Cac bang da duoc tao:" -ForegroundColor Green
Write-Host "    subscription_plans, tenants, users" -ForegroundColor Green
Write-Host "    categories, products, product_units" -ForegroundColor Green
Write-Host "    orders, order_items, customers" -ForegroundColor Green
Write-Host "    debt_transactions, accounting_entries" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Refresh Database Client trong VS Code de thay cac bang!" -ForegroundColor Cyan
Write-Host ""
