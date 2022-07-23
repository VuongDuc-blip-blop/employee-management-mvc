/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
    // config.uiColor = '#AADC6E';
    config.language = 'en';
    config.filebrowserBrowseUrl = "/Content/download/plugins/ckfinder/ckfinder.html";
    config.filebrowserImageUrl = "/Content/download/plugins/ckfinder/ckfinder.html?type=Images";
    config.filebrowserFlashUrl = "/Content/download/plugins/ckfinder/ckfinder.html?type=Flash";
    config.filebrowserUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Files&responseType=json";
    config.filebrowserImageUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images&responseType=json";
    config.filebrowserFlashUploadUrl = "/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Flash";
    config.extraPlugins = 'uploadimage';
    config.extraPlugins = 'filetools';
    config.openlink_enableReadOnly = true;
    config.openlink_target = '_blank';
    config.extraPlugins = 'openlink';
   // config.extraPlugins = 'imageuploader';
   // config.uploadUrl = '/Content/download/plugins/ckfinder/core/connector/aspx/connector.aspx?command=QuickUpload&type=Images&responseType=json';


};

