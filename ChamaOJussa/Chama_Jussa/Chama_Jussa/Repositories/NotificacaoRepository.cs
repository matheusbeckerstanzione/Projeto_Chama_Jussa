using Chama_Jussa.BdContextJussa;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;

namespace Chama_Jussa.Repositories;

public class NotificacaoRepository : INotificacaoRepository
{
    private readonly ChamadaContext _context;

    public NotificacaoRepository(ChamadaContext context)
    {
        _context = context;
    }

    public void AtualizarIdCorpo(NotificacaoTb notificacaoAtualizada)
    {
        try
        {
            NotificacaoTb notificacaoBuscada = _context.NotificacaoTbs.Find(notificacaoAtualizada.IdNotificacao)!;

            if (notificacaoBuscada != null)
            {
                notificacaoBuscada.Mensagem = notificacaoAtualizada.Mensagem;
            }

            _context.NotificacaoTbs.Update(notificacaoBuscada);
            _context.SaveChanges();

        }
        catch
        {
            throw;
        }
    }

    public void AtualizarIdUrl(Guid Id, NotificacaoTb notificacaoAtualizada)
    {
        try
        {
            NotificacaoTb notificacaoBuscada = _context.NotificacaoTbs.Find(Id)!;
            if (notificacaoBuscada != null)
            {
                notificacaoBuscada.Mensagem = notificacaoBuscada.Mensagem;

                _context.NotificacaoTbs.Update(notificacaoBuscada);
                _context.SaveChanges();
            }
        }
        catch
        {
            throw;
        }
    }

    public NotificacaoTb BuscarPorId(Guid Id)
    {
        try
        {
            NotificacaoTb notificacaoBuscada = _context.NotificacaoTbs.Find(Id)!;
            return notificacaoBuscada;
        }
        catch
        {
            throw;
        }
    }

    public void Cadastrar(NotificacaoTb novaNotificacao)
    {
        try
        {
            novaNotificacao.IdNotificacao = Guid.NewGuid();

            _context.NotificacaoTbs.Add(novaNotificacao);
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
            NotificacaoTb notificacaoBuscada = _context.NotificacaoTbs.Find(Id)!;

            if (notificacaoBuscada != null)
            {
                _context.NotificacaoTbs.Remove(notificacaoBuscada);
            }
            _context.SaveChanges();
        }
        catch
        {
            throw;
        }
    }

    public List<NotificacaoTb> Listar()
    {
        try
        {
            List<NotificacaoTb> listaNotificacoes = _context.NotificacaoTbs.ToList();
            return listaNotificacoes;
        }
        catch
        {
            throw;
        }
    }
}