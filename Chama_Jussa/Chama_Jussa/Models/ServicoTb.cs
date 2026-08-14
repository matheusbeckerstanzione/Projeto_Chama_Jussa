using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Chama_Jussa.Models;

[Table("ServicoTB")]
public partial class ServicoTb
{
    [Key]
    public Guid IdServico { get; set; }

    public Guid IdUsuario { get; set; }

    [StringLength(255)]
    public string Titulo { get; set; } = null!;

    [StringLength(255)]
    public string Maquina { get; set; } = null!;

    [StringLength(255)]
    public string Localização { get; set; } = null!;

    [StringLength(255)]
    public string Descricao { get; set; } = null!;

    [StringLength(200)]
    public string? Imagem { get; set; }

    [Column("Numero_Servico")]
    public int NumeroServico { get; set; }

    [StringLength(255)]
    public string Situacao { get; set; } = null!;

    [Column("Data_Criacao", TypeName = "datetime")]
    public DateTime DataCriacao { get; set; }

    [ForeignKey("IdUsuario")]
    [InverseProperty("ServicoTbs")]
    public virtual UsuarioTb IdUsuarioNavigation { get; set; } = null!;

    [InverseProperty("IdServicoNavigation")]
    public virtual ICollection<NotificacaoTb> NotificacaoTbs { get; set; } = new List<NotificacaoTb>();
}
