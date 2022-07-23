using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(Wise_Report.Startup))]
namespace Wise_Report
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
            app.MapSignalR();
        }
    }
}
