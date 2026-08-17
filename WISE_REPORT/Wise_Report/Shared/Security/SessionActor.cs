using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Wise_Report.Enum;

namespace Wise_Report.Shared.Security
{
    public sealed class SessionActor
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public DemoRole Role { get; set; }
        public Guid? EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }

        public bool IsAdmin()
        {
            return Role == DemoRole.Admin;
        }

        public bool IsEmployee()
        {
            return Role == DemoRole.Employee && EmployeeId.HasValue;
        }
    }
}