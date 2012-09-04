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


                    var specialCharMap = {
                        "8": "backspace",
                        "9": "tab",
                        "13": "enter",
                        "16": "shift",
                        "17": "ctrl",
                        "18": "alt",
                        "19": "pause/break",
                        "20": "capslock",
                        "27": "escape",
                        "32": "space",
                        "33": "pageup",
                        "34": "pagedown",
                        "35": "end",
                        "36": "home",
                        "37": "leftarrow",
                        "38": "uparrow",
                        "39": "rightarrow",
                        "40": "downarrow",
                        "45": "insert",
                        "46": "delete",
                        "91": "windowleft",
                        "92": "windowright",
                        "93": "select",
                        "144": "numlock",
                        "145": "scrolllock"
                    };
                    $this.data('specialCharMap', specialCharMap);

                    options = $.extend({
                        mode: 'numeric',
                        precision: 2,
                        keyPadToShowOnShift: null,
                        keyPadToShowOnUnshift: null,
                        initialKeyPad: null,
                        onButtonCommand: null, //method({buttonfunc, arg})
                        onSpecialKeyDown: null,
                        specialKeyCombos: null,
                        onSpecialKeyCombo: null,
                        captureDocumentKeyPress: true,
                        focusOnLoad: false,
                        pasteAllowed: true
                    }, options);

                    var modeAttribute = $this.attr('mode');
                    if (modeAttribute == 'numeric' || modeAttribute == 'alphanumeric' || modeAttribute == 'incognito') {
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

                    //displaying the first list
                    if (options.mode == 'incognito') {//we display no lists in incognito mode
                        var lists = $(this).children('ul').hide();
                    }
                    else if (options.initialKeyPad == '' || options.initialKeyPad === undefined) {
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

                    if (options.focusOnLoad == true) {
                        $('#txtEnteredValue').focus();
                    }

                    $this.data('options', options);

                    //set the value if preloaded
                    if ($this.children('#txtEnteredValue').val() != '') {
                        $this.data('currentValue', $this.children('#txtEnteredValue').val());
                    }

                    var unselector = function (element) {
                        if ($(element).is('input')==false) {
                            $(element).attr('unselectable', 'on').css('-webkit-touch-callout', 'none').css('-webkit-user-select', 'none').css('-khtml-user-select', 'none').css('-moz-user-select', 'none').css('-ms-user-select', 'none').css('user-select', 'none');
                            $(element).children().each(function () {
                                unselector($(this));
                            });
                        }
                    };

                    unselector($(this));

                    
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
                                var args = $(this).attr('commandArgument');
                                if (cmd == 'ShowPad') {
                                    $this.jqKeyPad('ShowKeyPad', args);
                                }
                                else {
                                    //call callback method defined in options
                                    var val = $(this).attr('value');

                                    var result = options.onButtonCommand({ command: cmd, argument: args, value: val });
                                    if (result == false) {
                                        continueValueProcessing = false;
                                    }
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
                                            if (precisionOnly.length <= options.precision) {
                                                currentValue = currentValue + newChar;
                                            }
                                        }
                                    }

                                    $this.data('currentValue', currentValue);

                                    //show new value
                                    $this.children('#txtEnteredValue').val($this.data('currentValue'));
                                }
                            }
                            else {
                                //regular alphanumeric keyboard
                                var value = String($(this).attr('val'));
                                var newCaretPosition = -1;
                                if (value != null && !(value === "undefined")) {
                                    var newChar = value;
                                    var currentValue = $this.data('currentValue');

                                    if (currentValue == null) {
                                        //initialize the current value
                                        currentValue = newChar;
                                    }
                                    else {
                                        var txtValue = $this.children('#txtEnteredValue').val();
                                        if (txtValue != currentValue) {
                                            currentValue = txtValue;
                                        }
                                        var begin = '';
                                        var middle = '';
                                        var end = '';

                                        if ($($this).children('#txtEnteredValue').first().is(":focus")) {
                                            var txt = $this.children('#txtEnteredValue')[0];
                                            var selSart = txt.selectionStart;
                                            var selEnd = txt.selectionEnd;
                                            begin = currentValue.substring(0, selSart);
                                            middle = currentValue.substr(selSart, selEnd);
                                            end = currentValue.substr(selEnd);

                                            var newValue = begin + newChar + end;
                                            currentValue = newValue;

                                            newCaretPosition = selSart;
                                        }
                                        else {
                                            currentValue += newChar;
                                        }
                                    }

                                    $this.data('currentValue', currentValue);
                                    //show new value
                                    $this.children('#txtEnteredValue').val($this.data('currentValue'));

                                    if (newCaretPosition >= 0) {
                                        var setter = function (elemId, caretPos) {
                                            var elem = document.getElementById(elemId);

                                            if (elem != null) {
                                                if (elem.createTextRange) {
                                                    var range = elem.createTextRange();
                                                    range.move('character', caretPos);
                                                    range.select();
                                                }
                                                else {
                                                    if (elem.selectionStart) {
                                                        elem.focus();
                                                        elem.setSelectionRange(caretPos, caretPos);
                                                    }
                                                    else
                                                        elem.focus();
                                                }
                                            }
                                        };
                                        setter('txtEnteredValue', newCaretPosition+1);
                                    }
                                }
                            }
                        }
                    });

                    //reset click
                    $(this).children('ul').children('li.reset').bind('click.jqKeyPad', function () {
                        $this.data('currentValue', null);
                        //show new value
                        $this.children('#txtEnteredValue').val('');
                    });

                    //back click
                    $(this).children('ul').children('li.back').bind('click.jqKeyPad', function () {
                        var currentValue = $this.data('currentValue');
                        if (currentValue != null && currentValue != '') {
                            currentValue = currentValue.substring(0, currentValue.length - 1);
                            $this.data('currentValue', currentValue);
                            $this.children('#txtEnteredValue').val(currentValue);
                        }
                    });

                    if (options.captureDocumentKeyPress) {

                        $(document).bind('keyup.jqKeyPad', function (e) {
                            if (e.keyCode == "16" && $this.data('isShift') == true) {
                                $this.data('isShift', false);//set shift state to true
                                var keyPadToShowOnUnshift = $this.data('options').keyPadToShowOnUnshift;
                                if (keyPadToShowOnUnshift != null && keyPadToShowOnUnshift !== undefined) {
                                    $this.children('ul').each(function () {
                                        var ulKeyPadName = $(this).attr('KeyPadName');
                                        if ($this.data('options').mode == 'incognito') {
                                            //do nothing in incognito mode
                                        }
                                        else if (ulKeyPadName == keyPadToShowOnUnshift) {
                                            $(this).show();
                                        }
                                        else {
                                            $(this).hide();
                                        }
                                    });
                                }
                            }

                            if (specialCharMap[e.keyCode] !== undefined) {
                                $this.data('is' + e.keyCode, false);
                            }
                        });

                        $(document).bind('keydown.jqKeyPad', function (e) {
                            if (e.shiftKey == true) {
                                var keyPadToShowOnShift = $this.data('options').keyPadToShowOnShift;
                                if (keyPadToShowOnShift != null && keyPadToShowOnShift !== undefined) {
                                    $this.children('ul').each(function () {
                                        var ulKeyPadName = $(this).attr('KeyPadName');
                                        if ($this.data('options').mode == 'incognito') {
                                            //do nothing in incognito mode
                                        }
                                        else if (ulKeyPadName == keyPadToShowOnShift) {
                                            $(this).show();
                                            $this.data('isShift', true);//set shift state to true
                                        }
                                        else {
                                            $(this).hide();
                                        }
                                    });
                                }
                            }

                            if (specialCharMap[e.keyCode] !== undefined) {
                                if ($this.data('is' + e.keyCode) != true) {
                                    //this sets the state of whether or not the key is down or up
                                    $this.data('is' + e.keyCode, true);//down state. false/null/undefined is the up state

                                    //go through every button, if it has specialVal property of the current button press then:
                                    //if the tracker has already been assigned then the tracker can only be overridden if the button is in the currently displayed keypad
                                    //only assign to tracker if the element has attribute commandName
                                    //var specialValue = undefined;
                                    if ($this.data('specialCharMap')[e.keyCode] !== undefined) {
                                        isSpecialCharacter = true;
                                        specialValue = $this.data('specialCharMap')[e.keyCode];
                                    }

                                    var keyPadToCallCommand = null;
                                    $($this).children('ul').children('li').each(function () {
                                        var specialVal = $(this).attr('specialVal');
                                        if (specialValue == specialVal) {
                                            if ($(this).parent().is(':visible')) {
                                                keyPadToCallCommand = $(this);
                                                return false;
                                            }
                                            else if(keyPadToCallCommand==null) {
                                                keyPadToCallCommand = $(this);
                                            }
                                        }
                                    });
                                    if (keyPadToCallCommand != null) {
                                        var attr = $(keyPadToCallCommand).attr('commandName');
                                        if (attr != null && attr != undefined && attr != '') {
                                            $(keyPadToCallCommand).click();
                                        }
                                    }

                                    //fire the onSpecialKeyDown event
                                    if (options.onSpecialKeyDown != null) {
                                        options.onSpecialKeyDown({
                                            keyCode: e.keyCode,
                                            key: specialCharMap[e.keyCode]
                                        });
                                    }
                                }
                            }


                        });

                        $(document).bind('keypress.jqKeyPad', function (e) {
                            var newChar = String.fromCharCode(e.keyCode ? e.keyCode : e.which);

                            //determine if there is a special key combo pressed
                            var continueKeyPress = true;
                            if (options.onSpecialKeyCombo != null) {
                                var i;
                                for (i in options.specialKeyCombos) {
                                    if (newChar == options.specialKeyCombos[i]) {
                                        //determine if this item's special key is currently down. if so, fire the onSpecialKeyCombo event
                                        if ($this.jqKeyPad('IsSpecialKeyDown', i) == true) {
                                            if (options.onSpecialKeyCombo({
                                                specialKey: i,
                                                regularKey: newChar
                                            }) == false) {
                                                continueKeyPress = false;
                                            }
                                        }
                                    }
                                }
                            }

                            //FIREFOX FIX - firefox handles special keys on the keypress event. make sure this doesnt make it to the click call
                            //ignore special keypresses as they are handled in teh keydown event
                            //special key presses should not be allowed
                            var specialCharMap = $this.data('specialCharMap');
                            var x;
                            for (x in specialCharMap) {
                                if (x == e.keyCode && e.charCode == "0") {
                                    return true;
                                }
                            }
                            //END FIREFOX FIX

                           
                            if (continueKeyPress) {

                                //if the key pressed exists in our collection of buttons, then go ahead and click the button
                                $($this).children('ul').children('li').each(function () {
                                    var value = $(this).attr('val');
                                    if (value != null && value == newChar) {
                                        $(this).click();
                                        return false;
                                    }
                                });
                            }

                            if ($('#txtEnteredValue').is(':focus') == true) {
                                return false;
                            }
                        });
                    }
                    else {

                        $('#txtEnteredValue').bind('keyup.jqKeyPad', function (e) {
                            if (e.keyCode == "16" && $this.data('isShift') == true) {
                                $this.data('isShift', false);//set shift state to true
                                var keyPadToShowOnUnshift = $this.data('options').keyPadToShowOnUnshift;
                                if (keyPadToShowOnUnshift != null && keyPadToShowOnUnshift !== undefined) {
                                    $this.children('ul').each(function () {
                                        var ulKeyPadName = $(this).attr('KeyPadName');
                                        if ($this.data('options').mode == 'incognito') {
                                            //do nothing in incognito mode
                                        }
                                        else if (ulKeyPadName == keyPadToShowOnUnshift) {
                                            $(this).show();
                                        }
                                        else {
                                            $(this).hide();
                                        }
                                    });
                                }
                            }

                            if (specialCharMap[e.keyCode] !== undefined) {
                                $this.data('is' + e.keyCode, false);
                            }
                        });

                        $('#txtEnteredValue').bind('keydown.jqKeyPad', function (e) {

                            if (e.shiftKey == true) {
                                var keyPadToShowOnShift = $this.data('options').keyPadToShowOnShift;
                                if (keyPadToShowOnShift != null && keyPadToShowOnShift !== undefined) {
                                    $this.children('ul').each(function () {
                                        var ulKeyPadName = $(this).attr('KeyPadName');
                                        if ($this.data('options').mode == 'incognito') {
                                            //do nothing in incognito mode
                                        }
                                        else if (ulKeyPadName == keyPadToShowOnShift) {
                                            $(this).show();
                                            $this.data('isShift', true);//set shift state to true
                                        }
                                        else {
                                            $(this).hide();
                                        }
                                    });
                                }
                            }

                            if (specialCharMap[e.keyCode] !== undefined) {
                                if ($this.data('is' + e.keyCode) != true) {
                                    //this sets the state of whether or not the key is down or up
                                    $this.data('is' + e.keyCode, true);//down state. false/null/undefined is the up state

                                    //go through every button, if it has specialVal property of the current button press then:
                                    //if the tracker has already been assigned then the tracker can only be overridden if the button is in the currently displayed keypad
                                    //only assign to tracker if the element has attribute commandName
                                    //var specialValue = undefined;
                                    if ($this.data('specialCharMap')[e.keyCode] !== undefined) {
                                        isSpecialCharacter = true;
                                        specialValue = $this.data('specialCharMap')[e.keyCode];
                                    }

                                    var keyPadToCallCommand = null;
                                    $($this).children('ul').children('li').each(function () {
                                        var specialVal = $(this).attr('specialVal');
                                        if (specialValue == specialVal) {
                                            if ($(this).parent().is(':visible')) {
                                                keyPadToCallCommand = $(this);
                                                return false;
                                            }
                                            else if (keyPadToCallCommand == null) {
                                                keyPadToCallCommand = $(this);
                                            }
                                        }
                                    });
                                    if (keyPadToCallCommand != null) {
                                        var attr = $(keyPadToCallCommand).attr('commandName');
                                        if (attr != null && attr != undefined && attr != '') {
                                            $(keyPadToCallCommand).click();
                                        }
                                    }

                                    //fire the onSpecialKeyDown event
                                    if (options.onSpecialKeyDown != null) {
                                        options.onSpecialKeyDown({
                                            keyCode: e.keyCode,
                                            key: specialCharMap[e.keyCode]
                                        });
                                    }
                                }
                            }
                        });

                        $('#txtEnteredValue').bind('keypress.jqKeyPad', function (e) {


                            //FIREFOX FIX - firefox handles special keys on the keypress event. make sure this doesnt make it to the click call
                            //ignore special keypresses as they are handled in teh keydown event
                            //special key presses should not be allowed
                            var specialCharMap = $this.data('specialCharMap');
                            var x;
                            for (x in specialCharMap) {
                                if (x == e.keyCode && e.charCode == "0") {
                                    return true;
                                }
                            }
                            //END FIREFOX FIX


                            var newChar = String.fromCharCode(e.keyCode);
                            var found = false;
                            $($this).children('ul').children('li').each(function () {
                                var value = $(this).attr('val');
                                if (value != null && value == newChar) {
                                    $(this).click();
                                    found = true;
                                    return false;
                                }
                            });


                            if ($('#txtEnteredValue').is(':focus') == true) {
                                return false;
                            }
                        });
                    }

                    $('#txtEnteredValue').bind('paste.jqKeyPad', function (e) {
                        //pasteability controlled by option - default is true
                        return options.pasteAllowed;
                    });
                }
            });
        },
        destroy: function () {

            //for (var i in $(this).data('options')) {
              //  $(this).data('options')[i] = null;
            //}

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
            $this.children('#txtEnteredValue').val('');
        },
        ShowKeyPad: function (keyPadName) {
            //switch keypads (ul's should have attribute KeyPadName)
            var $this = $(this);
            var listFound = false;

            $this.children('ul').each(function () {
                if ($this.data('options').mode == 'incognito') {
                    //do nothing in incognito mode
                    return;
                }

                else
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
        },
        IsSpecialKeyDown: function (keyName) {
            var $this = $(this);
            var charMap = $this.data('specialCharMap');
            for (var i in charMap) {
                if (charMap[i] == keyName) {
                    if ($this.data('is' + i) == true) {
                        return true;
                    }
                    else {
                        return false;
                    }
                }
            }
        },
        Focus: function () {
            $('#txtEnteredValue').focus();
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