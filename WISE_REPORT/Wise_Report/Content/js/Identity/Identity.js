(function(window, angular)
{
    'use strict';

    function registerIdentity(module){
        module.factory('identityClient', ['$http', '$q','$window', function($http, $q, $window){
            function antiForgeryToken(){
                var input = window.document.querySelector('input[name="__RequestVerificationToken"]');
                return input ? input.value : null;
            }

            function formEncode(values){
                return Object.keys(values).map(function(key){
                    var value = values[key] === null || values[key] === undefined ? '' : values[key];
                    return encodeURIComponent(key) + '=' + encodeURIComponent(value);
                }).join('&');
            }

            function post(url, model) {
                var payload = angular.extend({}, model, {
                    __RequestVerificationToken: antiForgeryToken()
                });

                return $http({
                    method: 'POST',
                    url: url,
                    data: formEncode(payload),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    transformRequest: angular.identity
                });
            }

            function errors(response, fallback){
                var data = response && response.data ? response.data : {};
                if(angular.isArray(data.Errors) && data.Errors.length > 0){
                    return data.Errors;
                }
                return [fallback];
            }

            function redirect(url){
                $window.location.assign(url);
            }

            return{
                post: post,
                errors: errors,
                redirect: redirect,
                reject: $q.reject
            };
        }]);

        module.controller('LoginCtrl',['identityClient', function(identityClient){
            var vm = this;
            vm.form = {UserName: '', Password: ''};
            vm.errors = [];
            vm.busy = false;

            vm.submit = function(){
                if(vm.busy) return;

                vm.busy = true;
                vm.errors = [];
                identityClient.post('/Home/Login', vm.form)
                    .then(function(response){
                        identityClient.redirect(response.data.RedirectUrl || '/Home/HomeLayout');
                    }, function(response){
                        vm.errors = identityClient.errors(response, 'Không thể đăng nhập. Vui lòng thử lại.');
                    }).finally(function(){
                        vm.busy = false;
                        vm.form.Password = '';
                    });
            };
        }]);

        module.controller('ChangePasswordCtrl',['identityClient', function(identityClient){
            var vm = this;
            vm.form = {CurrentPassword: '', NewPassword: '', ConfirmNewPassword: ''};
            vm.errors = [];
            vm.busy = false;

            vm.submit = function(){
                if(vm.busy) return;

                vm.busy = true;
                vm.errors = [];

                identityClient.post('/Home/ChangePassword', vm.form)
                    .then(function(response){
                        identityClient.redirect(response.data.RedirectUrl || '/Home/HomeLayout');
                    },function(response){
                        vm.errors = identityClient.errors(response, 'Không thể đổi mật khẩu. Vui lòng thử lại.');
                    }).finally(function(){
                        vm.busy = false;
                        vm.form.CurrentPassword = '';
                        vm.form.NewPassword = '';
                        vm.form.ConfirmNewPassword = '';
                    });
            };
        }]);

        module.controller('SessionIdentityCtrl',['identityClient', function(identityClient){
            var vm = this;
            vm.errors = [];

            vm.logout = function(){
                identityClient.post('/Home/Logout', {})
                    .then(function(response){
                        identityClient.redirect(response.data.RedirectUrl || '/Home/HomeLayout');
                    },
                function(response){
                    vm.errors = identityClient.errors(response, 'Không thể đăng xuất. Vui lòng thử lại.');
                });
            };
        }]);
    }

    registerIdentity(angular.module('identityApp', []));
    if(window.app){
        registerIdentity(window.app);
    }
}

)(window, window.angular);