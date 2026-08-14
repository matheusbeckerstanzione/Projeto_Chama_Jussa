using Microsoft.AspNetCore.Mvc;

namespace Chama_Jussa.Controllers;

public class ServicoController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
