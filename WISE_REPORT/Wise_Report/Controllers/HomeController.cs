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
using Wise_Report.Shared.Dtos;

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
                return View(form);
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
                ModelState.AddModelError(
                    string.Empty,
                    "Tên đăng nhập hoặc mật khẩu không đúng.");
                return View(form);
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
                        ModelState.AddModelError(
                            string.Empty,
                            "Không thể hoàn tất đăng nhập. Vui lòng thử lại.");
                        return View(form);
                    }
                }
            }

            Session.Clear();
            Session["username"] = user.UserName;
            Session["userid"] = user.Id;

            return RedirectToAction("HomeLayout", "Home");
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Logout()
        {
            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
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
                return RedirectToAction("Login");
            }

            if (!ModelState.IsValid)
            {
                return View(form);
            }

            var user = db.Users.SingleOrDefault(x =>
                x.Id == userId
                && !x.IsDeleted
                && x.ModerationStatus == (int)ModerationStatus.Approved);

            if (user == null)
            {
                Session.Clear();
                Session.Abandon();
                return RedirectToAction("Login");
            }

            var currentVerification = PasswordSecurity.VerifyPassword(user.Password, form.CurrentPassword);

            if (!currentVerification.Succeeded)
            {
                ModelState.AddModelError(
                    "CurrentPassword",
                    "Mật khẩu hiện tại không đúng.");
                return View(form);
            }

            var samePassword = PasswordSecurity.VerifyPassword(user.Password, form.NewPassword);

            if (samePassword.Succeeded)
            {
                ModelState.AddModelError(
                    "NewPassword",
                    "Mật khẩu mới phải khác mật khẩu hiện tại.");
                return View(form);
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
                    ModelState.AddModelError(
                        string.Empty,
                        "Không thể đổi mật khẩu. Vui lòng thử lại.");
                    return View(form);
                }
            }

            Session.Clear();
            Session.Abandon();
            return RedirectToAction("Login");
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
