using Chama_Jussa.BdContextJussa;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;

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

            _context.ServicoTbs.Update(servicoBuscado);
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
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id.ToString())!;
            if (servicoBuscado != null)
            {
                servicoBuscado.Descricao = servicoBuscado.Descricao;

                _context.ServicoTbs.Update(servicoBuscado);
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
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id.ToString())!;
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
            ServicoTb servicoBuscado = _context.ServicoTbs.Find(Id.ToString())!;

            if (servicoBuscado != null)
            {
                _context.ServicoTbs.Remove(servicoBuscado);
            }
            _context.SaveChanges();
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
            List<ServicoTb> listaServicos = _context.ServicoTbs.ToList();
            return listaServicos;
        }
        catch
        {
            throw;
        }
    }
}
