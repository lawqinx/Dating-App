using API.Data;
using API.Helpers;
using API.Interfaces;
using API.Services;
using API.SignalR;
using Microsoft.EntityFrameworkCore;


namespace API.Extensions
{
    public static class ApplicationServiceExtensions
    {
       // Extension method to add application services to the IServiceCollection
        public static IServiceCollection AddAplicationServices(this IServiceCollection services, IConfiguration config)
        {
            // Configure the application's DbContext to use a SQLite database
            services.AddDbContext<DataContext>(opt => 
            {
                opt.UseSqlite(config.GetConnectionString("DefaultConnection")); // Use the connection string named "DefaultConnection" from the configuration
            });
            
            // Add CORS (Cross-Origin Resource Sharing) services to the application
            services.AddCors();

            // Register the TokenService as the implementation for the ITokenService interface
            services.AddScoped<ITokenService, TokenService>();

            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));

            services.AddScoped<IPhotoService, PhotoService>();

            services.AddScoped<IPhotoRepository, PhotoRepository>();

            services.AddScoped<LogUserActivity>();

            services.AddSignalR();

            services.AddSingleton<PresenceTracker>();

            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Return the service collection to allow for method chaining
            return services;
        }
    }
}