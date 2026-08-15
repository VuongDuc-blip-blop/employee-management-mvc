using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using Wise_Report.Enum;

namespace Wise_Report.Shared.Forms
{
    public sealed class CreateEmployeeForm
    {
        [Required(ErrorMessage ="Vui lòng nhập mã nhân viên")]
        [StringLength(50, ErrorMessage = "Mã nhân viên không được vượt quá 50 ký tự")]
        public string EmployeeCode { get; set; }  

        [Required(ErrorMessage="Vui lòng nhập họ và tên")]
        [StringLength(256, ErrorMessage = "Họ và tên không được vượt quá 256 ký tự")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập email")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [StringLength(256, ErrorMessage = "Email không được vượt quá 256 ký tự")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập số điện thoại")]
        [StringLength(32, ErrorMessage = "Số điện thoại không được vượt quá 32 ký tự")]
        public string PhoneNumber { get; set; }

        [Required(ErrorMessage="Vui lòng nhập địa chỉ")]
        [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
        public string Address { get; set; }

        [Range(0, 2, ErrorMessage = "Giới tính không hợp lệ")]
        public int Gender { get; set; }

        [Range(0, 2, ErrorMessage = "Trạng thái không hợp lệ")]
        public int ModerationStatus { get; set; } = (int)Wise_Report.Enum.ModerationStatus.Approved;

    }
}