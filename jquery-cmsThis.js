// based on
// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 2.0, July 8th, 2011
// by Stefan Gabos

;(function($) {

    $.cmsThis = function(el, options) {

        console.debug('el', el);

        // plugin's default options
        var defaults = {
            
            // event: triggered before saving a fragment
            beforeSave: null,

            // event: triggered after saving a fragment
            afterSave: null,

            // function: save handler
            save: null

        };

        // edit state
        var in_edit_mode = false;

        // current instance of the  object
        var plugin = this;

        // content state
        plugin.content_has_changed = false;

        // original text before any changes
        plugin.content_before_changes = null;


        plugin.settings = {};

        /** 
        *    the "constructor" method that gets called when the object is created
        *    this is a private method, it can be called only from inside the plugin
        **/
        var init = function() {

            // define a unique identifier for this fragment
                plugin.uid = 'cmsthis_' + Math.floor(Math.random() * 99999999);

            // the plugin's final properties are the merged default and
            // user-provided options (if any)
                plugin.settings = $.extend({}, defaults, options);

            // make the collection of target elements available throughout the plugin
            // by making it a public property
                plugin.el = el;

            // set edit state
                plugin.in_edit_mode = false;

            // render the editor hint
                initHint();

        };


        /**
        * Initializes the fragment hint and event handlers.
        */
        var initHint = function(){

            var $el = $(plugin.el);

            $el.addClass( 'alt_fragment_hint' );


            // on el blur, exit editing mode if no changes.
                //$(document).bind( 'click.' + plugin.uid + '_htmlClick' ,function() {
                //    if( plugin.in_edit_mode === true && !plugin.content_has_changed ){
                //        exitEditMode();
                //        initHint();
                //    }
                //});

            // on el click, enter editing mode
                $el.bind( 'click.' + plugin.uid + '_elClick', function(){
                    if( plugin.in_edit_mode === false ){
                        enterEditMode();
                    }

                    event.stopPropagation();
                });

        };


        /**
        * removes the fragment hint and event handlers.
        */
        var removeHint = function(){

            var $el = $(plugin.el);

            $el.removeClass( 'alt_fragment_hint' );

            $el.unbind( 'click.' + plugin.uid + '_elClick' );

            $el.unbind( 'click.' + plugin.uid + '_htmlClick' );

        };


        /**
        * Enter edit mode. User has selected to edit content.
        */
        var enterEditMode = function(){

            if( plugin.in_edit_mode === true ){
                return;
            }

            plugin.in_edit_mode = true;

            var $el = $(plugin.el);

            removeHint();

            $el.addClass( 'alt_fragment_editing' );

            plugin.content_before_changes = $el.html();

            $(plugin.el).attr( 'contentEditable', true );

            // signal that content has changed
                $(plugin.el).bind( 'keyup.' + plugin.uid + '_stateKeeper', function(){

                    plugin.content_has_changed = true;console.debug('checked');

                    $(this).unbind( 'keyup.' + plugin.uid + '_stateKeeper' );

                });

            renderToolbar();

        };

        /**
        * Exit edit mode. User has selected to finish editing content.
        */
        var exitEditMode = function(){

            if( plugin.in_edit_mode === false ){
                return;
            }

            if( plugin.content_has_changed ){
                saveContent();
            }

            plugin.in_edit_mode = false;

            var $el = $(plugin.el);

            $el.removeClass( 'alt_fragment_editing' );

            $(plugin.el).removeAttr( 'contentEditable' );

            destroyToolbar();

        };


        var saveContent = function(){

            var $el = $(plugin.el);

            var changed_content = $el.html(); 

        };


        var wrapAroundSelection = function( tag ){

            var $el = $(plugin.el);

            var sel, range;
            
            if (window.getSelection) {

                sel = window.getSelection();
                
                if (sel.rangeCount) {

                    range = sel.getRangeAt(0);
                    selectedText = range.toString();
                    
                    var $wrapped = $( document.createElement(tag) );
                    $wrapped.html( selectedText );

                    range.deleteContents();
                    range.insertNode( $wrapped.get(0) );

                }

            } else if (document.selection && document.selection.createRange) {

                //untested
                range = document.selection.createRange();
                selectedText = document.selection.createRange().text + "";

                var $wrapped = $( document.createElement(tag) );
                wrapped.html( selectedText );

                range.text = $('<div>').append($wrapped.clone()).remove().html();

            }

        };

        /**
        * Add a button to the toolbar.
        * 
        */
        var addToolBarButton = function( button_options ){

            var $toolbar = $( plugin.toolbar );

            // create button
            var $button = $( document.createElement('button') );

            // add icon            
            $button.attr( 'title', button_options.title );
            $button.attr( 'alt', button_options.title );
            $button.addClass( button_options.class_name );

            // set handler
            $button.click( function(){
                button_options.handler( $button );
            });

            // set position in toolbar
            switch( button_options.position.toLowerCase() ){
                case 'right':
                    $button.addClass( 'button_right' );
                break;

                default:
                    $button.addClass( 'button_left' );
            }

            // append to toolbar
            $button.appendTo( $toolbar );

        };

        var renderToolbar = function(){

            var $el = $(plugin.el);

            // create toolbar
                var toolbar = document.createElement('div');
                var $toolbar = $( toolbar );

                $toolbar.addClass( 'alt_fragment_toolbar' );

                $toolbar.appendTo( $el );

            // position toolbar
                var el_position = $el.offset();

                var toolbar_position = {
                    left: el_position.left + ( $el.outerWidth() - $toolbar.outerWidth() ),
                    top: el_position.top - $toolbar.outerHeight()
                };

                $toolbar.offset( toolbar_position );

            // reference toolbar
                plugin.toolbar = toolbar;


            // Cancel button
                addToolBarButton({
                    position: 'right', 
                    class_name: 'icon_cancel', 
                    title: 'Cancel', 
                    handler: function(button){

                        if( plugin.content_has_changed ){
                            if( !confirm('Are you sure you would like to cancel? Your changes will be lost.') ){
                                return;
                            }
                        }

                        exitEditMode();
                        initHint();

                        event.stopPropagation();

                    }
                });

            // Save button
                addToolBarButton({
                    position: 'right', 
                    class_name: 'icon_accept', 
                    title: 'Save', 
                    handler: function(button){

                        plugin.save( function( success ){

                            if(success){
                                exitEditMode();
                                initHint();
                            } else {
                                console.log('error saving.');
                            }

                        });

                        event.stopPropagation();

                    }
                });     

            // Undo button
                addToolBarButton({
                    position: 'right', 
                    class_name: 'icon_arrow_rotate_anticlockwise', 
                    title: 'Undo', 
                    handler: function(button){
                        document.execCommand('undo');
                    }
                });


            // Bold button
                /*addToolBarButton({
                    position: 'left', 
                    class_name: 'icon_text_bold', 
                    title: 'Bold', 
                    handler: function(button){
                        wrapAroundSelection('b');
                    }
                });*/       

            // Italic button
                /*addToolBarButton({
                    position: 'left', 
                    class_name: 'icon_text_italic', 
                    title: 'Bold', 
                    handler: function(button){
                        wrapAroundSelection('i');
                    }
                });*/

        };


        var destroyToolbar = function(){

            if( plugin.toolbar ){
                $(plugin.toolbar).remove();
            }

        };


        plugin.getContent = function(){

            var return_to_edit_mode = false;

            if( plugin.in_edit_mode ){
                exitEditMode();
                return_to_edit_mode = true;
            } else {
                removeHint();
            }

            var content = $(plugin.el).html();

            if( return_to_edit_mode ){
                enterEditMode();
            } else {
                initHint();
            }

            return content;

        };


        plugin.save = function( callback ){

            if( !plugin.settings.save || typeof(plugin.settings.save) != 'function' ){
                console.log('You must implement save.');
                return false;
            }

            if( typeof(callback) != 'function' ){
                console.log('callback expects a function');
                return false;
            }

            var saveHandler = $.proxy( plugin.settings.save, plugin );

            saveHandler( plugin.content_before_changes, plugin.getContent(), $.proxy(callback, plugin) );

        };


        // public methods
        // these methods can be called like:
        // plugin.methodName(arg1, arg2, ... argn) from inside the plugin or
        // myplugin.publicMethod(arg1, arg2, ... argn) from outside the plugin
        // where "myplugin" is an instance of the plugin

        // a public method. for demonstration purposes only - remove it!
        //plugin.foo_public_method = function() {

            // code goes here

        //};


        // private methods
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)
        // a private method. for demonstration purposes only - remove it!
        //var foo_private_method = function() {

            // code goes here

        //};


        // call the "constructor" method
        init();

    }

})(jQuery);