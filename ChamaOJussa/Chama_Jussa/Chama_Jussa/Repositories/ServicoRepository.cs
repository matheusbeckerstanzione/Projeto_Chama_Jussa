using Chama_Jussa.BdContextJussa;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;
using Microsoft.EntityFrameworkCore;

namespace Chama_Jussa.Repositories;

public class ServicoRepository : IServicoRepository
{
    private readonly ChamadaContext _context;

    public ServicoRepository(ChamadaContext context)
    { 
        _context = context;
    }

    public void AtualizarIdCorpo(ServicoTb servicoAtualizado)
    {
        try
        {
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(servicoAtualizado.IdServico)!;

            if (servicoBuscado != null)
            {
                servicoBuscado.Descricao = servicoAtualizado.Descricao;
            }

            _context.SaveChanges();

        }
        catch 
        {
            throw;
        }
    }

    public void AtualizarIdUrl(Guid Id, ServicoTb servicoAtualizado)
    {
        try
        {
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id)!;
            if (servicoBuscado != null)
            {
                servicoBuscado.Titulo = servicoAtualizado.Titulo;
                servicoBuscado.Maquina = servicoAtualizado.Maquina;
                servicoBuscado.Localização = servicoAtualizado.Localização;
                servicoBuscado.Descricao = servicoAtualizado.Descricao;
                servicoBuscado.Situacao = servicoAtualizado.Situacao;
                if (!string.IsNullOrEmpty(servicoAtualizado.Imagem))
                {
                    servicoBuscado.Imagem = servicoAtualizado.Imagem;
                }

                _context.SaveChanges();
            }
        }
        catch
        {
            throw;
        }
    }

    public ServicoTb BuscarPorId(Guid Id)
    {
        try
        {
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id)!;
            return servicoBuscado;
        }
        catch
        {
            throw;
        }
    }

    public void Cadastrar(ServicoTb novoServico)
    {
        try
        {
            novoServico.IdServico = Guid.NewGuid();

            _context.ServicoTbs.Add(novoServico);
            _context.SaveChanges();
        }
        catch
        {
            throw;
        }
    }

    public void Deletar(Guid Id)
    {
        try
        {
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id)!;

            if (servicoBuscado != null)
            {
                // Remove primeiro as notificações vinculadas a esta OS para evitar erro de chave estrangeira
                var notificacoesVinculadas = _context.NotificacaoTbs.Where(n => n.IdServico == Id).ToList();
                if (notificacoesVinculadas.Count > 0)
                {
                    _context.NotificacaoTbs.RemoveRange(notificacoesVinculadas);
                }

                _context.ServicoTbs.Remove(servicoBuscado);
                _context.SaveChanges();
            }
        }
        catch
        {
            throw;
        }
    }

    public List<ServicoTb> Listar()
    {
        try
        {
            List<ServicoTb> listaServicos = _context.ServicoTbs
                .Include(s => s.IdUsuarioNavigation)
                .ToList();
            return listaServicos;
        }
        catch
        {
            throw;
        }
    }
}
