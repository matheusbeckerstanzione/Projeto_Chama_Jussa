using Chama_Jussa.Models;

namespace Chama_Jussa.Interfaces;

public interface IServicoRepository
{
    ServicoTb BuscarPorId(Guid Id);
    List<ServicoTb> Listar();
    void Cadastrar(ServicoTb novoServico);
    void Deletar(Guid Id);
    void AtualizarIdCorpo(ServicoTb servicoAtualizado);
    void AtualizarIdUrl(Guid Id, ServicoTb servicoAtualizado);
}
