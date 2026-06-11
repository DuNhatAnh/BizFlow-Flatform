namespace BizFlow.Domain.Enums;

public enum InventoryTransactionType
{
    Import,
    Export,
    Adjustment
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

public enum AccountCategory
{
    Revenue_Goods,
    Revenue_Services,
    Expense_Materials,
    Expense_Salary,
    Expense_Taxes
}
