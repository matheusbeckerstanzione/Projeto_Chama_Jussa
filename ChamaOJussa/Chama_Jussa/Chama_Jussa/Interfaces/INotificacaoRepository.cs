using Chama_Jussa.Models;

namespace Chama_Jussa.Interfaces;

public interface INotificacaoRepository
{
    NotificacaoTb BuscarPorId(Guid Id);
    List<NotificacaoTb> Listar();
    void Cadastrar(NotificacaoTb novaNotificacao);
    void Deletar(Guid Id);
    void AtualizarIdCorpo(NotificacaoTb notificacaoAtualizada);
    void AtualizarIdUrl(Guid Id, NotificacaoTb notificacaoAtualizada);
}
