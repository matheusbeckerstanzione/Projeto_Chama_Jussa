using Chama_Jussa.Interfaces;
using Chama_Jussa.Repositories;
using Microsoft.AspNetCore.Mvc;
using Chama_Jussa.Models;
using Chama_Jussa.DTO;

namespace Chama_Jussa.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UsuarioController : ControllerBase
{

    private readonly IUsuarioRepository _usuarioRepository;

    public UsuarioController(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }


	[HttpPost]
	public async Task<IActionResult> Post([FromForm] UsuarioDTO novoUsuario)
	{
		if (String.IsNullOrWhiteSpace(novoUsuario.Nome))
			return BadRequest("O nome é obrigatório");

		if (String.IsNullOrWhiteSpace(novoUsuario.Senha))
			return BadRequest("A senha é obrigatória");

		UsuarioTb usuario = new UsuarioTb();

		if (novoUsuario.Imagem != null && novoUsuario.Imagem.Length > 0)
		{
			var extensao = Path.GetExtension(novoUsuario.Imagem.FileName);
			var nomeArquivo = $"{Guid.NewGuid()}{extensao}";
			var pastaRelativa = "wwwroot/imagens";
			var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);

			if (!Directory.Exists(caminhoPasta))
				Directory.CreateDirectory(caminhoPasta);

			var caminhoCompleto = Path.Combine(caminhoPasta, nomeArquivo);

			using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
			{
				await novoUsuario.Imagem.CopyToAsync(stream);
			}

			usuario.Imagem = nomeArquivo;
		}

		usuario.IdUsuario = novoUsuario.IdUsuario.Value;
		usuario.Nome = novoUsuario.Nome!;
		usuario.Email = novoUsuario.Email!;
		usuario.Senha = Criptografia.GerarHash(novoUsuario.Senha!);

		try
		{
			_usuarioRepository.Cadastrar(usuario);
			return StatusCode(201);
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}
	}


	[HttpGet]
	public IActionResult Get()
    {
		try
		{
			return Ok(_usuarioRepository.Listar());
		}
		catch (Exception e)
		{
			return BadRequest(e.Message); 
		}
    }


	[HttpGet("{id}")]
	public IActionResult Get(Guid id)
	{
		try
		{
			var usuario = _usuarioRepository.BuscarPorId(id);
			if (usuario == null)
			{
				return NotFound();
			}
			return Ok(usuario);
		}
		catch (Exception e)
		{
			return BadRequest(e.Message);
		}
	}

	[HttpDelete("{id}")]
	public IActionResult Deletar(Guid id)
	{
		var UsuarioBuscado = _usuarioRepository.BuscarPorId(id);
		if (UsuarioBuscado == null)
			return NotFound("Aluno não encontrado");

		if (!String.IsNullOrEmpty(UsuarioBuscado.Imagem))
		{
			var pastaRelativa = "wwwroot/imagens";
			var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);
			var caminho = Path.Combine(caminhoPasta, UsuarioBuscado.Imagem);

			if (System.IO.File.Exists(caminho))
				System.IO.File.Delete(caminho);
		}

		try
		{
			_usuarioRepository.Deletar(id);
			return NoContent();
		}
		catch (Exception e)
		{
			return BadRequest(e.Message);
		}
	}

	[HttpPut("{id}")]
	public async Task<IActionResult> Put(Guid id, [FromForm] UsuarioDTO UsuarioAtualizado)
	{
		var UsuarioBuscado = _usuarioRepository.BuscarPorId(id);
		if (UsuarioBuscado == null)
			return NotFound("Aluno não encontrado");

		if (!String.IsNullOrWhiteSpace(UsuarioAtualizado.Nome))
			UsuarioBuscado.Nome = UsuarioAtualizado.Nome;

		if (!String.IsNullOrWhiteSpace(UsuarioAtualizado.Email))
			UsuarioBuscado.Email = UsuarioAtualizado.Email;

		if (!String.IsNullOrWhiteSpace(UsuarioAtualizado.Senha))
			UsuarioBuscado.Senha = Criptografia.GerarHash(UsuarioAtualizado.Senha);

		if (UsuarioAtualizado.Imagem != null && UsuarioAtualizado.Imagem.Length > 0)
		{
			var pastaRelativa = "wwwroot/imagens";
			var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);

			if (!String.IsNullOrEmpty(UsuarioBuscado.Imagem))
			{
				var caminhoAntigo = Path.Combine(caminhoPasta, UsuarioBuscado.Imagem);
				if (System.IO.File.Exists(caminhoAntigo))
					System.IO.File.Delete(caminhoAntigo);
			}

			var extensao = Path.GetExtension(UsuarioAtualizado.Imagem.FileName);
			var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

			if (!Directory.Exists(caminhoPasta))
				Directory.CreateDirectory(caminhoPasta);

			var caminhoCompleto = Path.Combine(caminhoPasta, nomeArquivo);
			using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
			{
				await UsuarioAtualizado.Imagem.CopyToAsync(stream);
			}

			UsuarioBuscado.Imagem = nomeArquivo;
		}

		try
		{
			_usuarioRepository.AtualizarIdUrl(id, UsuarioBuscado);
			return NoContent();
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}
	}
}
