using System.ComponentModel.DataAnnotations;

namespace Chama_Jussa.DTO;

public class NotificacaoDTO
{
    public Guid? IdUsuario { get; set; }
    public Guid? IdServico { get; set; }
    public string? Mensagem { get; set; }
}