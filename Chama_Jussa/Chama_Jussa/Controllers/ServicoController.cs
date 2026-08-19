using Chama_Jussa.DTO;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;
using Microsoft.AspNetCore.Mvc;
using static System.Net.WebRequestMethods;

namespace Chama_Jussa.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ServicoController : Controller
{
    private readonly IServicoRepository _servicoRepository;

    public ServicoController(IServicoRepository servicoRepository)
    {
        _servicoRepository = servicoRepository;
    }


    [HttpPost]

    // Posta o flme
    public async Task<IActionResult> Post([FromForm] ServicoDTO novoServico)
    {
        if (String.IsNullOrWhiteSpace(novoServico.Titulo))
            return BadRequest("O título do serviço é obrigatório.");

        if (novoServico.IdUsuario == null || novoServico.IdUsuario == Guid.Empty)
            return BadRequest("O usuário é obrigatório.");

        ServicoTb servico = new ServicoTb();
        if (novoServico.Imagem != null && novoServico.Imagem.Length > 0)
        {
            var extensao = Path.GetExtension(novoServico.Imagem.FileName);
            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

            var pastaRelativa = "wwwroot/imagens";
            var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);

            //garante que a pasta existe
            if (!Directory.Exists(caminhoPasta))
                Directory.CreateDirectory(caminhoPasta);

            var caminhoCompleto = Path.Combine(caminhoPasta, nomeArquivo);

            using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
            {
                await novoServico.Imagem.CopyToAsync(stream);
            }

            servico.Imagem = nomeArquivo;

        }

        servico.IdUsuario = novoServico.IdUsuario.Value;
        servico.Titulo = novoServico.Titulo!;
        servico.Maquina = novoServico.Maquina!;
        servico.Localização = novoServico.Localizacao!;
        servico.Descricao = novoServico.Descricao!;
        servico.Situacao = novoServico.Situacao!;

        try
        {
            _servicoRepository.Cadastrar(servico);
            return StatusCode(201);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("{Id}")]
    public IActionResult GetById(Guid Id)
    {
        try
        {
            return Ok(_servicoRepository.BuscarPorId(Id));
        }
        catch (Exception error)
        {
            return BadRequest(error);
        }
    }

    [HttpGet]
    public IActionResult Get()
    {
        try
        {
            return Ok(_servicoRepository.Listar());
        }
        catch (Exception error)
        {
            return BadRequest(error);
        }
    }

    [HttpPut("{Id}")]

    // Atualiza o filme pelo id
    public async Task<IActionResult> Put(Guid Id, [FromForm] ServicoDTO servico)
    {
        var servicoBuscado = _servicoRepository.BuscarPorId(Id);
        if (servicoBuscado == null)
            return NotFound("Serviço não encontrado.");

        if (!String.IsNullOrWhiteSpace(servico.Titulo))
            servicoBuscado.Titulo = servico.Titulo;

        if (servico.IdServico != null && servico.IdServico.Value != servicoBuscado.IdServico)
            servicoBuscado.IdServico = servico.IdServico.Value;

        if (servico.Imagem != null && servico.Imagem.Length != 0)
        {
            var pastaRelativa = "wwwroot/imagens";
            var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);

            //deleta o arquivo antigo
            if (!String.IsNullOrEmpty(servicoBuscado.Imagem))
            {
                var caminhoAntigo = Path.Combine(caminhoPasta, servicoBuscado.Imagem);

                if (System.IO.File.Exists(caminhoAntigo))
                    System.IO.File.Delete(caminhoAntigo);
            }

            //salva o novo arquivo
            var extensao = Path.GetExtension(servico.Imagem.FileName);
            var nomeArquivo = $"{Guid.NewGuid()}{extensao}";

            if (!Directory.Exists(caminhoPasta))
                Directory.CreateDirectory(caminhoPasta);

            var caminhoCompleto = Path.Combine(caminhoPasta, nomeArquivo);
            using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
            {
                await servico.Imagem.CopyToAsync(stream);
            }

            servicoBuscado.Imagem = nomeArquivo;

        }

        try
        {
            _servicoRepository.AtualizarIdUrl(Id, servicoBuscado);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut]
    public IActionResult Put(ServicoTb servicoAtualizado)
    {
        try
        {
            _servicoRepository.AtualizarIdCorpo(servicoAtualizado);
            return NoContent();
        }
        catch (Exception error)
        {
            return BadRequest(error);
        }
    }

    [HttpDelete("{Id}")]
    public IActionResult Delete(Guid Id)
    {
        var servicoBuscado = _servicoRepository.BuscarPorId(Id);
        if (servicoBuscado == null)
            return NotFound("Serviço não encontrado.");

        var pastaRelativa = "wwwroot/imagens";
        var caminhoPasta = Path.Combine(Directory.GetCurrentDirectory(), pastaRelativa);

        //deleta o arquivo
        if (!String.IsNullOrEmpty(servicoBuscado.Imagem))
        {
            var caminho = Path.Combine(caminhoPasta, servicoBuscado.Imagem);
            if (System.IO.File.Exists(caminho))
                System.IO.File.Delete(caminho);
        }

        try
        {
            _servicoRepository.Deletar(Id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

}
