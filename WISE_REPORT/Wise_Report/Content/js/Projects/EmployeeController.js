app.controller('EmployeeCtrl', ['$scope', '$http', '$timeout', function($scope, $http, $timeout){
    'use strict';

    var API_ROOT = origin + '/api/Api_EmployeeController';

    /=== Employee List scope ===*/
    $scope.listEmployee = [];
    $scope.employeeTotalData = 0;
    $scope.employeeListLoading = false;
    $scope.employeeListError = null;
    
    $scope.employeeListQuery = {
        SearchKeyword: '',
        PageIndex: 1,
        PageSize: 20,
        SortColumn: 'FULLNAME',
        SortDirection: 1
    };

    /=== Employee Detail scope ===*/
    $scope.employeeDetail = null;
    $scope.employeeDetailLoading = false;
    $scope.employeeDetailError = null;


    $scope.genderOptions = [
        {
            Value : '0',
            Text : 'Nam'
        },
        {
            Value : '1',
            Text : 'Nữ'
        },
        {
            Value : '2',
            Text : 'Khác'
        }
    ];

    $scope.statusOptions = [
        {
            Value : '0',
            Text : 'Đang chờ duyệt'
        },
        {
            Value : '1',
            Text: 'Đã duyệt'
        },
        {
            Value : '2',
            Text: 'Bị từ chối'
        }
    ];


    /=== Validation State ===*/
    function createValidationState(){
        return {
            summary: [],
            EmployeeCode: [],
            FullName: [],
            Email: [],
            PhoneNumber: [],
            Address: [],
            Gender: [],
            ModerationStatus: [],
        }
    }

    $scope.addEmployeeValidation = createValidationState();
    $scope.editEmployeeValidation = createValidationState();

    function resetAngularForm(form){
        if(!form)
        {
            return;
        }

        form.$setPristine();
        form.$setUntouched();
    }

    function getResponseMessage(response, fallback){
        if(response && response.data && angular.isString(response.data.Message) && response.data.Message.length > 0){
            return response.data.Message;
        }
        if(response && angular.isString(response.data)){
            return response.data;
        }
        return fallback;
    }

    function showSuccessToast(message){
        if(window.toastr && angular.isFunction(window.toastr.success)){
            window.toastr.success(message);
            return;
        }

        window.alert(message);
    }

    function showErrorToast(message){
        if(window.toastr && angular.isFunction(window.toastr.error)){
            window.toastr.error(message);
            return;
        }

        window.alert(message);
    }

    function collectServerValidationErrors(response, validationState){
        var modelState = response && response.data && response.data.ModelState;

        if(!modelState){
            var message = getResponseMessage(response, null);
            
            if(message){
                validationState.summary.push(message);
            }

            return;
        }

        angular.forEach(modelState, function(messages, serverKey){
            var keyParts = serverKey.split('.');

            var fieldName = keyParts[keyParts.length - 1];

            var target = validationState[fieldName] || validationState.summary;

            angular.forEach(messages || [], function(message){
                target.push(message);
            });
        });

    }

    function normalizePageResponse(response){
        var responseData = response && response.data ? response.data : {};

        return{
            Data: angular.isArray(responseData.Data) ? responseData.Data : [],
            TotalData: angular.isNumber(responseData.TotalData) ? responseData.TotalData : 0
        };
    }

    function toggleSort(sortColumn){
        if($scope.employeeListQuery.SortColumn === sortColumn){
            $scope.employeeListQuery.SortDirection = $scope.employeeListQuery.SortDirection === 1 ? 2 : 1;

        }else{
            $scope.employeeListQuery.SortColumn = sortColumn;
            $scope.employeeListQuery.SortDirection = 1;
        }

        $scope.employeeListQuery.PageIndex = 1;
        $scope.GetListEmployee();
    }

    $scope.ToggleEmployeeCodeSort = function(){
        toggleSort('EMPLOYEECODE');
    }

    $scope.ToggleFullNameSort = function(){
        toggleSort('FULLNAME');
    }

    $scope.ToggleEmailSort = function(){
        toggleSort('EMAIL');
    }

    $scope.ToggleCreatedAtSort = function(){
        toggleSort('CREATEDAT');
    }

    $scope.GetListEmployee = function(){
        $scope.employeeListLoading = true;
        $scope.employeeListError = null;

        var query = angular.copy($scope.employeeListQuery);

        return $http.post(API_ROOT + '/GetListEmployee', query)
            .then(function(response){
                var page = normalizePageResponse(response);
                $scope.listEmployee = page.Data;
                $scope.employeeTotalData = page.TotalData;
            }, function(response){
                $scope.listEmployee = [];
                $scope.employeeTotalData = 0;

                $scope.employeeListError = getResponseMessage(response, 'Không thể tải danh sách nhân viên');
            })
            .finally(function(){
                $scope.employeeListLoading = false;
            });
    }

    $scope.searchEmployee = function(){
        $scope.employeeListQuery.PageIndex = 1;
        $scope.GetListEmployee();
    }

    $scope.GetEmployeePageCount = function(){
        var pageSize = Number($scope.employeeListQuery.PageSize);

        if(!pageSize || pageSize <=0){
            return 1;
        }

        return Math.max(1, Math.ceil($scope.employeeTotalData / pageSize));
    }
    
    $scope.PreviousEmployeePage = function(){
        if($scope.employeeListQuery.PageIndex <=1){
            return;
        }
        $scope.employeeListQuery.PageIndex--;
        $scope.GetListEmployee();
    }

    $scope.NextEmployeePage = function(){
        if($scope.employeeListQuery.PageIndex >= $scope.GetEmployeePageCount()){
            return;
        }
        $scope.employeeListQuery.PageIndex++;
        $scope.GetListEmployee();
    }

    $scope.GetGenderText = function(gender){
        switch(gender){
            case 0:
                return 'Nam';
            case 1:
                return 'Nữ';
            case 2:
                return 'Khác';
            default:
                return 'Không xác định';
        }
    }

    $scope.GetStatusText = function(status){
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

    $scope.OpenAddEmloyee = function(){
        $scope.addEmployeeValidation = createValidationState();

        $scope.newEmployee = {
            'EmployeeCode': '',
            'FullName': '',
            'Email': '',
            'PhoneNumber': '',
            'Address': '',
            'Gender': 0,
            'ModerationStatus': 1
        };

        $('#addEmployeeModal').modal('show');

        $timeout(function(){
            resetAngularForm($scope.addEmployeeForm);
        })
    }

    $scope.AddEmployee = function(form){
        $scope.addEmployeeValidation = createValidationState();

        if(form && form.$invalid){
            form.$setSubmitted();
            return;
        }

        var data = angular.copy($scope.newEmployee);

        return $http.post(API_ROOT + '/AddEmployee', data)
            .then(function(response){
                showSuccessToast(getResponseMessage(response, 'Thêm nhân viên thành công'));
                $('#addEmployeeModal').modal('hide');
                $scope.GetListEmployee();
            }, function(response){
                collectServerValidationErrors(response, $scope.addEmployeeValidation);
                showErrorToast(getResponseMessage(response, 'Không thể thêm nhân viên'));
            })
    }

    $scope.OpenEditEmployee = function(item){
        $scope.editEmployeeValidation = createValidationState();

        return $http.get(API_ROOT + '/GetEmployeeDetail', { params: { id: item.Id } })
            .then(function(response){
                $scope.employeeDetail = angular.copy(response.data);
                $('#editEmployeeModal').modal('show');
                $timeout(function(){
                    resetAngularForm($scope.editEmployeeForm);
                })
            }, function(response){
                showErrorToast(getResponseMessage(response, 'Không thể tải thông tin nhân viên'));
            })
    }

    $scope.UpdateEmployee = function(item, form){
        $scope.editEmployeeValidation = createValidationState();

        if(form && form.$invalid){
            form.$setSubmitted();
            return;
        }

        var data = {
            Id: item.Id,
            EmployeeCode: item.EmployeeCode,
            FullName: item.FullName,
            Email: item.Email,
            PhoneNumber: item.PhoneNumber,
            Address: item.Address,
            Gender: item.Gender,
            ModerationStatus: item.ModerationStatus
        }

        return $http.post(API_ROOT + '/UpdateEmployee/' + item.Id, data)
            .then(function(response){
                showSuccessToast(getResponseMessage(response, 'Cập nhật thông tin nhân viên thành công'));
                $('#editEmployeeModal').modal('hide');
                $scope.GetListEmployee();
            }, function(response){
                collectServerValidationErrors(response, $scope.editEmployeeValidation);
                showErrorToast(getResponseMessage(response, 'Không thể cập nhật thông tin nhân viên'));
        })
    }

    $scope.OpenEmployeeDetail = function(item){
        $scope.employeeDetail = null;
        $scope.employeeDetailLoading = true;
        $scope.employeeDetailError = null;

        $('#employeeDetailModal').modal('show');

        return $http.get(API_ROOT + '/GetEmployeeDetail', { params: { id: item.Id } })
            .then(function(response){
                $scope.employeeDetail = angular.copy(response.data);
            }, function(response){
                $scope.employeeDetailError = getResponseMessage(response, 'Không thể tải thông tin nhân viên');
            })
            .finally(function(){
                $scope.employeeDetailLoading = false;
            })
    }

    $scope.OpenDeleteEmployee = function(item){
        $scope.employeeToDelete = angular.copy(item);
        $scope.deleteEmployeeError = null;

        $('#deleteEmployeeModal').modal('show');
    }

    $scope.ConfirmDeleteEmployee = function(item){
        if(!$scope.employeeToDelete || $scope.deleteBusy){
            return;
        }

        $scope.deleteBusy = true;
        $scope.deleteEmployeeError = null;

        $http.post(API_ROOT + '/DeleteEmployee', { id: item.Id })
            .then(function(response){
                if(response && response.status >= 200 && response.status < 300){
                    showSuccessToast(getResponseMessage(response, 'Xóa nhân viên thành công'));
                    $('#deleteEmployeeModal').modal('hide');
                    $scope.employeeToDelete = null;
                    if($scope.listEmployee.length === 1 && $scope.employeeListQuery.PageIndex > 1){
                        $scope.employeeListQuery.PageIndex--;
                    }
                    $scope.GetListEmployee();
                }

                $scope.deleteEmployeeError = getResponseMessage(response, 'Không thể xóa nhân viên');
                showErrorToast($scope.deleteEmployeeError);
            }, function(response){
                $scope.deleteEmployeeError = getResponseMessage(response, 'Không thể xóa nhân viên');
                showErrorToast($scope.deleteEmployeeError);
            })
            .finally(function(){
                $scope.deleteBusy = false;
            })
    }

    $scope.GetListEmployee();
}])