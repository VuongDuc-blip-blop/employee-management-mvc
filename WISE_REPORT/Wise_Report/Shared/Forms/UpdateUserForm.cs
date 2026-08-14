using System;
using System.ComponentModel.DataAnnotations;

namespace Wise_Report.Shared.Forms
{
public class UpdateUserForm
{
    [Required]
    public Guid Id { get; set; }
    [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập.")]
    [StringLength(256, ErrorMessage = "Tên đăng nhập không được vượt quá 256 ký tự.")]
    public string UserName { get; set; }
    [StringLength(128, ErrorMessage = "Mật khẩu không được vượt quá 128 ký tự.")]
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [StringLength(5000, ErrorMessage = "Mô tả hồ sơ không được vượt quá 5000 ký tự.")]
    public string ProfileDescription { get; set; }
}
}