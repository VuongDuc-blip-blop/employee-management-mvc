namespace Wise_Report.Migrations
{
    using Models.DataModel;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;

    internal sealed class Configuration : DbMigrationsConfiguration<Wise_Report.Models.BusinessModel.ProjectManagements>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = true;
            ContextKey = "Wise_Report.Models.BusinessModel.ProjectManagements";
        }

        protected override void Seed(Wise_Report.Models.BusinessModel.ProjectManagements context)
        {
            if (context.Administrators.Any() == false)
            {
                var admin = new User();
                admin.UserName = "Admin";
                admin.Password = "e10adc3949ba59abbe56e057f20f883e";
                //admin.Avatar = "/Content/dist/img/avatar04.png";
                //admin.Isadmin = true;

                //context.USER.Add(admin);
                context.SaveChanges();
            }

        }
    }
}
