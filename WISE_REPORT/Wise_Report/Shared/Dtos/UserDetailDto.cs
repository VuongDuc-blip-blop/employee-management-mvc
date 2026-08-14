using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public class UserDetailDto
    {
        public Guid Id { get; set; }
        public string UserName { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ProfileDescription { get; set; }
        public int ModerationStatus { get; set; }
    }
}