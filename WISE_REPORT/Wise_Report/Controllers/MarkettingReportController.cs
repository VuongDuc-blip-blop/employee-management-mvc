using Wise_Report.Hubs;
using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace Wise_Report.Controllers
{
    public class MarkettingReportController : Controller
    {
        SMART_OKRSEntities db = new SMART_OKRSEntities();
        // GET: MarkettingReport
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Mark_daily_report()
        {
            return View();
        }

        public ActionResult ExportData(string idheader)
        {
            string headerid = Request["idheader"];
            var query = db.Database.SqlQuery<Proc_Get_Report_Header_Result>("Proc_Get_Report_Header @headerid", new SqlParameter("headerid", headerid));
            var result = query.ToList();

            var gv = new GridView();
            gv.DataSource = result;
            gv.DataBind();
            Response.ClearContent();
            Response.Buffer = true;
            Response.AddHeader("content-disposition", "attachment; filename= Form_Import_report.xls");
            Response.ContentType = "application/ms-excel";
            Response.Charset = "UTF-8";
            Response.ContentEncoding = System.Text.Encoding.UTF8;
            Response.BinaryWrite(System.Text.Encoding.UTF8.GetPreamble());
            StringWriter objStringWriter = new StringWriter();
            HtmlTextWriter objHtmlTextWriter = new HtmlTextWriter(objStringWriter);
            gv.RenderControl(objHtmlTextWriter);
            Response.Output.Write(objStringWriter.ToString());
            Response.Flush();
            Response.End();
            return View();
        }
    }
}