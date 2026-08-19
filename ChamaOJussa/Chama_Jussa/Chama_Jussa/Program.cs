using Chama_Jussa.BdContextJussa;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Repositories;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.ComponentModel;
using System.Reflection.Metadata;

var builder = WebApplication.CreateBuilder(args);

// adiciona o contexto do banco de dados 
builder.Services.AddDbContext<ChamadaContext>
    (options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//Adiciona o repositorio
//Utilizar os exemplos abaixo como guia ------> //builder.Services.AddScoped<IFilmeRepository, FilmeRepository>();
builder.Services.AddScoped<INotificacaoRepository, NotificacaoRepository>();
builder.Services.AddScoped<IServicoRepository, ServicoRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();



//Adicionar servicos de jwt Bearrer(forma de autenticação)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = "JwtBearrer";
    options.DefaultChallengeScheme = "JwtBearrer";

})
    .AddJwtBearer("JwtBearrer", options =>
    {
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            //valida quem esta solicitando o token
            ValidateIssuer = true,
            //valida quem esta recebendo o token
            ValidateAudience = true,
            //valida o tempo de expiração do token
            ValidateLifetime = true,
            //Forma de Criptografia e valida  a chave de autentificacao
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("Chama_Jussa-chave-autenticacao-webapi-dev")),
            //Valida o tempo de expiracao do tonken
            ClockSkew = TimeSpan.FromMinutes(5),
            //nome do issuer (de onde esta vindo)
            ValidIssuer = "api_Chama_Jussa",
            //nome do audience(para onde esta indo)
            ValidAudience = "api_Chama_Jussa"
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Version = "v1",
        Title = "Chama Jussa API",
        Description = "API para gerenciamento de chamados para o suporte",
        TermsOfService = new Uri("https://example.com/terms"),
        Contact = new Microsoft.OpenApi.OpenApiContact
        {
            Name = "Joao-Victor",
            Url = new Uri("https://example.com/contato")
        },
        License = new Microsoft.OpenApi.OpenApiLicense
        {
            Name = "Example License",
            Url = new Uri("https://example.com/licenca")
        }

    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Insira o token JWT:"

    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] =
        Array.Empty<String>().ToList()
    });

});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});



//Adiciona serviços de controller
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ChamadaContext>();
        context.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erro ao criar/verificar banco de dados: {ex.Message}");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger(options => { });

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "v1");
        options.RoutePrefix = string.Empty;
    });
}

app.UseCors("CorsPolicy");

app.UseStaticFiles();

app.UseAuthentication();

app.UseAuthorization();

// Adiciona o mapeamentos de Controllers

app.MapControllers();

app.Run();