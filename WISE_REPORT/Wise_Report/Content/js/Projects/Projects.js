app.controller('ProjectsCtrl', function ($scope, $http, $interval, ajaxService) {

    $scope.userid = $('#userid').val();
    $scope.today = new Date();
    $scope.a = 1 
    $scope.newUser = ''
    $scope.newName = ''
    $scope.newPassword = ''
    $scope.sua = false
    $scope.tukhoa1 = ''
    //-----=======================WORKFLOW=====================================================================================
    $scope.GetListUser = function () {
        var data = {
            tukhoa1: $scope.tukhoa1

        }
        $http.post(origin + '/api/Api_UserController/GetListUser', data).then(function (response) {
            $scope.listUser = response.data;
            //console.log(response.data)
        });
    }
    $scope.GetListUser()

    $scope.AddUser = () => {
        var data = {
            username: $scope.newUser,
            fullname: $scope.newName,
            tukhoa1: $scope.newPassword,
        }
        $http.post(origin + '/api/Api_UserController/AddUser', data).then(function (response) {
            if (response.status == 200) {
                console.log("Thành công")
            } else {
                console.log("Thất bại")
            }
        });
    }
    $scope.UpdateUser = (item) => {
        var data = {
            username: item.USERNAME,
            fullname: item.FULLNAME,
            tukhoa1: item.PASSWORD,
        }
        $http.post(origin + '/api/Api_UserController/UpdateUser/' + item.USERNAME, data).then(function (response) {
            if (response.status == 200) {
                console.log("Thành công")
                $scope.sua = false;
                $scope.GetListUser()
            } else {
                console.log("Thất bại")
            }
        });
    }
    $scope.DeleteUser = (item) => {
        if (confirm('bạn có chắc chắn muốn xóa?')) {
            $http.post(origin + '/api/Api_UserController/DeleteUser/' + item.USERNAME).then(function (response) {
                if (response.status == 200) {
                    console.log("Thành công")
                    $scope.GetListUser()
                } else {
                    console.log("Thất bại")
                }
            });
        }
        
    }
    //-----=======================END View Task=====================================================================================

})

app.directive('editInPlace', function () {
    return {
        restrict: 'E',
        scope: {
            value: '='
        },
        template: '<span  ng-bind="value"></span><input ng-model="value"></input>',
        link: function ($scope, element, attrs) {
            // Let's get a reference to the input element, as we'll want to reference it.
            var inputElement = angular.element(element.children()[1]);

            // This directive should have a set class so we can style it.
            element.addClass('edit-in-place');

            // Initially, we're not editing.
            $scope.editing = false;

            // ng-click handler to activate edit-in-place
            $scope.edit = function () {
                $scope.editing = true;

                // We control display through a class on the directive itself. See the CSS.
                element.addClass('active');

                // And we must focus the element. 
                // `angular.element()` provides a chainable array, like jQuery so to access a native DOM function, 
                // we have to reference the first element in the array.
                inputElement[0].focus();
            };

            // When we leave the input, we're done editing.
            inputElement.prop('onblur', function () {
                $scope.editing = false;
                element.removeClass('active');
            });
        }
    };
});

