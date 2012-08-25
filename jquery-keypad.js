/*****************************
JQuery KeyPad Plugin
By: vacatola
Date: August 22, 2012
*****************************/
(function ($) {
    var methods = {
        init: function (options) {
            return this.each(function () {

                var $this = $(this),
                 data = $this.data('jqKeyPad'),
                 jqKeyPad = $('<div />', {
                     text: $this.attr('title')
                 });

                // If the plugin hasn't been initialized yet
                if (!data) {
                    $(this).data('jqKeyPad', {
                        target: $this,
                        jqKeyPad: jqKeyPad
                    });

                    options = $.extend({
                        mode: 'numeric',
                        precision: 2,
                        initialKeyPad: null,
                        onButtonCommand: null //method({buttonfunc, arg})
                    }, options);

                    var modeAttribute = $this.attr('mode');
                    if (modeAttribute == 'numeric' || modeAttribute == 'alphanumeric') {
                        options.mode = modeAttribute;
                    }

                    if (options.mode == 'numeric') {
                        var precisionAttribute = parseInt($this.attr('precision'));
                        if (!isNaN(precisionAttribute) && precisionAttribute > 0) {
                            options.precision = precisionAttribute;
                        }
                    }


                    var initialKeyPad = $this.attr('initialKeyPad');
                    if (initialKeyPad != null && initialKeyPad != "") {
                        options.initialKeyPad = initialKeyPad;
                    }
                    if (options.initialKeyPad == '' || options.initialKeyPad === undefined) {
                        //show first keypad/ul
                        var lists = $(this).children('ul').hide();
                        var lists = $(this).children('ul')[0].show();
                    }
                    else {
                        //show the keypad with this name
                        var listFound = false;

                        $(this).children('ul').each(function () {
                            var ulKeyPadName = $(this).attr('KeyPadName');
                            if (ulKeyPadName == options.initialKeyPad) {
                                $(this).show();
                                listFound = true;
                            }
                            else {
                                $(this).hide();
                            }
                        });

                        if (listFound == false) {
                            var lists = $(this).children('ul')[0].show();
                        }
                    }

                    $this.data('options', options);

                    //set the value if preloaded
                    if ($this.children('#txtEnteredValue').val() != '') {
                        $this.data('currentValue', $this.children('#txtEnteredValue').val())
                        $this.children('div.KeyPadValue').html($this.data('currentValue'));
                    }

                    //numeric button click
                    $(this).children('ul').children('li').bind('click.jqKeyPad', function () {
                        var continueValueProcessing = true;
                        if (options.onButtonCommand != null) {
                            var cmd = $(this).attr('commandName');
                            //if the commandName doesnt exist then don't call onButtonCommand
                            var isFunc = true;
                            if (cmd === undefined) {
                                isFunc = false;
                            }
                            if (isFunc == true) {
                                //call callback method defined in options
                                var args = $(this).attr('commandArgument');
                                var val = $(this).attr('value');

                                var result = options.onButtonCommand({ command: cmd, argument: args, value: val });
                                if (result == false) {
                                    continueValueProcessing = false;
                                }
                            }
                        }

                        //handle button press
                        if (continueValueProcessing == true) {
                            if (options.mode == 'numeric') {
                                //numeric mode
                                var value = String($(this).attr('val'));
                                if (value != null && !(value === "undefined")) {
                                    var newChar = value;
                                    var currentValue = $this.data('currentValue');

                                    if (currentValue == null) {
                                        //initialize the current value
                                        currentValue = newChar;
                                    }
                                    else if (newChar == '.') {
                                        currentValue = currentValue.toString();
                                        if (currentValue.indexOf(newChar) == -1) {
                                            //append decimal to end
                                            currentValue = currentValue + newChar;
                                        }
                                    }
                                    else {
                                        currentValue = currentValue.toString();
                                        //append number, precision 2 only
                                        if (currentValue.indexOf('.') == -1) {
                                            currentValue = currentValue + newChar;
                                        }
                                        else {
                                            //only add character if there is not yet two decimals added
                                            //TODO: variable precision 
                                            var indexOfDecimal = currentValue.indexOf('.');
                                            var precisionOnly = currentValue.substring(indexOfDecimal);
                                            alert(options.precision);
                                            if (precisionOnly.length <= options.precision) {
                                                currentValue = currentValue + newChar;
                                            }
                                        }
                                    }

                                    $this.data('currentValue', currentValue);

                                    //show new value
                                    $this.children('div.KeyPadValue').html($this.data('currentValue'));
                                    $this.children('#txtEnteredValue').val($this.data('currentValue'));
                                }
                            }
                            else {
                                //regular alphanumeric keyboard
                                var value = String($(this).attr('val'));
                                if (value != null && !(value === "undefined")) {
                                    var newChar = value;
                                    var currentValue = $this.data('currentValue');

                                    if (currentValue == null) {
                                        //initialize the current value
                                        currentValue = newChar;
                                    }
                                    else {
                                        currentValue += newChar;
                                    }

                                    $this.data('currentValue', currentValue);

                                    //show new value
                                    $this.children('div.KeyPadValue').html($this.data('currentValue'));
                                    $this.children('#txtEnteredValue').val($this.data('currentValue'));
                                }
                            }
                        }
                    });

                    //reset click
                    $(this).children('ul').children('li.reset').bind('click.jqKeyPad', function () {
                        $this.data('currentValue', null);
                        //show new value
                        $this.children('div.KeyPadValue').html('');
                        $this.children('#txtEnteredValue').val('');
                    });

                    //back click
                    $(this).children('ul').children('li.back').bind('click.jqKeyPad', function () {
                        var currentValue = $this.data('currentValue');
                        if (currentValue != null && currentValue != '') {
                            currentValue = currentValue.substring(0, currentValue.length - 1);
                            $this.data('currentValue', currentValue);
                            $this.children('div.KeyPadValue').html(currentValue);
                        }
                    });

                    //document keypress, compares against values on keyboard
                    $(document).bind('keypress.jqKeyPad', function (e) {
                        var newChar = String.fromCharCode(e.keyCode ? e.keyCode : e.which);
                        //replace carriage return with a value comparable to the attribute value of \r
                        if (newChar == "\r") {
                            newChar = '\\r';
                        }
                        //if the key pressed exists in our collection of buttons, then go ahead and click the button
                        $($this).children('ul').children('li').each(function () {
                            var value = $(this).attr('val');
                            if (value != null && value == newChar) {
                                $(this).click();
                                return false;
                            }
                        });

                    });
                }
            });
        },
        destroy: function () {

            return this.each(function () {

                var $this = $(this),
                 data = $this.data('jqKeyPad');
                //unbind events in this plugin's namespace
                $(window).unbind('.jqKeyPad');
                data.jqKeyPad.remove();
                $this.removeData('jqKeyPad');

            })
        },
        GetValue: function () {
            var returnValue = $(this).data('currentValue');
            if (returnValue === undefined) {
                return '';
            }
            else {
                return returnValue;
            }
        },
        ClearValue: function () {
            //removes the existing value from the plugin's data state
            var $this = $(this);
            $this.data('currentValue', '');
            $this.children('div.KeyPadValue').html('');
        },
        ShowKeyPad: function (keyPadName) {
            //switch keypads (ul's should have attribute KeyPadName)
            var $this = $(this);
            var listFound = false;

            $this.children('ul').each(function () {
                var ulKeyPadName = $(this).attr('KeyPadName');
                if (ulKeyPadName == keyPadName) {
                    $(this).show();
                    listFound = true;
                }
                else {
                    $(this).hide();
                }
            });

            if (listFound == false) {
                var lists = $(this).children('ul')[0].show();
            }

        }
    };

    $.fn.jqKeyPad = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.jqKeyPad');
        }
    };
})(jQuery);