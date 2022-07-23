/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
    // config.uiColor = '#AADC6E';
    config.language = 'vn';
    config.filebrowserBrowseUrl = "/Content/download/plugins/ckfinder/ckfinder.html";
    config.filebrowserImageUrl = "/Content/download/plugins/ckfinder/ckfinder.html?type=Images";
    config.filebrowserFlashUrl = "/Content/download/plugins/ckfinder/ckfinder.html?type=Flash";
    config.filebrowserUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Files&responseType=json";
    config.filebrowserImageUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images&responseType=json";
    config.filebrowserFlashUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Flash";
    config.extraPlugins = 'uploadimage';
    config.extraPlugins = 'filetools';
    config.openlink_enableReadOnly = true;
    config.floatSpacePreferRight = true;
    config.openlink_target = '_blank';
    config.extraPlugins = 'openlink';
    //config.removePlugins = 'Image,Flash,paste as plain text, preview, select all,spell checker,form,checkbox,radio button,textarea, textfield, selection field, button, hidden field, strikethrough, copy formatting, remove format, decrease indent,increase indent,unlink,insert horizontal line, insert special character, insert page break for printing,formatting stylesl,paragraph format,show blocks'
    config.removePlugins = 'showblocks';
   // config.uploadUrl = '/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images&responseType=json';


};

