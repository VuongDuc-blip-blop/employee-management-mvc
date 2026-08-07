using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Dtos
{
    public class EmployeePageItem
    {
        public Guid Id {get; set;}
        public string EmployeeCode {get; set;}
        public string FullName {get; set;}
        public string Email {get; set;}
        public string PhoneNumber {get; set;}
        public string Address {get; set;}
        public int Gender {get; set;}
        public int ModerationStatus {get; set;}
        public DateTime CreatedAt {get; set;}
    }
}