
    app.directive("datepicker", function () {
        return {
            restrict: "A",
            scope: false,
            require: "ngModel",
            link: function (scope, elem, attrs, ngModelCtrl) {
                var updateModel = function (date) {
                    scope.$apply(function () {
                        ngModelCtrl.$setViewValue(date);
                    });
                };
                var options = {
                    onSelect: function (dateText) {
                        updateModel(dateText);
                    }
                };
                elem.datetimepicker({
                    format: 'DD/MM/YYYY',
                    widgetPositioning: {
                        horizontal: 'right',
                        vertical: 'bottom'
                    }
                }).on('dp.change', function (data) {
                    updateModel(data.date);
                });
            }
        }
    });
