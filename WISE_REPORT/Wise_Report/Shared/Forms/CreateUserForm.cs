using System.ComponentModel.DataAnnotations;
using Wise_Report.Enum;
namespace Wise_Report.Shared.Forms
{
public class CreateUserForm
{
    [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập.")]
    [StringLength(256, ErrorMessage = "Tên đăng nhập không được vượt quá 256 ký tự.")]
    public string UserName { get; set; }
    [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
    [DataType(DataType.Password)]
    [StringLength(128, ErrorMessage = "Mật khẩu không được vượt quá 128 ký tự.")]
    public string Password { get; set; }

    public int ModerationStatus { get; set; } = (int)Wise_Report.Enum.ModerationStatus.Approved;
    [StringLength(5000, ErrorMessage = "Mô tả hồ sơ không được vượt quá 5000 ký tự.")]
    public string ProfileDescription { get; set; }
}
}