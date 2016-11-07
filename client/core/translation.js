app1.factory('AppInternationalDataService', function AppInternationalDataService() {
        var strings = {
            app_title: {'en':'Application ONE', 'fr':'Application ONE'},
            home: {'en':'Home', 'fr':'Accueil'},
            user_settings: {'en':'User Settings', 'fr':'Configuration utilisateur'},
            login: {'en':'Login', 'fr':'Connexion'},
            logout: {'en':'Logout', 'fr':'Deconnexion'},
            open: {'en':'Open', 'fr':'Ouvrir'},
            register: {'en':'Register', 'fr':'Enregister'}
        };
        var get = function get(item) {
            if (strings[item]) return strings[item];
            else return "xxxxx";
        }
        return {
            get: get
        }
    })
