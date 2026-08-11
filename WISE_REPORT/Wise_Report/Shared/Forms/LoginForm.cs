using System.ComponentModel.DataAnnotations;

namespace Wise_Report.Shared.Forms
{
    public class LoginForm
    {
        [Required(ErrorMessage = "Vui lòng nhập tên đăng nhập.")]
        [StringLength(256, ErrorMessage = "Tên đăng nhập không được vượt quá 256 ký tự.")]
        [Display(Name = "Tên đăng nhập")]
        public string UserName { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu.")]
        [StringLength(128, ErrorMessage = "Mật khẩu không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu")]
        public string Password { get; set; }
    }
}
