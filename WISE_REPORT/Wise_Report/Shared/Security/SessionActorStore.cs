using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Wise_Report.Enum;
using System.Web.SessionState;

namespace Wise_Report.Shared.Security
{
    public static class SessionActorStore
    {
        public static void Write(HttpSessionStateBase session, SessionActor actor)
        {
            if(session == null)
            {
                throw new ArgumentNullException(nameof(session));
            }
            if(actor == null)
            {
                throw new ArgumentNullException(nameof(actor));
            }

            session[SessionKeys.ActorUserId] = actor.UserId;
            session[SessionKeys.ActorUserName] = actor.UserName;
            session[SessionKeys.ActorRole] = actor.Role;
            session[SessionKeys.ActorEmployeeId] = actor.EmployeeId;
            session[SessionKeys.ActorEmployeeCode] = actor.EmployeeCode;
            session[SessionKeys.ActorEmployeeFullName] = actor.EmployeeFullName;
        }

        public static bool TryRead(HttpSessionStateBase session, out SessionActor actor)
        {
            actor = null;
            if(session == null)
            {
                return false;
            }

            Guid userId;
            int roleValue;

            if (!TryGuid(session[SessionKeys.ActorUserId], out userId)
                || !int.TryParse(Convert.ToString(session[SessionKeys.ActorRole]), out roleValue)
                || !System.Enum.IsDefined(typeof(DemoRole), roleValue))
            {
                return false;
            }

            Guid employeeId;
            var hasEmployeeId = TryGuid(session[SessionKeys.ActorEmployeeId], out employeeId);
            var role = (DemoRole)roleValue;

            actor = new SessionActor
            {
                UserId = userId,
                UserName = Convert.ToString(session[SessionKeys.ActorUserName]),
                Role = role,
                EmployeeId = hasEmployeeId ? (Guid?)employeeId : null,
                EmployeeCode = Convert.ToString(session[SessionKeys.ActorEmployeeCode]),
                EmployeeFullName = Convert.ToString(session[SessionKeys.ActorEmployeeFullName]),
            };
            return true;
        }

        public static void Clear(HttpSessionStateBase session)
        {
            if(session == null)
            {
                throw new ArgumentNullException(nameof(session));
            }

            session.Remove(SessionKeys.ActorUserId);
            session.Remove(SessionKeys.ActorUserName);
            session.Remove(SessionKeys.ActorRole);
            session.Remove(SessionKeys.ActorEmployeeId);
            session.Remove(SessionKeys.ActorEmployeeCode);
            session.Remove(SessionKeys.ActorEmployeeFullName);
        }

        public static bool TryGuid(object value, out Guid result)
        {
            if(value is Guid)
            {
                result = (Guid)value;
                return true;
            }
            return Guid.TryParse(Convert.ToString(value), out result) && result != Guid.Empty;
        }
    }
}