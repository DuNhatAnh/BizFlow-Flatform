@echo off
echo ========================================================
echo BIZFLOW BACKEND STARTUP SCRIPT
echo ========================================================
echo.
echo Thiet lap tu dong khoi dong lai khi co thay doi lon (Rude Edit)...
set DOTNET_WATCH_RESTART_ON_RUDE_EDIT=true

echo Dang khoi dong Backend voi tinh nang Hot Reload...
echo.
dotnet watch run --project src/BizFlow.WebApi

pause
