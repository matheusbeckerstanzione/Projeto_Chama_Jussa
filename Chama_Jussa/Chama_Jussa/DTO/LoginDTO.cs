using System.ComponentModel.DataAnnotations;

namespace Chama_Jussa.DTO;

public class LoginDTO
{
    [Required(ErrorMessage = "O Email do usuário é obrigatório")]
    public string? Email { get; set; }

    [Required(ErrorMessage = "A Senha do usuário é obrigatório")]
    public string? Senha { get; set; }
}
