using System;
using System.Collections.Generic;
using Chama_Jussa.Models;
using Microsoft.EntityFrameworkCore;

namespace Chama_Jussa.BdContextJussa;

public partial class ChamadaContext : DbContext
{
    public ChamadaContext()
    {
    }

    public ChamadaContext(DbContextOptions<ChamadaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<NotificacaoTb> NotificacaoTbs { get; set; }

    public virtual DbSet<ServicoTb> ServicoTbs { get; set; }

    public virtual DbSet<UsuarioTb> UsuarioTbs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<NotificacaoTb>(entity =>
        {
            entity.HasKey(e => e.IdNotificacao).HasName("PK__Notifica__046D38721CF3F2E3");

            entity.Property(e => e.IdNotificacao).HasDefaultValueSql("(newid())");
            entity.Property(e => e.DataHora).HasDefaultValueSql("(getutcdate())");

            entity.HasOne(d => d.IdServicoNavigation).WithMany(p => p.NotificacaoTbs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificac__IdSer__7B5B524B");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.NotificacaoTbs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificac__IdUsu__7A672E12");
        });

        modelBuilder.Entity<ServicoTb>(entity =>
        {
            entity.HasKey(e => e.IdServico).HasName("PK__ServicoT__474DDE3AF96E0CA7");

            entity.Property(e => e.IdServico).HasDefaultValueSql("(newid())");
            entity.Property(e => e.DataCriacao).HasDefaultValueSql("(getutcdate())");
            entity.Property(e => e.NumeroServico).ValueGeneratedOnAdd();

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.ServicoTbs)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__ServicoTB__IdUsu__75A278F5");
        });

        modelBuilder.Entity<UsuarioTb>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__UsuarioT__5B65BF97F7DBA099");

            entity.Property(e => e.IdUsuario).HasDefaultValueSql("(newid())");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
