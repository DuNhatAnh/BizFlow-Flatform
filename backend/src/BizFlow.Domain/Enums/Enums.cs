namespace BizFlow.Domain.Enums;

public enum InventoryTransactionType
{
    Import,
    Export,
    Adjustment
}

public enum InventoryPriceType
{
    CostPrice,    // Giá vốn
    SellingPrice  // Giá bán
}

public enum PaymentMethod
{
    Cash,
    Transfer,
    Debt
}

public enum OrderStatus
{
    Draft,
    Completed,
    Cancelled
}

public enum OrderSource
{
    Manual,
    AI_Voice,
    AI_Text
}

public enum DocumentType
{
    Sales,
    Purchase,
    Expense
}

public enum DocumentStatus
{
    Completed,
    Cancelled
}

public enum AccountCategory
{
    Revenue_Goods,
    Revenue_Services,
    Expense_Materials,
    Expense_Salary,
    Expense_Taxes
}

public enum CogsMethod
{
    WeightedAverage,
    FIFO
}

public enum ReceiptType
{
    Import,
    Export
}

public enum CashTransactionType
{
    Receipt, // Thu
    Payment  // Chi
}

public enum ExpenseCategory
{
    MaterialCost, // Chi phí vật tư
    LaborCost,    // Chi phí nhân công
    UtilityCost,  // Điện nước, viễn thông
    RentCost,     // Thuê mặt bằng
    ManagementCost, // Chi phí quản lý
    OtherCost     // Chi phí khác
}

public enum TaxType
{
    VAT, // Thuế GTGT
    PIT, // Thuế TNCN
    BusinessLicenseTax, // Thuế môn bài
    Other // Thuế khác
}
