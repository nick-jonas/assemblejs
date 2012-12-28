define([], function(){

    var Env = {

        id : '',

        config : {
            'Local' : {
                fb_client_id: '123123123',
                ajax_prefilter: null
            },
            'Dev' : {
                fb_client_id: '234234234',
                ajax_prefilter: null
            },
            'Prod' : {
                fb_client_id: '345345345',
                ajax_prefilter: null
            }
        },

        initialize: function(){

            // assign ID
            switch( window.location.hostname ){
                case "dev.app.com":
                    this.id = 'Dev';
                    break;

                case "app.com":
                    this.id = 'Prod';
                    break;

                case "localhost":
                case "127.0.0.1":
                case "boilerplate":
                case "local.app.com":
                    this.id = 'Local';
                    break;

                default:
                    this.id = 'Local';
                    debug.log('Unknown environment: ' + window.location.hostname );
            }

            debug.log(this, "Environment set to: " + this.id);

            // assign prefilter
            if(this.getValue('ajax_prefilter')){
                $.ajaxPrefilter( function( options, originalOptions, jqXHR ){
                    options.url = this.getValue('ajax_prefilter') + options.url;
                });
            }

        },

        getID : function(){
            return this.id;
        },

        getValue : function( key ){
            if(this.id && this.id !== ''){
                return this.config[this.id][key];
            }else{
                throw('Unknown environment: ' + window.location.hostname );
            }
        }

    };

    return Env;
});