using Wise_Report.Models.BusinessModel;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.Entity;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace Wise_Report
{
    public class MvcApplication : System.Web.HttpApplication
    {
        string connString = ConfigurationManager.ConnectionStrings["sqlConString"].ConnectionString;
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            GlobalConfiguration.Configure(WebApiConfig.Register);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            //Database.SetInitializer<ProjectManagements>(null);
            // Khởi tạo cơ sở dl nếu có sự thay đổi về model
            //Database.SetInitializer(new DropCreateDatabaseIfModelChanges<ProjectManagements>());
            //Database.SetInitializer(new DatabaseInitializer());
            SqlDependency.Start(connString);
            System.Data.SqlClient.SqlDependency.Start(connString);
        }
        protected void Session_Start()
        {
            Session["Username"] = null;
            Session["Fullname"] = null;
            Session["Isadmin"] = null;
            Session["Avatar"] = null;
        }

        protected void Application_End()
        {
            //Stop SQL dependency
            SqlDependency.Stop(connString);
            System.Data.SqlClient.SqlDependency.Stop(connString);
        }
    }
}
