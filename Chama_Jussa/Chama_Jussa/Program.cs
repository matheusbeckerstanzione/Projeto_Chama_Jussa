using Chama_Jussa.BdContextJussa;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.ComponentModel;
using System.Reflection.Metadata;

var builder = WebApplication.CreateBuilder(args);

// adiciona o contexto do banco de dados 
builder.Services.AddDbContext<ChamadaContext>
    (options => options.UseSqlServer(builder.Configuration.GetConnectionString("DefaltConnection")));

//Adiciona o repositorio
//Utilizar os exemplos abaixo como guia ------> //builder.Services.AddScoped<IFilmeRepository, FilmeRepository>();


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
            IssuerSigningKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("filmes-chave-autenticacao-webapi-dev")),
            //Valida o tempo de expiracao do tonken
            ClockSkew = TimeSpan.FromMinutes(5),
            //nome do issuer (de onde esta vindo)
            ValidIssuer = "api_filmes",
            //nome do audience(para onde esta indo)
            ValidAudience = "api_filmes"
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.OpenApiInfo
    {
        Version = "v1",
        Title = "Filmesm API",
        Description = "API para gerenciamento de filmes e gêneros",
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



//Adiciona serviços de controler 
builder.Services.AddControllers();

var app = builder.Build();

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