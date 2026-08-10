using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;


namespace Wise_Report
{
    //public class PushMessaging
    //{
    //    static PushMessaging _instance = null;
    //    NewMessageNotifier _newMessageNotifier;
    //    Action<IEnumerable<NOTIFICATION>> _dispatcher;
    //    string _connString;
    //    string _selectQuery;
    //    string username;



    //    public static PushMessaging GetInstance(Action<IEnumerable<NOTIFICATION>> dispatcher)
    //    {
    //        if (_instance == null)
    //            _instance = new PushMessaging(dispatcher);

    //        return _instance;
    //    }
    //    private PushMessaging(Action<IEnumerable<NOTIFICATION>> dispatcher)
    //    {
    //        _dispatcher = dispatcher;
    //        _selectQuery = @"SELECT [ID],[NGAY_THONG_BAO],[NGUOI_DUNG],[NOI_DUNG_THONG_BAO] FROM [dbo].[NOTIFICATIONS]";
    //        _newMessageNotifier = new NewMessageNotifier(_connString, _selectQuery);
    //        _newMessageNotifier.NewMessage += NewMessageRecieved;
    //    }


    //    internal void NewMessageRecieved(object sender, SqlNotificationEventArgs e)
    //    {
    //        IEnumerable<NOTIFICATION> newMessages = FetchMessagesFromDb();
    //        _dispatcher(newMessages);
    //        using (ERP_DATABASEEntities db = new ERP_DATABASEEntities())
    //        {
    //            foreach(var item in newMessages)
    //            {
    //                db.Database.ExecuteSqlCommand("UPDATE NOTIFICATIONS set DA_GUI_THONG_BAO = 1 where ID = " + item.ID);
    //                db.SaveChanges();
    //            }
    //            //Mark all dispatched messages as sent
    //            //newMessages.ToList().ForEach(lm => { db.NOTIFICATIONS.Attach(lm); lm.DA_GUI_THONG_BAO = true; });
    //           // db.SaveChanges();
    //        }
    //    }

    //    private IEnumerable<NOTIFICATION> FetchMessagesFromDb()
    //    {
    //        using (ERP_DATABASEEntities db = new ERP_DATABASEEntities())
    //        {
    //            return db.NOTIFICATIONS.Where(lm => lm.DA_GUI_THONG_BAO == false && lm.DA_DOC_THONG_BAO == false).ToList();
    //        }
    //    }
    //}

    public class ConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =
            new Dictionary<T, HashSet<string>>();

        public int Count
        {
            get
            {
                return _connections.Count;
            }
        }

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }
}