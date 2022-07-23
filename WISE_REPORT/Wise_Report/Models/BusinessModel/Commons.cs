using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;

namespace Wise_Report.Models.BusinessModel
{
    public class Commons
    {
        public static string MD5Hash(string input)
        {
            MD5 md5 = new MD5CryptoServiceProvider();
            Byte[] originalBytes = ASCIIEncoding.Default.GetBytes(input);
            Byte[] encodedBytes = md5.ComputeHash(originalBytes);

            var pw = BitConverter.ToString(encodedBytes).Replace("-", "");
            return pw.ToString();
        }
    }
}