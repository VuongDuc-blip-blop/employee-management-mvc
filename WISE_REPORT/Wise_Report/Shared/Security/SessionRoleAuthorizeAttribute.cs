using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using System.Net;
using Wise_Report.Enum;


namespace Wise_Report.Shared.Security
{
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public sealed class SessionRoleAuthorizeAttribute : AuthorizeAttribute
    {
        private readonly DemoRole[] allowedRoles;

        public SessionRoleAuthorizeAttribute(params DemoRole[] allowedRoles)
        {
            this.allowedRoles = allowedRoles ?? new DemoRole[0];
            Order = 0;
        }

        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            SessionActor actor;
            return SessionActorStore.TryRead(httpContext.Session, out actor) && (allowedRoles.Length == 0 || allowedRoles.Contains(actor.Role));
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            SessionActor actor;
            var authenticated = SessionActorStore.TryRead(filterContext.HttpContext.Session, out actor);
            var request = filterContext.HttpContext.Request;
            var wantsJson = request.IsAjaxRequest()
                || string.Equals(request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase)
                || (request.AcceptTypes != null
                    && request.AcceptTypes.Any(value =>
                        value != null
                        && value.IndexOf("application/json", StringComparison.OrdinalIgnoreCase) >= 0));
            if (wantsJson)
            {
                filterContext.HttpContext.Response.TrySkipIisCustomErrors = true;
                filterContext.Result = new HttpStatusCodeResult(
                    authenticated ? HttpStatusCode.Forbidden : HttpStatusCode.Unauthorized,
                    authenticated ? "Forbidden." : "Authentication is required.");
                return;
            }

            if (!authenticated)
            {
                filterContext.Result = new RedirectToRouteResult(
                    new RouteValueDictionary(new
                    {
                        controller = "Home",
                        action = "Login",
                    })
                );
                return;
            }

            filterContext.Result = new HttpStatusCodeResult(HttpStatusCode.Forbidden);
            
        }
    }
}