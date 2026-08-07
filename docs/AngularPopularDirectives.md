### Một số directives phổ biến
## ng-app
ý nghĩa: xác định phạm vi của 1 angular application trên DOM tree, trong phạm vi DOM tree được bao bởi ng-app, toàn bộ dependencies, controllers, services, directives của ng-app đó sẽ available
ví dụ:
```
<body ng-app="myApp">

    <div class="container-scroller" ng-controller="ProjectsCtrl">

```
như ở ví dụ trên: myApp là 1 angular application, trong phạm vi của  <div ng-app="myApp"> toàn bộ các dependencies đã được cấu hình, đăng ký với app này đều có thể được truy cập, ví dụ ở đang truy cập UserController, đây là 1 controller đã được đăng ký với myApp bằng câu lệnh sau:
```
app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {
```

## ng-controller
ý nghĩa: xác định phạm vi của 1 controller trong DOM tree, vì mỗi controller có 1 scope đi kèm nên toàn bộ model trong controller scope sẽ có sẵn trong phạm vi của controller
ví dụ:
```
<body ng-app="myApp">

    <div class="container-scroller" ng-controller="ProjectsCtrl">

```
như ở ví dụ trên khi angular compiler đọc đến dòng  <div ng-controller="ProjectsCtrl"> nó sẽ tìm đến controller constructor được đăng ký trong và khởi chạy constructor:
```
app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {

    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    $scope.a = 1 
    $scope.newUser = ''
    $scope.newName = ''
    $scope.newPassword = ''
    $scope.sua = false
    $scope.tukhoa1 = ''
```
đồng thời DI sẽ truyền đầy đủ các tham số cần thiết để khởi tạo ProjectsCtrl controller như ở trên là 4 tham số $scope, $http, $interval, ajaxService, 3 tham số sau đều đã được đăng ký với DI container của myApp còn $scope chính là scope riêng của ProjectsCtrl được angular khởi tạo và truyền vào. Sau đó trong controller constructor sẽ khai báo, gán các giá trị ban đầu cho các state vả behavior trong scope của controller:
```
    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    $scope.a = 1 
    $scope.newUser = ''
    $scope.newName = ''
    $scope.newPassword = ''
    $scope.sua = false
    $scope.tukhoa1 = ''

       $scope.GetListUser = function () {
        var data = {
            SearchKeyword: "",
            PageIndex: 1,
            PageSize:20,
            SortColumn: "USERNAME",
            SortDirection: "ASC"
        }
        $http.post(origin + '/api/Api_UserController/GetListUser', data).then(function (response) {
            console.log(response)
            console.log(response.data.Data)
            $scope.listUser = response.data.Data;
            //console.log(response.data)
        });
    }
```
kết thúc constructor function ta có một controller scope được khởi tạo với các state và behavior cần thiết


## ng-click
directive này là cách mà angular xử lý sự kiện click trên 1 element:
```
<button class="btn btn-success" ng-click="OpenAdd()">Thêm</button>
```
cụ thể directive này sẽ đăng ký một event listener cho sự kiện click trên button, ở đây event listener đó là 1 function trong scope hiện tại. Lưu ý ở đây không sử dụng onClick vì hàm OpenAdd() đang nằm trong 1 angular scope nó không nằm trong browser context hay global context nên browser có thể không tìm thấy hàm này.
Tóm lại ng-click bắt sự kiện click và xử lý nó bằng code trong 1 angular scope

## ng-model
ý nghĩa chính của directive này là tạo ra cơ chế two ways binding giữa giao diện và scope, từ đó khi giá trị ở giao diện thay đổi thì giá trị được bind trong scope cũng thay đổi theo và ngược lại:
```
<input class="form-control"
                            ng-model="newUser.UserName">
```
angular sẽ đăng ký các event listener có thể làm thay đổi giá trị của input này từ giao diện, và khi các event đó xảy ra, giá trị tương ứng trong scope(newUser.UserName) sẽ nhận thay đổi tương ứng, ngược lại khi model tương ứng được thay đổi trong scope giá trị tương ứng mới cũng sẽ hiển thị trên giao diện 

## ng-repeat
directive này sẽ chạy một vòng lặp trên collection được truyền vào, với lần lặp phần DOM bên trong sẽ được lặp lại, nhưng mỗi lần lặp sẽ được tạo 1 scope mới và tạo sẵn item hiện tại trong scope đó.
```
  <tr ng-repeat="item in listUser">
                        <td>{{item.UserName}}</td>
                        <td>{{item.CreatedAt | date:'dd/MM/yyyy'}}</td>
                        <td>{{GetStatusText(item.Status)}}</td>
                        <td>
                            <button class="btn btn-warning"
                                    ng-click="OpenEdit(item)">
                                Sửa
                            </button>
                            <button class="btn btn-danger"
                                    ng-click="DeleteUser(item)">
                                Xóa
                            </button>
                        </td>
                    </tr>
```
như ở ví dụ trên, phần giao diện bên trong tr sẽ được lặp lại với mỗi giá trị item trong listUser, nếu listUser thì phần giao diện được render sẽ kiểu:
```
  <tr ng-repeat="item in listUser">
                        <td>{{item[0].UserName}}</td>
                        <td>{{item[0].CreatedAt | date:'dd/MM/yyyy'}}</td>
                        <td>{{GetStatusText(item[0].Status)}}</td>
                        <td>
                            <button class="btn btn-warning"
                                    ng-click="OpenEdit(item[0])">
                                Sửa
                            </button>
                            <button class="btn btn-danger"
                                    ng-click="DeleteUser(item[0])">
                                Xóa
                            </button>
                        </td>

                        <td>{{item[1].UserName}}</td>
                        <td>{{item[1].CreatedAt | date:'dd/MM/yyyy'}}</td>
                        <td>{{GetStatusText(item[1].Status)}}</td>
                        <td>
                            <button class="btn btn-warning"
                                    ng-click="OpenEdit(item[1])">
                                Sửa
                            </button>
                            <button class="btn btn-danger"
                                    ng-click="DeleteUser(item[1])">
                                Xóa
                            </button>
                        </td>

    </tr>
```
đồng thời ng-repeat sẽ tạo 1 cơ chế binding giữa collection trong scope và phần giao diện được render, khi phần collection trong scope có thay đổi ví dụ thêm/sửa/xoá 1 hay nhiều phần tử thì phần giao diện sẽ render thay đổi tương ứng