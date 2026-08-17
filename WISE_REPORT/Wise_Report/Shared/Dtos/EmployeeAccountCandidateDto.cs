using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public sealed class EmployeeAccountCandidateDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public Guid? BoundEmployeeId { get; set; }
        public string BoundEmployeeCode { get; set; }
        public string BoundEmployeeFullName { get; set; }
    }
}