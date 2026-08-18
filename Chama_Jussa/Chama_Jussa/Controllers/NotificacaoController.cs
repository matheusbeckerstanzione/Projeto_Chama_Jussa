using Microsoft.AspNetCore.Mvc;

namespace Chama_Jussa.Controllers;

public class NotificacaoController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
