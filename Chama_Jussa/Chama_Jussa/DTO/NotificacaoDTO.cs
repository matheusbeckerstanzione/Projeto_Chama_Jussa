using System.ComponentModel.DataAnnotations;

namespace Chama_Jussa.DTO;

public class NotificacaoDTO
{
    public string? Mensagem { get; set; }
    public DateTime? Data_Hora { get; set; }
}