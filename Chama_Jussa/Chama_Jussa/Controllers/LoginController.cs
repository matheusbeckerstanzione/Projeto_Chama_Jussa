using Microsoft.AspNetCore.Mvc;

namespace Chama_Jussa.Controllers;

public class LoginController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
