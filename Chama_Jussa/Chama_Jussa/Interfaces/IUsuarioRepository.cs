using Chama_Jussa.Models;

namespace Chama_Jussa.Interfaces;

public interface IUsuarioRepository
{
    void Cadastrar(UsuarioTb novoUsuario);
    UsuarioTb BuscarPorId(Guid Id);
    UsuarioTb BuscarPorEmailESenha(string gmail, string senha);

    //excluir funcão de listar após o fim dos teste
    List<UsuarioTb> Listar();
}
