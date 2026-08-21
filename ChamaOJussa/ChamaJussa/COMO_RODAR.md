# 🚀 Como Rodar o Projeto ChamaJussa

Este tutorial explica como iniciar o **Backend em .NET** e o **Frontend em React Native / Expo** para fazer todo o sistema funcionar.

---

## 📌 1. Iniciar o Backend (.NET API + SQL Server)

Abra um terminal e navegue até a pasta da API:

```powershell
cd c:\Users\51478718889\Desktop\ChamaOJussa\Chama_Jussa\Chama_Jussa
```

Inicie o servidor da API:

```powershell
dotnet run --launch-profile http
```

> **Informações do Backend:**
> - A API ficará ativa em: `http://localhost:5263`
> - Endereço para celulares na mesma rede: `http://172.16.36.42:5263`
> - O banco de dados SQL Server LocalDB (`Chama_JussaDB`) é criado/conectado automaticamente.
> - **Mantenha este terminal aberto enquanto estiver usando o app!**

---

## 📌 2. Iniciar o Frontend (App Expo)

Abra um **segundo terminal** e acesse a pasta do app:

```powershell
cd c:\Users\51478718889\Desktop\ChamaOJussa\ChamaJussa
```

Inicie o Expo:

```powershell
npx expo start
```

> 📱 **Dica para Celular (se a rede do SENAI bloquear conexão direta):**
> Se o celular não carregar porque a rede Wi-Fi bloqueia comunicação entre dispositivos, use o modo túnel:
> ```powershell
> npx expo start --tunnel
> ```

---

## 📌 3. Como Visualizar o Aplicativo

- **No Navegador (Web):**
  - Pressione a tecla **`w`** no terminal do Expo, ou acesse:
  - 👉 [http://localhost:8081](http://localhost:8081)

- **No Celular (Expo Go):**
  - Abra o aplicativo **Expo Go** no celular.
  - Certifique-se de que o celular e o computador estão conectados na **mesma rede Wi-Fi**.
  - Escaneie o **QR Code** mostrado no terminal do Expo.

---

## 👤 Perfis de Usuário e Contas de Teste

| Tipo de Usuário | Formato de E-mail | Permissões / O que faz |
| :--- | :--- | :--- |
| **Equipe de TI (Técnico)** | `@senai.com` *(Ex: `kessia@senai.com`)* | Pode **Pegar Chamados** (mover para "Em Andamento") e **Finalizar Chamados** (marcar como "Concluído"). |
| **Solicitante (Usuário Comum)** | `@gmail.com` *(Ex: `ariel@gmail.com`)* | Pode **Criar Ordens de Serviço (OS)** com foto e **Editar** suas próprias solicitações abertas. |

> 💡 **Autocadastro:** Se digitar qualquer novo e-mail no login, o sistema cria o usuário automaticamente no banco de dados com a senha digitada!
