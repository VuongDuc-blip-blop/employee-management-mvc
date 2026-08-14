using Wise_Report.Hubs;
using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Microsoft.Ajax.Utilities;
using System.Data.SqlClient;
using System.Web.UI.WebControls;
using System.Web.UI;
using Wise_Report.Enum;
using Wise_Report.Shared.Forms;

namespace Wise_Report.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        TestEntities db = new TestEntities();
        XuLyNgayThang xlnt = new XuLyNgayThang();

        public ActionResult HomeLayout()
        {
            return View();
        }
        public ActionResult Configuration()
        {
            return View();
        }

        [HttpGet]
        public ActionResult Login()
        {
            if (Session["userid"] != null)
            {
                return RedirectToAction("HomeLayout", "Home");
            }

            return View(new LoginForm());
        }
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Login(LoginForm form)
        {
            if (!ModelState.IsValid)
            {
                return IdentityJson(false, null, GetModelStateErrors(), 400);
            }

            var normalizedUserName = form.UserName.Trim();
            var candidates = db.Users
                .Where(x =>
                    !x.IsDeleted
                    && x.ModerationStatus == (int)ModerationStatus.Approved
                    && x.UserName == normalizedUserName)
                .Take(2)
                .ToList();

            var user = candidates.Count == 1
                ? candidates[0]
                : null;
            var verification = user == null
                ? new PasswordCheckResult(false, false)
                : PasswordSecurity.VerifyPassword(user.Password, form.Password);

            if (user == null || !verification.Succeeded)
            {
                return IdentityJson(
                    false,
                    null,
                    new[] { "Tên đăng nhập hoặc mật khẩu không đúng." },
                    400);
            }

            if (verification.RequiresUpgrade)
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        user.Password = PasswordSecurity.HashPassword(form.Password);
                        user.LastModifiedAt = DateTime.UtcNow;
                        user.LastModifiedBy = user.Id;
                        db.SaveChanges();
                        transaction.Commit();
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        return IdentityJson(
                            false,
                            null,
                            new[] { "Không thể hoàn tất đăng nhập. Vui lòng thử lại." },
                            500);
                    }
                }
            }

            Session.Clear();
            Session["username"] = user.UserName;
            Session["userid"] = user.Id;

            return IdentityJson(true, Url.Action("HomeLayout", "Home"), Enumerable.Empty<string>(), 200);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return IdentityJson(true, Url.Action("Login", "Home"), Enumerable.Empty<string>(), 200);
        }

        public ActionResult Register()
        {
            return View();
        }
        //public ActionResult ExportDeNghiCongTacPhi(string tungay, string denngay, string nguoidenghi)
        //{
        //    var username = Session["USERNAME"].ToString(); 
        //    if (tungay != "" && denngay == "") { 
        //        var tukhoa = xlnt.Xulydatetime(tungay); 
        //        var query = db.Database.SqlQuery<dynamic>("Proc_listTongHopGioLamThem_XuatExcel @username,@nhanvien,@tungay,@denngay", 
        //            new SqlParameter("username", username), 
        //            new SqlParameter("nhanvien", nguoidenghi), 
        //            new SqlParameter("tungay", tukhoa), 
        //            new SqlParameter("denngay", "")); 
        //        var dt = query.ToList(); 
        //        var gv = new GridView(); 
        //        gv.DataSource = dt; gv.DataBind(); 
        //        Response.ClearContent(); 
        //        Response.Buffer = true; 
        //        Response.AddHeader("content-disposition", "attachment; filename= DanhSachDeNghiCongTacPhi.xls"); 
        //        Response.ContentType = "application/ms-excel"; 
        //        Response.Charset = "UTF-8"; 
        //        Response.ContentEncoding = System.Text.Encoding.UTF8; 
        //        Response.BinaryWrite(System.Text.Encoding.UTF8.GetPreamble()); 
        //        StringWriter objStringWriter = new StringWriter(); 
        //        HtmlTextWriter objHtmlTextWriter = new HtmlTextWriter(objStringWriter); 
        //        gv.RenderControl(objHtmlTextWriter); Response.Output.Write(objStringWriter.ToString()); 
        //        Response.Flush(); Response.End(); 
        //        return View("ListTongHopGioLamThem"); }
        //    return View("");


        //}
        [HttpGet]
        public ActionResult ChangePassword()
        {
            if (Session["userid"] == null)
            {
                return RedirectToAction("Login");
            }

            return View(new ChangePasswordForm());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult ChangePassword(ChangePasswordForm form)
        {
            Guid userId;
            if (Session["userid"] == null
                || !Guid.TryParse(Convert.ToString(Session["userid"]), out userId))
            {
                Session.Clear();
                Session.Abandon();

                return IdentityJson(
                    false,
                    Url.Action("Login", "Home"),
                    new[] { "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
                    401);
            }

            if (!ModelState.IsValid)
            {
                return IdentityJson(false, null, GetModelStateErrors(), 400);
            }

            var user = db.Users.SingleOrDefault(x =>
                x.Id == userId
                && !x.IsDeleted
                && x.ModerationStatus == (int)ModerationStatus.Approved);

            if (user == null)
            {
                Session.Clear();
                Session.Abandon();
                return IdentityJson(
                    false,
                    Url.Action("Login", "Home"),
                    new[] { "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
                    401);
            }

            var currentVerification = PasswordSecurity.VerifyPassword(user.Password, form.CurrentPassword);

            if (!currentVerification.Succeeded)
            {
                ModelState.AddModelError(
                    "CurrentPassword",
                    "Mật khẩu hiện tại không đúng.");
                return IdentityJson(false, null, new[] { "Mật khẩu hiện tại không đúng." }, 400);
            }

            var samePassword = PasswordSecurity.VerifyPassword(user.Password, form.NewPassword);

            if (samePassword.Succeeded)
            {
              
                return IdentityJson(false, null, new[] { "Mật khẩu mới phải khác mật khẩu hiện tại." }, 400);
            }

            using (var transaction = db.Database.BeginTransaction())
            {
                try
                {
                    user.Password = PasswordSecurity.HashPassword(form.NewPassword);
                    user.LastModifiedAt = DateTime.UtcNow;
                    user.LastModifiedBy = user.Id;
                    db.SaveChanges();
                    transaction.Commit();
                }
                catch (Exception)
                {
                    transaction.Rollback();
                    return IdentityJson(
                        false,
                        null,
                        new[] { "Không thể hoàn tất thay đổi mật khẩu. Vui lòng thử lại." },
                        500);
                }
            }

            Session.Clear();
            Session.Abandon();
            return IdentityJson(true, Url.Action("Login", "Home"), Enumerable.Empty<string>(), 200);
        }

        private IEnumerable<string> GetModelStateErrors()
        {
            return ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(error => string.IsNullOrEmpty(error.ErrorMessage) ? "Dữ liệu không hợp lệ." : error.ErrorMessage);
        }
        

        private JsonResult IdentityJson(bool success, string redirectUrl, IEnumerable<string> errors, int statusCode)
        {
            Response.StatusCode = statusCode;
            Response.TrySkipIisCustomErrors = true;

            return Json(new
            {
                Success = success,
                RedirectUrl = redirectUrl,
                Errors = errors ?? Enumerable.Empty<string>()
            });
        }

        //Lưu ảnh
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Upload(IEnumerable<HttpPostedFileBase> files)
        {
            if (files != null)
            {
                foreach (var file in files)
                {
                    // Verify that the user selected a file
                    if (file != null && file.ContentLength > 0)
                    {
                        // extract only the fielname
                        var fileName = Path.GetFileName(file.FileName);
                        // TODO: need to define destination
                        var path = Path.Combine(Server.MapPath("~/Content/images/Avatar"), fileName);
                        file.SaveAs(path);
                    }
                }
            }
            return RedirectToAction("Configuration", "Home");
        }

        //Lưu ảnh update
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Upload_update(IEnumerable<HttpPostedFileBase> files_update)
        {
            if (files_update != null)
            {
                foreach (var file in files_update)
                {
                    // Verify that the user selected a file
                    if (file != null && file.ContentLength > 0)
                    {
                        // extract only the fielname
                        var fileName_update = Path.GetFileName(file.FileName);
                        // TODO: need to define destination
                        var path = Path.Combine(Server.MapPath("~/Content/images/Avatar"), fileName_update);
                        file.SaveAs(path);
                    }
                }
            }
            return RedirectToAction("Configuration", "Home");
        }
                
    }
}
