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

                    //set the value if preloaded
                    if ($this.children('#txtEnteredValue').val() != '') {
                        $this.data('currentValue', $this.children('#txtEnteredValue').val())
                        $this.children('div.KeyPadValue').html($this.data('currentValue'));
                    }

                    $(this).children('ul').children('li').bind('click.jqKeyPad', function () {
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

                                    if (precisionOnly.length <= 2) {
                                        currentValue = currentValue + newChar;
                                    }
                                }
                            }

                            $this.data('currentValue', currentValue);

                            //show new value
                            $this.children('div.KeyPadValue').html($this.data('currentValue'));
                            $this.children('#txtEnteredValue').val($this.data('currentValue'));
                        }

                    });

                    $(this).children('ul').children('li.reset').bind('click.jqKeyPad', function () {
                        $this.data('currentValue', null);
                        //show new value
                        $this.children('div.KeyPadValue').html('');
                        $this.children('#txtEnteredValue').val('');
                    });

                    $(this).children('ul').children('li.back').bind('click.jqKeyPad', function () {
                        var currentValue = $this.data('currentValue');
                        if (currentValue != null && currentValue != '') {
                            currentValue = currentValue.substring(0, currentValue.length - 1);
                            $this.data('currentValue', currentValue);
                            $this.children('div.KeyPadValue').html(currentValue);
                        }
                    });

                    $(document).bind('keypress.jqKeyPad', function (e) {
                        var newChar = String.fromCharCode(e.keyCode ? e.keyCode : e.which);

                        //if the key pressed exists in our collection of buttons, then go ahead and click the button
                        //TODO: turn keypress support on/off
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
        GetValue: function () { return $(this).data('currentValue'); }
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