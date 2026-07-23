using System.Collections.Generic;

namespace BizFlow.Domain.Constants;

public static class TenantSettingKeys
{
    // Dashboard Configurations
    public const string DashboardAlertLowStock = "dashboard.alert.low_stock";
    public const string DashboardAlertMinRevenueDiff = "dashboard.alert.min_revenue_diff";
    public const string DashboardAlertMaxDebtRatio = "dashboard.alert.max_debt_ratio";
    
    // POS Configurations
    public const string PosAutoPrintReceipt = "pos.auto_print_receipt";
    public const string PosAllowDebt = "pos.allow_debt";
    
    // Inventory Configurations
    public const string InventoryAllowNegativeStock = "inventory.allow_negative_stock";

    // Returns a default value map
    public static readonly IReadOnlyDictionary<string, string> Defaults = new Dictionary<string, string>
    {
        { DashboardAlertLowStock, "5" },
        { DashboardAlertMinRevenueDiff, "20" },
        { DashboardAlertMaxDebtRatio, "30" },
        { PosAutoPrintReceipt, "false" },
        { PosAllowDebt, "true" },
        { InventoryAllowNegativeStock, "false" }
    };
}
