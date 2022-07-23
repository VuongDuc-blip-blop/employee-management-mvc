//using SmartOKRs.Hubs;
//using SmartOKRs.Models.BusinessModel;
//using SmartOKRs.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Wise_Report.Models.DataModel;

namespace SmartOKRs.Controllers
{
    public class NotificationController : Controller
    {
        SMART_OKRSEntities db = new SMART_OKRSEntities();
        // GET: Notification
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Notifications()
        {
            return View();
        }
    }
}