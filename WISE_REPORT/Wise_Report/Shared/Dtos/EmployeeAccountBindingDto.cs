using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public sealed class EmployeeAccountBindingDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
        public Guid? CurrentUserId { get; set; }
        public string CurrentUserName { get; set; }
        public byte[] EmployeeVersion { get; set; }
    }

    public sealed class EmployeeAccountBindingResultDto
    {
        public Guid EmployeeId { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string EmployeeCode { get; set; }
        public string EmployeeFullName { get; set; }
        public byte[] EmployeeVersion { get; set; }
    }

    public sealed class EmployeeAccountEditorDto
    {
        public EmployeeAccountBindingDto Binding { get; set; }
        public System.Collections.Generic.IReadOnlyCollection<EmployeeAccountCandidateDto> Candidates { get; set; }
    }

}