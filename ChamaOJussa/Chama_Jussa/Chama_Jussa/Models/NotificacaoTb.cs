using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chama_Jussa.Models;

[Table("NotificacaoTB")]
public partial class NotificacaoTb
{
    [Key]
    public Guid IdNotificacao { get; set; }

    public Guid IdUsuario { get; set; }

    public Guid IdServico { get; set; }

    [StringLength(255)]
    public string Mensagem { get; set; } = null!;

    [Column("Data_Hora", TypeName = "datetime")]
    public DateTime DataHora { get; set; }

    [ForeignKey("IdServico")]
    [InverseProperty("NotificacaoTbs")]
    public virtual ServicoTb IdServicoNavigation { get; set; } = null!;

    [ForeignKey("IdUsuario")]
    [InverseProperty("NotificacaoTbs")]
    public virtual UsuarioTb IdUsuarioNavigation { get; set; } = null!;
}
