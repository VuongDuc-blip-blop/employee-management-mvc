app.directive('ckeditor', function(){
    return{
        restrict: 'A',
        require: 'ngModel',

        link: function(scope, element, attrs, ngModel){
            var editor = CKEDITOR.replace(element[0],{
                height: 180,

                toolbar:[
                    [
                        'Bold',
                        'Italic',
                        'Underline',
                        '-',
                        'NumberedList',
                        'BulletedList',
                        '-',
                        'Link',
                        'Unlink'
                    ],
                    [
                        'FontSize',
                        'TextColor',
                        'BGColor',
                    ]
                ]
            });

            editor.on('instanceReady', function () {
                ngModel.$render();
            });

            editor.on('change', function () {
                scope.$evalAsync(function () {
                    ngModel.$setViewValue(editor.getData());
                });
            });

            editor.on('blur', function () {
                scope.$evalAsync(function () {
                    ngModel.$setTouched();
                });
            });

            ngModel.$render = function () {
                if (editor.status !== 'ready') {
                    return;
                }

                var value = ngModel.$viewValue || '';

                if (editor.getData() !== value) {
                    editor.setData(value);
                }
            };

            scope.$on('$destroy', function () {
                if (editor) {
                    editor.destroy(false);
                }
            });
        }
    }
})