using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wise_Report.Shared.Contracts
{
    public sealed class ApiEnvelope<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public IReadOnlyCollection<string> Errors { get; set; }

        public static ApiEnvelope<T> Ok(T data, string message)
        {
            return new ApiEnvelope<T>
            {
                Success = true,
                Data = data,
                Message = message,
                Errors = new string[0]
            };
        }

        public static ApiEnvelope<T> Fail(string message, IEnumerable<string> errors)
        {
            return new ApiEnvelope<T>
            {
                Success = false,
                Data = default(T),
                Message = message,
                Errors = (errors ?? Enumerable.Empty<string>()).ToArray()
            };
        }
    }
}