using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public sealed class SessionPrincipalDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public bool IsAdmin { get; set; }
        public Guid? EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
        public bool CanCreateOrders { get; set; }
        public bool CanManageOrders { get; set; }
    }
}