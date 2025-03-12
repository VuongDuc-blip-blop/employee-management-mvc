using Wise_Report.Hubs;
using Wise_Report.Models.BusinessModel;
using Wise_Report.Models.DataModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Wise_Report.Controllers
{
    public class HomeController : Controller
    {
        // GET: Home
        TestEntities db = new TestEntities();

        public ActionResult HomeLayout()
        {
            return View();
        }
        public ActionResult Configuration()
        {
            return View();
        }
        public ActionResult Login()
        {
            return View();
        }
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Login(string username, string password)
        {
            string passwordMD5 = Commons.MD5Hash(password);
            var user = db.USERS.SingleOrDefault(x => x.USERNAME == username );
            if (user != null)
            {

                Session["username"] = user.USERNAME;
                Session["fullname"] = user.FULLNAME;
                Session["userid"] = user.ID;


                return RedirectToAction("HomeLayout", "Home");
                //return RedirectToAction("Dashboard/Index");
            }
            ViewBag.error = "User and Password wrong!!!";
            return View();
        }
        public ActionResult Logout()
        {

            Session["userid"] = null;
            Session["username"] = null;
            Session["fullname"] = null;

            return RedirectToAction("Login");
        }

        public ActionResult Register()
        {
            return View();
        }

        [HttpPost]
      
        
        public ActionResult ChangePassword(string username, string password_old, string password_new, string password_new_confirm)
        {
            string passwordMD5_new = "", passwordMD5_new_confirm = "", passwordMD5_old = "";

            username = Session["username"].ToString();


            if (password_new!=null && password_new_confirm!=null)
            {                
                if (password_old != "" && password_old != null)
                    passwordMD5_old = Commons.MD5Hash(password_old);
                if (password_new != "" && password_new != null)
                    passwordMD5_new = Commons.MD5Hash(password_new);
                if (password_new_confirm != "" && password_new_confirm != null)
                    passwordMD5_new_confirm = Commons.MD5Hash(password_new_confirm);

                if (passwordMD5_new_confirm != passwordMD5_new)
                {
                    ViewBag.error = "Nhập mật khẩu mới không khớp!";
                }
                else
                {
                    var user = db.USERS.SingleOrDefault(x => x.USERNAME == username && x.PASSWORD == passwordMD5_old );
                    if (user != null)
                    {
                        try
                        {
                            user.PASSWORD = passwordMD5_new;
                            db.SaveChanges();

                            Session["username"] = user.USERNAME;
                            Session["fullname"] = user.FULLNAME;
                            Session["userid"] = user.ID;
                            ViewBag.susscess = "Đổi mật khẩu thành công!";
                            //return RedirectToAction("Index", "Dashboard/Index");

                        }
                        catch (Exception ex)
                        {
                            ViewBag.error = "Đổi mật khẩu không thành công!";
                        }
                        //return RedirectToAction("Dashboard/Index");
                    }
                    else
                        ViewBag.error = "Nhập sai mật khẩu cũ!";
                }
            }

            ViewBag.username = username;
            return View();
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