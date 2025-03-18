using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace Wise_Report.Models.BusinessModel
{
    public class ProjectManagements : DbContext
    {
        public ProjectManagements() : base("ProjectManagements")
        {

        }
        public DbSet<TestEntities> Administrators { get; set; }
    }
}