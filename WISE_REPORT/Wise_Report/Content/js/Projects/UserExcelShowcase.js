(function (window, angular){
    'use strict';

    app.factory('userExcelShowcase',['$http','$q', function($http, $q){
        function statusText(status){
            switch(status){
                case 0:
                    return 'Đang chờ duyệt';
                case 1:
                    return 'Đã duyệt';
                case 2:
                    return 'Bị từ chối';
                default:
                    return 'Không xác định';
            }
        }

            function formatDate(value){
                if(!value){
                    return '';
                }

                var date = new Date(value);
                if(isNaN(date.getTime())){
                    return '';
                }

                return date.getFullYear()
                    + '-' + ('0' + (date.getMonth() + 1)).slice(-2)
                    + '-' + ('0' + date.getDate()).slice(-2)
                    + ' ' + ('0' + date.getHours()).slice(-2)
                    + ':' + ('0' + date.getMinutes()).slice(-2)
                    + ':' + ('0' + date.getSeconds()).slice(-2);
            }

            function neutralizeFormula(value){
                var text = value === null || value === undefined ? '' : String(value);
                return /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
            }

            function escapeHtml(value){
                return neutralizeFormula(value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            }

            function rows(items){
                return (items || []).map(function(item){
                    return{
                        Id: String(item.Id || ''),
                        UserName: neutralizeFormula(item.UserName),
                        CreatedAt: formatDate(item.CreatedAt),
                        ModerationStatus: statusText(item.ModerationStatus)
                    };
                });
            }

            function requireRows(items){
                var result = rows(items);
                if(result.length === 0){
                    throw new Error('Không có dữ liệu trên trang hiện tại để xuất.');
                }
                return result;
            }

            function tableHtml(data){
                var html = '<table border="1"><thead><tr>'
                    + '<th>Id</th><th>Tên người dùng</th><th>Ngày tạo</th><th>Trạng thái</th>'
                    + '</tr></thead><tbody>';
                data.forEach(function(row){
                    html += '<tr><td>' + escapeHtml(row.Id)
                        + '</td><td>' + escapeHtml(row.UserName)
                        + '</td><td>' + escapeHtml(row.CreatedAt)
                        + '</td><td>' + escapeHtml(row.ModerationStatus)
                        + '</td></tr>';
                });
                return html + '</tbody></table>';
            }

            function download(blob, filename){
                var url = window.URL.createObjectURL(blob);
                var link = window.document.createElement('a');
                link.href = url;
                link.download = filename;
                window.document.body.appendChild(link);
                link.click();
                window.document.body.removeChild(link);
                window.setTimeout(function(){
                    window.URL.revokeObjectURL(url);
                },0);
            }

            function timestamp(){
                var now = new Date();
                return now.getFullYear()
                    + ('0' + (now.getMonth() + 1)).slice(-2)
                    + ('0' + now.getDate()).slice(-2)
                    + '-'
                    + ('0' + now.getHours()).slice(-2)
                    + ('0' + now.getMinutes()).slice(-2)
                    + ('0' + now.getSeconds()).slice(-2);
            }

           function exportAlaSql(items) {
            var data = requireRows(items);
            var options = {
                headers: true,
                columns: [
                    { columnid: 'Id', title: 'Id', width: 42 },
                    { columnid: 'UserName', title: 'UserName', width: 32 },
                    { columnid: 'CreatedAt', title: 'CreatedAt', width: 22 },
                    { columnid: 'ModerationStatus', title: 'ModerationStatus', width: 22 }
                ]
            };
            window.alasql(
                'SELECT * INTO XLSXML("users-alasql-current.xls", ?) FROM ?',
                [options, data]);
        }

            function exportHtml(items){
                var workbook = '<html><head><meta charset="UTF-8"></head><body>'
                    + tableHtml(requireRows(items))
                    + '</body></html>';
                download(new Blob(['\ufeff', workbook], {type: 'application/vnd.ms-excel'}), 'users-client-html-' + timestamp() + '.xls');
            }

            function exportMultiSheet(items, query){
                var userSheet = tableHtml(requireRows(items));
                var criteriaSheet = '<table border="1"><tbody>'
                    + '<tr><th>Search</th><td>' + escapeHtml(query.SearchKeyword || '') 
                    + '</td></tr>'
                    + '<tr><th>Page</th><td>' + escapeHtml(query.PageIndex || '')
                    + '</td></tr>'
                    + '<tr><th>Page Size</th><td>' + escapeHtml(query.PageSize || '')
                    + '</td></tr>'
                    + '<tr><th>SortDirection</th><td>' + escapeHtml(query.SortDirection)
                    + '</td></tr>'
                    +'</tbody></table>';
                
                var boundary = '----=_WiseReport_UserExport';
                var workbookPart = '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
                + 'xmlns:x="urn:schemas-microsoft-com:office:excel" '
                + 'xmlns="http://www.w3.org/TR/REC-html40"><head>'
                + '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">'
                + '<link rel="File-List" href="filelist.xml">'
                + '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets>'
                + '<x:ExcelWorksheet><x:Name>Users</x:Name>'
                + '<x:WorksheetSource HRef="Users.htm"/></x:ExcelWorksheet>'
                + '<x:ExcelWorksheet><x:Name>Criteria</x:Name>'
                + '<x:WorksheetSource HRef="Criteria.htm"/></x:ExcelWorksheet>'
                + '</x:ExcelWorksheets><x:ActiveSheet>0</x:ActiveSheet>'
                + '</x:ExcelWorkbook></xml><![endif]--></head>'
                + '<frameset><frame src="Users.htm" name="frSheet">'
                + '<noframes><body>Excel workbook</body></noframes>'
                + '</frameset></html>';

                 var fileListPart = '<xml xmlns:o="urn:schemas-microsoft-com:office:office">'
                + '<o:MainFile HRef="../Workbook.htm"/>'
                + '<o:File HRef="Users.htm"/>'
                + '<o:File HRef="Criteria.htm"/>'
                + '<o:File HRef="filelist.xml"/>'
                + '</xml>';

                var workbook = 'MIME-Version: 1.0\r\n'
                + 'Content-Type: multipart/related; boundary="' + boundary + '"\r\n\r\n'
                + '--' + boundary + '\r\nContent-Location: Workbook.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + workbookPart + '\r\n'
                + '--' + boundary + '\r\nContent-Location: Users.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + '<html><body>' + userSheet + '</body></html>\r\n'
                + '--' + boundary + '\r\nContent-Location: Criteria.htm\r\n'
                + 'Content-Type: text/html; charset=utf-8\r\n\r\n'
                + '<html><body>' + criteriaSheet + '</body></html>\r\n'
                + '--' + boundary + '\r\nContent-Location: filelist.xml\r\n'
                + 'Content-Type: text/xml; charset=utf-8\r\n\r\n'
                + fileListPart + '\r\n'
                + '--' + boundary + '--';

                download(
                    new Blob([workbook], { type: 'application/vnd.ms-excel' }),
                    'users-client-multisheet-' + timestamp() + '.xls');

            }

            function serverExport(format, query){
                var isXlsx = format === 'Xlsx';
                return $http.get('/UserExport/'+ format, {
                    params:{
                        search: query.SearchKeyword || '',
                        sortDirection: query.SortDirection,
                    },
                    responseType: 'arraybuffer'
                }).then(function(response){
                    var contentType = response.headers('Content-Type') ||
                        (isXlsx
                            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                            : 'application/vnd.ms-excel');
                    var extension = isXlsx ? '.xlsx' : '.xls';
                    download(
                        new Blob([response.data], { type: contentType }),
                        'users-server-' + format.toLowerCase() + '-' + timestamp() + extension);
                }, function(response){
                    if(response.status === 401){
                        return $q.reject('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
                    }
                    if(response.status === 413){
                        return $q.reject('Dữ liệu quá lớn để xuất. Vui lòng giảm số lượng bản ghi và thử lại.');
                    }

                    return $q.reject('Có lỗi xảy ra khi xuất dữ liệu từ máy chủ. Vui lòng thử lại sau.');
                })
            }

             return {
                alaSqlCurrentPage: exportAlaSql,
                htmlCurrentPage: exportHtml,
                multiSheetCurrentPage: exportMultiSheet,
                serverHtmlAllFiltered: function (query) {
                    return serverExport('HtmlXlsx', query);
                },
                serverEpplusAllFiltered: function (query) {
                    return serverExport('Xlsx', query);
                }
        };
    }]);
})(window, window.angular);