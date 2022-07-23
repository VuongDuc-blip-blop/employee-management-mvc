
var app = angular.module('myApp', ['angular.filter',  'ngIdle', 'ngMask', 'ngRoute', 'ngAnimate',   'debounce', 'ui.router',  'ngFileUpload']);
var origin = '';

app.controller('imgCtrl', function ($scope) {
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#blah').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    function read_editURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#edit_img').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $("#imgInp").change(function () {
        readURL(this);
    });
    $("#imgEdit").change(function () {
        read_editURL(this);
    });
});

var chart_fontFamily = 'Arial'
var tooltip_title_fontSize = 12;
var tooltip_caption_fontWeight = 'bold'
var tooltip_title_fontWeight = 'bold'
var title_fonSize_2 = 12
var axis_fonSize_2 = 12
var tooltip_title_fontSize_2 = 12
var tooltip_title_fontWeight_2 = 'bold'
var sSTD_backgroundr = 'blue'
var tooltip_legent_circle_fontSize_2 = 12
var tooltip_legend_circle_lineHeght_2 = 12
var tooltip_legent_Symbol_line = 1
var tooltip_fontSize_2 = 14
var label_fontSize = 14

var color_code_current_state_00 = "#6d6e71"
var color_code_current_state_30 = "#EB1C24"
var color_code_current_state_20 = "#f8ec3a"
var color_code_current_state_10 = "#00C109"
var color_code_current_state_40 = "#0000FF"
var color_code_current_state_50 = "#FFA500"

var name_current_state_00 = "OFF"
var name_current_state_30 = "WAIT"
var name_current_state_20 = "ERROR"
var name_current_state_10 = "RUN"
app.$inject = ['$scope'];
app.directive('format', ['$filter', function ($filter) {
    return {
        require: '?ngModel',
        link: function (scope, elem, attrs, ctrl) {
            if (!ctrl) return;


            ctrl.$formatters.unshift(function (a) {
                return $filter(attrs.format)(ctrl.$modelValue)
            });


            ctrl.$parsers.unshift(function (viewValue) {
                var plainNumber = viewValue.replace(/[^\d|\-+|\.+]/g, '');
                elem.val($filter(attrs.format)(plainNumber));
                return plainNumber;
            });
        }
    };
}]);

//app.config(configFunction);

app.config(['$compileProvider', function ($compileProvider) {
    $compileProvider.debugInfoEnabled(false);
}]);
app.directive('date', function (dateFilter) {
    return {
        require: 'ngModel',
        link: function (scope, elm, attrs, ctrl) {

            var dateFormat = attrs['date'] || 'dd/MM/yyyy';

            ctrl.$formatters.unshift(function (modelValue) {
                return dateFilter(modelValue, dateFormat);
            });
        }
    };
})
app.config(['$compileProvider', function ($compileProvider) {
    // ...
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
}]);
function ErrorSystem(errorString) {
    new PNotify({
        title: 'Thất bại',
        text: errorString,
        addclass: 'bg-danger',
        delay: 5000
    });
}

function SuccessSystem(errorString) {
    new PNotify({
        title: 'Thành Công',
        text: errorString,
        addclass: 'bg-primary',
        delay: 5000
    });
}

function ThongBao(errorString) {
    new PNotify({
        title: '',
        text: errorString,
        addclass: 'bg-primary',
        delay: 5000
    });
}

app.filter('unsafe', function ($sce) {
    return function (value) {
        return $sce.trustAsHtml(value);
    };
});

