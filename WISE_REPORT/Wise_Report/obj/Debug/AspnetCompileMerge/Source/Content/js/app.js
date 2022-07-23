
var app = angular.module('myApp', []);

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

function ErrorSystem(errorString) {
    new PNotify({
        title: 'Thất bại',
        text: errorString,
        addclass: 'bg-danger',
        delay: 1000
    });
}

function SuccessSystem(errorString) {
    new PNotify({
        title: 'Thành Công',
        text: errorString,
        addclass: 'bg-primary',
        delay: 1000
    });
}

function ThongBao(errorString) {
    new PNotify({
        title: '',
        text: errorString,
        addclass: 'bg-primary',
        delay: 1000
    });
}

