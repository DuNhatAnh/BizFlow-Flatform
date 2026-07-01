using BizFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;

namespace BizFlow.Infrastructure.Persistence.Seeders
{
    public static class ReferenceDataSeeder
    {
        public static async Task SeedAsync(ApplicationDbContext context)
        {
            // Seed static reference data like VAT codes, Enums, Categories here.
            // Do NOT seed pricing, users, tenants, or stores here.
            
            await context.SaveChangesAsync();
        }
    }
}
