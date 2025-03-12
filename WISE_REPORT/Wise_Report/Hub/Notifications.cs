using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Wise_Report.Models.DataModel;
using System.Configuration;
using System.Data.SqlClient;
using System.Data;
using static Wise_Report.Controllers.HomeController;
using System.Globalization;

namespace Wise_Report.Hubs
{
    public class Notifications : Hub
    {
        private TestEntities db = new TestEntities();
        private readonly static ConnectionMapping<string> _connections = new ConnectionMapping<string>();
        public Task AddGroups(string Group)
        {
            var arrStr = Group.Split(';');
            foreach (var item in arrStr)
            {
                if (item != "" && item != null)
                {
                    Groups.Add(Context.ConnectionId, item);
                }
            }
            return Groups.Add(Context.ConnectionId, Group);
        }

        #region "Connect"
        public override Task OnConnected()
        {
            var isNotification = Context.QueryString.Get("isNotification").ToString();
            AddGroups(isNotification);
            return base.OnConnected();
        }

        //public override Task OnDisconnected(bool stopCalled)
        //{
        //    string name = Context.QueryString["username"];

        //    Groups.Remove(Context.ConnectionId, name);

        //    return base.OnDisconnected(stopCalled);
        //}

        public override Task OnReconnected()
        {
            var isNotification = Context.QueryString.Get("isNotification").ToString();
            AddGroups(isNotification);
            return base.OnReconnected();
        }
        #endregion

        #region "Action"

        public void ThongBaoDuyetPO(string message, string username)
        {
            Clients.Group(username).guiThongBaoDuyetPO(message);
        }

        public void dangbaiviet(string noidung)
        {
            Clients.All.sendThongBao(noidung);
        }
        #endregion
    }

    [HubName("notificationHub")]
    public class NotificationHub : Hub
    {
        private TestEntities db = new TestEntities();
        public class ReturnData
        {
            public int ID { set; get; }
            public string WDT_USERNAME { set; get; }
            public int CURRENT_STATE { set; get; }
            public DateTime DATE_TIME { set; get; }
            public int STATE_TIME { set; get; }
            public bool IS_READ { set; get; }
        }

        //[HubMethodName("sendNotifications")]
        //public void SendNotifications()
        //{
        //    using (var connection = new SqlConnection(ConfigurationManager.ConnectionStrings["sqlConString"].ConnectionString))
        //    {
        //        string query = "SELECT [dbo].[SmartOKRs_HISTORY_LOG].ID,WDT_USERNAME,CURRENT_STATE,DATE_TIME,STATE_TIME,IS_READ FROM [dbo].[SmartOKRs_HISTORY_LOG] left join [dbo].[SmartOKRs_WDT_INFO] on [dbo].[SmartOKRs_HISTORY_LOG].MCID = [dbo].[SmartOKRs_WDT_INFO].ID where [dbo].[SmartOKRs_HISTORY_LOG].IS_READ = 0";
        //        //(select max(UserProfileId) from [dbo].[Modeling_NewMessageNotificationCount])
        //        connection.Open();
        //        using (SqlCommand command = new SqlCommand(query, connection))
        //        {
        //            try
        //            {
        //                command.Notification = null;
        //                DataTable dt = new DataTable();
        //                SqlDependency dependency = new SqlDependency(command);
        //                dependency.OnChange += new OnChangeEventHandler(dependency_OnChange);
        //                if (connection.State == ConnectionState.Closed)
        //                    connection.Open();
        //                var reader = command.ExecuteReader();
        //                dt.Load(reader);
        //                if (dt.Rows.Count > 0)
        //                {
        //                    for (int i = 0; i < dt.Rows.Count; i++)
        //                    {
        //                        ReturnData newlog = new ReturnData();                                                              
        //                        newlog.ID = Convert.ToInt32(dt.Rows[i]["ID"]);
        //                        newlog.WDT_USERNAME = dt.Rows[i]["WDT_USERNAME"].ToString();
        //                        newlog.CURRENT_STATE = Convert.ToInt32(dt.Rows[i]["CURRENT_STATE"]);
        //                        newlog.DATE_TIME = DateTime.Parse(dt.Rows[i]["DATE_TIME"].ToString());
        //                        newlog.STATE_TIME = Convert.ToInt32(dt.Rows[i]["STATE_TIME"]);
        //                        db.Database.ExecuteSqlCommand("UPDATE SmartOKRs_HISTORY_LOG set IS_READ = 1 where ID = " + newlog.ID + "");
        //                        IHubContext context = GlobalHost.ConnectionManager.GetHubContext<NotificationHub>();
        //                        context.Clients.All.RecieveNotification(newlog);
                                
        //                    }
        //                }
        //                connection.Close();
        //            }
        //            catch (Exception ex)
        //            {
        //                throw;
        //            }
        //        }
        //    }

        //    //Call function on Client
            
        //}
        //private void dependency_OnChange(object sender, SqlNotificationEventArgs e)
        //{
        //    if (e.Type == SqlNotificationType.Change)
        //    {
        //        NotificationHub nHub = new NotificationHub();
        //        nHub.SendNotifications();
        //    }
        //}
    }
}