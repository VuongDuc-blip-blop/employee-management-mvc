using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace Wise_Report.Models.BusinessModel
{
    public class XuLyNgayThang
    {
        public DateTime Xulydatetime(string date)
        {
            int ngay = Convert.ToInt32(date.Substring(0, 2));
            int thang = Convert.ToInt32(date.Substring(3, 2));

            int nam = Convert.ToInt32(date.Substring(6, 4));
            DateTime dt = new DateTime(nam, thang, ngay);
            return dt;
        }

        public int LaySoTuanTrongNam(DateTime time)
        {
            CultureInfo myCI = CultureInfo.CurrentCulture;
            Calendar myCal = myCI.Calendar;
            CalendarWeekRule myCWR = myCI.DateTimeFormat.CalendarWeekRule;
            DayOfWeek myFirstDOW = myCI.DateTimeFormat.FirstDayOfWeek;

            return myCal.GetWeekOfYear(time, myCWR, myFirstDOW);
        }

        public static DateTime ConvertToTime(string time)
        {
            string[] timesplit = time.Split('/');
            return new DateTime(Convert.ToInt32(timesplit[2]), Convert.ToInt32(timesplit[1]), Convert.ToInt32(timesplit[0]));
        }
    }
}