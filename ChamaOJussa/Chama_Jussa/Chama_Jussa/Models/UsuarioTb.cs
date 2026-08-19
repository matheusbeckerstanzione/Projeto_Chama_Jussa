using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chama_Jussa.Models;

[Table("UsuarioTB")]
[Index("Email", Name = "UQ__UsuarioT__A9D10534DBCE4405", IsUnique = true)]
public partial class UsuarioTb
{
    [Key]
    public Guid IdUsuario { get; set; }

    [StringLength(160)]
    public string Nome { get; set; } = null!;

    [StringLength(255)]
    public string Senha { get; set; } = null!;

    [StringLength(200)]
    public string Imagem { get; set; } = null!;

    [StringLength(255)]
    public string Email { get; set; } = null!;

    [InverseProperty("IdUsuarioNavigation")]
    public virtual ICollection<NotificacaoTb> NotificacaoTbs { get; set; } = new List<NotificacaoTb>();

    [InverseProperty("IdUsuarioNavigation")]
    public virtual ICollection<ServicoTb> ServicoTbs { get; set; } = new List<ServicoTb>();
}
