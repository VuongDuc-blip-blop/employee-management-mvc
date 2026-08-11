using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.Identity;

namespace Wise_Report.Models.BusinessModel
{
    public sealed class PasswordCheckResult
    {
        public PasswordCheckResult(bool succeeded, bool requiresUpgrade)
        {
            Succeeded = succeeded;
            RequiresUpgrade = requiresUpgrade;
        }

        public bool Succeeded { get; private set; }
        public bool RequiresUpgrade { get; private set; }
    }
    public static class PasswordSecurity
    {
        public static string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                throw new ArgumentException("Password is required.","password");
            }
            return new PasswordHasher().HashPassword(password);
        }

        public static PasswordCheckResult VerifyPassword(string storedPassword, string providedPassword)
        {
            if(string.IsNullOrEmpty(storedPassword) || string.IsNullOrEmpty(providedPassword))
            {
                return new PasswordCheckResult(false, false);
            }

            if (IsLegacyMd5(storedPassword))
            {
                var legacyCandidate = Commons.MD5Hash(providedPassword);
                var legacySucceeded = FixedTimeEquals(storedPassword.ToUpperInvariant(), legacyCandidate.ToUpperInvariant());
                return new PasswordCheckResult(legacySucceeded, false);
            }

            try
            {
                var result = new PasswordHasher().VerifyHashedPassword(storedPassword, providedPassword);

                return new PasswordCheckResult(result != PasswordVerificationResult.Failed, result == PasswordVerificationResult.SuccessRehashNeeded);
            }
            catch (FormatException)
            {
                return new PasswordCheckResult(false, false);
            }
            catch(ArgumentException)
            {
                return new PasswordCheckResult(false, false);
            }

        }

        private static bool IsLegacyMd5(string value)
        {
            if(value.Length != 32)
            {
                return false;
            }

            for(var index =0; index < value.Length; index++)
            {
                var character = value[index];
                var isDigit = character >= '0' && character <= '9';
                var isUpperHex = character >= 'A' && character <= 'F';
                var isLowerHex = character >= 'a' && character <= 'f';
                if(!isDigit && !isUpperHex && !isLowerHex)
                {
                    return false;
                }
            }

            return true;
        }

        private static bool FixedTimeEquals(string left, string right)
        {
            var difference = left.Length ^ right.Length;
            var length = Math.Min(left.Length, right.Length);
            for(var index = 0; index < length; index++)
            {
                difference |= left[index] ^ right[index];
            }

            return difference == 0;
        }
    }
}