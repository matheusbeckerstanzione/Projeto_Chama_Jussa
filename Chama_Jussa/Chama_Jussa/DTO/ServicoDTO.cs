namespace Chama_Jussa.DTO;

public class ServicoDTO
{
    public Guid? IdServico { get; set; }
    public string? Titulo { get; set; }
    public string? Maquina { get; set; }
    public IFormFile? Imagem { get; set; }
    public string? Localizacao { get; set; }
    public string? Descricao { get; set; }
    public int? Numero_Servico { get; set; }
    public string? Situacao { get; set; }
    public DateTime? Data_Criacao { get; set; }
}
