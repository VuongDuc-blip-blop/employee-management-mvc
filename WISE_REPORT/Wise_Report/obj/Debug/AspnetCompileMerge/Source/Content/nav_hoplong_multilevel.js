$(function () {
    /**
    * NAME: Bootstrap 3 Multi-Level by Johne
    * This script will active Triple level multi drop-down menus in Bootstrap 3.*
    */
    $('li.dropdown-submenu').on('click', function (event) {
        event.stopPropagation();
        if ($(this).hasClass('open')) {
            $(this).removeClass('open');
        } else {
            $('li.dropdown-submenu').removeClass('open');
            $(this).addClass('open');
        }
    });
});