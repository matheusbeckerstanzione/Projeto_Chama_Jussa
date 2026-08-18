using Chama_Jussa.BdContextJussa;
using Chama_Jussa.Interfaces;
using Chama_Jussa.Models;

namespace Chama_Jussa.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly ChamadaContext _context;
    public UsuarioRepository(ChamadaContext context)
    {
        _context = context;
    }

    public UsuarioTb BuscarPorEmailESenha(string gmail, string senha)
    {
        try 
        {
            UsuarioTb usuarioBuscado = _context.UsuarioTbs.FirstOrDefault(u => u.Email == gmail )!;

            if (usuarioBuscado != null)
            {
                bool confere = Criptografia.CompararHash(senha, usuarioBuscado.Senha);
                if (confere)
                {
                    return usuarioBuscado; 
                }
            }
            return null!;
        }
        catch 
        {
            throw;
        }
    }

    public UsuarioTb BuscarPorId(Guid Id)
    {
        throw new NotImplementedException();
    }

    public void Cadastrar(UsuarioTb novoUsuario)
    {
        try
        {
            novoUsuario.IdUsuario = Guid.NewGuid();
            //gera o hash da senha antes de salvar no banco
            novoUsuario.Senha = Criptografia.GerarHash(novoUsuario.Senha);

            _context.UsuarioTbs.Add(novoUsuario);
            _context.SaveChanges();
        }
        catch
        {
            throw;
        }
    }

    //apagar esta função após o fim do periodo de testes
    public List<UsuarioTb> Listar()
    {
        try
        {
            List<UsuarioTb> listaUsuarios = _context.UsuarioTbs.ToList();
            return listaUsuarios;
        }
        catch
        {
            throw;
        }
    }
}
