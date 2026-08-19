public static class Criptografia
{
    //Criptografa a senha utilazando o algoritmo BCrypt
    public static string GerarHash(string valor)
    {
        return BCrypt.Net.BCrypt.HashPassword(valor);
    }

    //Compara a senha do formulário com a senha do banco de dados utilizando o algoritmo BCrypt
    public static bool CompararHash(string senhaForm, string senhaBanco)
    {
        return BCrypt.Net.BCrypt.Verify(senhaForm, senhaBanco);
    }

}