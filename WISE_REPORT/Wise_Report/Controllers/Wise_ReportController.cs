using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Wise_Report.Controllers
{
    public class Wise_ReportInfoController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        public ActionResult ListStatus()
        {
            return View();
        }

        public ActionResult Chart()
        {
            return View();
        }

        public ActionResult QtyChart()
        {
            return View();
        }

        public ActionResult TimelineChart()
        {
            return View();
        }

        public ActionResult Layout()
        {
            return View();
        }

        public ActionResult SetupHome()
        {
            return View();
        }
        public ActionResult Report()
        {
            return View();
        }

        public ActionResult LiveBoard()
        {
            return View();
        }

        public ActionResult DailyChart()
        {
            return View();
        }

        public ActionResult WeeklyChart()
        {
            return View();
        }

        public ActionResult MonthlyChart()
        {
            return View();
        }

        public ActionResult HomeChart()
        {
            return View();
        }

        public ActionResult OverAll()
        {
            return View();
        }

        public ActionResult OEEHome()
        {
            return View();
        }

        public ActionResult ListOEE()
        {
            return View();
        }

        public ActionResult OEEHistory()
        {
            return View();
        }
    }
}