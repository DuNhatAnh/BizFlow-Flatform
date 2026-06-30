# DATABASE SCHEMA MODIFICATION RULE

## Context
In the past, there have been multiple incidents where C# Entity models (e.g., adding a new property) were updated, but the corresponding database schema changes (e.g., adding a column in Supabase / PostgreSQL) were completely forgotten. This mismatch caused the backend to crash silently or fail to start when `dotnet watch run` executed. 

## Strict Rule: Schema Syncing
Whenever you modify a C# Entity class by adding, renaming, or removing properties, **you MUST immediately ensure the database schema is updated**.

You must do ONE of the following before considering the task complete:

1. **(Preferred for this project) Add a SafeSql script**:
   Open `backend/src/BizFlow.WebApi/Program.cs` and add a `SafeSql` statement to create the new column/table during backend startup.
   *Example*: `SafeSql("ALTER TABLE users ADD COLUMN IF NOT EXISTS \"NewField\" text;");`

2. **Generate an EF Core Migration**:
   If the project explicitly requires migrations, you must run `dotnet ef migrations add <MigrationName>` and ensure the migration file is created successfully.

**DO NOT** leave a C# Entity modified without its corresponding database schema update. 
**DO NOT** assume the user will manually update Supabase.
**DO NOT** assume Entity Framework will magically add the column without a migration or raw SQL script.

If you fail to follow this rule, the backend will crash on the next restart, causing a poor user experience.
