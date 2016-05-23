var register = function(Handlebars) {

    var helpers = {
        // put all of your helpers inside this object
        ifCond: function(v1, operator, v2, options) {
            v1  =   typeof(v1) == 'object' ? String(v1) : v1;
            v2  =   typeof(v2) == 'object' ? String(v2) : v2;
            switch (operator) {
               case '==':
                   return (v1 == v2) ? options.fn(this) : options.inverse(this);
               case '===':
                   return (v1 === v2) ? options.fn(this) : options.inverse(this);
               case '!=':
                   return (v1 != v2) ? options.fn(this) : options.inverse(this);
               case '<':
                   return (v1 < v2) ? options.fn(this) : options.inverse(this);
               case '<=':
                   return (v1 <= v2) ? options.fn(this) : options.inverse(this);
               case '>':
                   return (v1 > v2) ? options.fn(this) : options.inverse(this);
               case '>=':
                   return (v1 >= v2) ? options.fn(this) : options.inverse(this);
               case '&&':
                   return (v1 && v2) ? options.fn(this) : options.inverse(this);
               case '||':
                   return (v1 || v2) ? options.fn(this) : options.inverse(this);

               default:
                   return options.inverse(this);
           }
       },
       dateFormat   :   function(date_str, options) {
           var date     =   new Date(date_str);

           var date_options =   {
                weekday: "long", year: "numeric", month: "short",
                day: "numeric", hour: "2-digit", minute: "2-digit"
            };
            return date.toLocaleTimeString("en-us", date_options)
       }
    };

    if (Handlebars && typeof Handlebars.registerHelper === "function") {
        // register helpers
        for (var prop in helpers) {
            Handlebars.registerHelper(prop, helpers[prop]);
        }
    } else {
        // just return helpers object if we can't register helpers here
        return helpers;
    }

};

// client
if (typeof window !== "undefined") {
    register(Handlebars);
}
// server
else {
    module.exports.register = register;
    module.exports.helpers = register(null);
}
