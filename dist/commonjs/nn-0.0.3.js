(function() {
    'use strict';
    var numberType = typeof 0,
        stringType = typeof "",
        emptyFunction = function () {
        }, //needed for undefined function execution
        functionType = typeof emptyFunction,
        splitter = ".";

    /**
     * TODO: try providing a select that takes n params "prop1", "prop1_1", "prop2" if performance improves because of it.
     * Recursive query select function generator.
     * @returns {function} - closure bound to the last context
     */
    function select(selector, context) {
        var selectorType = typeof selector,
            dotSplit,
            propertyName,
            previousContext; //needed for function execution

        //determine what to do based on the selector type.
        if (selectorType === stringType) {
            dotSplit = selector.split(splitter);
        } else if (selectorType === numberType) {
            dotSplit = [selector];
        } else {
            context = null;//handle undefined selectors. e.g. nn(obj)(undefined)
        }


        //iterate over each property and traverse contexts.
        for (var i = 0; dotSplit && i < dotSplit.length; ++i){
            propertyName = dotSplit[i];
            previousContext = context;
            context = context ? context[propertyName] : undefined; //traverse contexts
        }

        //closure bound to the last context
        var result = function (s) {
            return select(s, context);
        };
        result.val = context; //allow access to the last value. this is not protected (it can be null or undefined)
        //to allow functions to be executed safely, we provide the function which will call the real function if it exists,
        //passing it the arguments and the context of the real function's parent.
        result.func = function () {
            var potentialFunc = previousContext && previousContext[propertyName] ? previousContext[propertyName] : undefined;
            var isFunc = typeof potentialFunc === functionType;
            return isFunc ? potentialFunc.apply(previousContext, arguments) : undefined;
        };
        return result;
    }

    /**
     * Initialization function
     * @param {object} obj - the query object.
     * @returns {function} - closure bound to the query object.
     */
    function nn(obj) {
        return function (sel) {
            return select(sel, obj);
        }
    }

    //assign nn to the global scope.
    //
    module.exports = nn;
    //
})();