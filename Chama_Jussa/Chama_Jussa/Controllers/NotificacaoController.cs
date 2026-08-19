using Chama_Jussa.DTO;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;
using Microsoft.AspNetCore.Mvc;

namespace Chama_Jussa.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificacaoController : ControllerBase
{
	private readonly INotificacaoRepository _notificacaoRepository;

	public NotificacaoController(INotificacaoRepository notificacaoRepository)
	{
		_notificacaoRepository = notificacaoRepository;
	}

	[HttpPost]
	public IActionResult Post([FromBody] NotificacaoDTO novaNotificacao)
	{
		if (novaNotificacao.IdUsuario == null || novaNotificacao.IdUsuario == Guid.Empty)
			return BadRequest("O usuário é obrigatório");

		if (novaNotificacao.IdServico == null || novaNotificacao.IdServico == Guid.Empty)
			return BadRequest("O serviço é obrigatório");

		if (String.IsNullOrWhiteSpace(novaNotificacao.Mensagem))
			return BadRequest("A mensagem é obrigatória");

		NotificacaoTb notificacao = new NotificacaoTb
		{
			IdUsuario = novaNotificacao.IdUsuario.Value,
			IdServico = novaNotificacao.IdServico.Value,
			Mensagem = novaNotificacao.Mensagem!,
			DataHora = DateTime.Now
		};

		try
		{
			_notificacaoRepository.Cadastrar(notificacao);
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
			return Ok(_notificacaoRepository.Listar());
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
			var notificacao = _notificacaoRepository.BuscarPorId(id);
			if (notificacao == null)
			{
				return NotFound();
			}
			return Ok(notificacao);
		}
		catch (Exception e)
		{
			return BadRequest(e.Message);
		}
	}

	[HttpDelete("{id}")]
	public IActionResult Deletar(Guid id)
	{
		var notificacaoBuscada = _notificacaoRepository.BuscarPorId(id);
		if (notificacaoBuscada == null)
			return NotFound("Notificação não encontrada");

		try
		{
			_notificacaoRepository.Deletar(id);
			return NoContent();
		}
		catch (Exception e)
		{
			return BadRequest(e.Message);
		}
	}

	[HttpPut("{id}")]
	public IActionResult Put(Guid id, [FromBody] NotificacaoDTO notificacaoAtualizada)
	{
		var notificacaoBuscada = _notificacaoRepository.BuscarPorId(id);
		if (notificacaoBuscada == null)
			return NotFound("Notificação não encontrada");

		if (!String.IsNullOrWhiteSpace(notificacaoAtualizada.Mensagem))
			notificacaoBuscada.Mensagem = notificacaoAtualizada.Mensagem;

		try
		{
			_notificacaoRepository.AtualizarIdCorpo(notificacaoBuscada);
			return NoContent();
		}
		catch (Exception ex)
		{
			return BadRequest(ex.Message);
		}
	}
}
