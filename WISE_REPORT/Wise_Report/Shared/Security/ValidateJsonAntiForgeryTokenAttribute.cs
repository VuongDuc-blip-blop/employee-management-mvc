using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Web.Helpers;

namespace Wise_Report.Shared.Security
{
    [AttributeUsage(AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class ValidateJsonAntiForgeryTokenAttribute : FilterAttribute, IAuthorizationFilter
    {
        private const string HeaderName = "X-Request-Verification-Token";

        public ValidateJsonAntiForgeryTokenAttribute()
        {
            Order = 1;
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            var request = filterContext.HttpContext.Request;
            var formToken = request.Headers[HeaderName];
            var cookieName = ResolveCookieName(request.Cookies.AllKeys);
            var cookie = string.IsNullOrWhiteSpace(cookieName) ? null : request.Cookies[cookieName];

            try
            {
                AntiForgery.Validate(cookie == null ? null : cookie.Value, formToken);
            }
            catch (HttpAntiForgeryException)
            {
                filterContext.HttpContext.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;

                filterContext.Result = new JsonResult
                {
                    Data = new
                    {
                        Success = false,
                        Data = (object)null,
                        Message = "Yêu cầu bảo mật không hợp lệ.",
                        Errors = new[] {"Vui lòng tải lại trang và thử lại."}
                    },
                    JsonRequestBehavior = JsonRequestBehavior.DenyGet
                };
            }
        }

        private static string ResolveCookieName(string[] cookieNames)
        {
            if(!string.IsNullOrWhiteSpace(AntiForgeryConfig.CookieName))
            {
                return AntiForgeryConfig.CookieName;
            }

            return (cookieNames ?? new string[0]).FirstOrDefault(name => name != null && name.StartsWith("__RequestVerificationToken", StringComparison.Ordinal));
        }
    }
}