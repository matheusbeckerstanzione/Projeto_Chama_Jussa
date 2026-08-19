using Chama_Jussa.Models;

namespace Chama_Jussa.Interfaces;

public interface IUsuarioRepository
{
    void Cadastrar(UsuarioTb novoUsuario);
    UsuarioTb BuscarPorId(Guid Id);
    UsuarioTb BuscarPorEmailESenha(string gmail, string senha);

    //excluir funcão de listar após o fim dos teste
    List<UsuarioTb> Listar();

    void Deletar(Guid Id);

	void AtualizarIdCorpo(UsuarioTb UsuarioAtualizado);
	void AtualizarIdUrl(Guid IdUsurio, UsuarioTb UsuarioAtualizado);
}
