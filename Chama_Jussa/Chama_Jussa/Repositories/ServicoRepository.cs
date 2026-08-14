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
        throw new NotImplementedException();
    }

    public void AtualizarIdUrl(Guid Id, ServicoTb servicoAtualizado)
    {
        throw new NotImplementedException();
    }

    public ServicoTb BuscarPorId(Guid Id)
    {
        throw new NotImplementedException();
    }

    public void Cadastrar(ServicoTb novoServico)
    {
        throw new NotImplementedException();
    }

    public void Deletar(Guid Id)
    {
        throw new NotImplementedException();
    }

    public List<ServicoTb> Listar()
    {
        throw new NotImplementedException();
    }
}
