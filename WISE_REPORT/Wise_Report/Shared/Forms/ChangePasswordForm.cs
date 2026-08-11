using System.ComponentModel.DataAnnotations;

namespace Wise_Report.Shared.Forms
{
    public class ChangePasswordForm
    {
        [Required(ErrorMessage = "Vui lòng nhập mật khẩu hiện tại.")]
        [StringLength(128, ErrorMessage = "Mật khẩu hiện tại không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu hiện tại")]
        public string CurrentPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu mới.")]
        [StringLength(128, MinimumLength = 12, ErrorMessage = "Mật khẩu mới phải có từ 12 đến 128 ký tự.")]
        [DataType(DataType.Password)]
        [Display(Name = "Mật khẩu mới")]
        public string NewPassword { get; set; }

        [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
        [StringLength(128, ErrorMessage = "Xác nhận mật khẩu mới không được vượt quá 128 ký tự.")]
        [DataType(DataType.Password)]
        [Compare("NewPassword", ErrorMessage = "Xác nhận mật khẩu mới không khớp.")]
        [Display(Name = "Xác nhận mật khẩu mới")]
        public string ConfirmNewPassword { get; set; }
    }
}
