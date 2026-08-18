using Microsoft.AspNetCore.Mvc;

namespace Chama_Jussa.Controllers;

public class UsuarioController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
