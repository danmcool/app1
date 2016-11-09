app1.factory('AppTranslationService', function AppTranslationService() {
    var text = {
        app_title: {
            en: 'Application ONE',
            fr: 'Application ONE'
        },
        choose_app: {
            en: 'Choose an application',
            fr: 'Choisir une application'
        },
        home: {
            en: 'Home',
            fr: 'Accueil'
        },
        enter_credentials: {
            en: 'Enter credentials',
            fr: 'Informations utilisateur'
        },
        user: {
            en: 'User',
            fr: 'Utilisateur'
        },
        password: {
            en: 'Password',
            fr: 'Mot de passe'
        },
        company_code: {
            en: 'Company code',
            fr: 'Code société'
        },
        company_name: {
            en: 'Company name',
            fr: 'Nom société'
        },
        user_name: {
            en: 'User name',
            fr: 'Utilisateur'
        },
        user_error: {
            en: 'Your user name must be between 5 and 20 characters long.',
            fr: 'Votre nom utilisateur doit contenir entre 5 et 20 caractères.'
        },
        email_error: {
            en: 'Your email address must be between 5 and 200 characters long.',
            fr: 'Votre adresse email doit contenir entre 5 et 200 caractères.'
        },
        save: {
            en: 'Save',
            fr: 'Sauvegarder'
        },
        code_error: {
            en: 'Your company code must be between 5 and 20 characters long, it will be used by users every time they logon to the system.',
            fr: 'Votre code société doit contenir entre 5 et 20 caractères, il sera utilisé lors de chaque connexion utilisateur.'
        },
        first_name: {
            en: 'First name',
            fr: 'Prénom'
        },
        last_name: {
            en: 'Last name',
            fr: 'Nom'
        },
        email: {
            en: 'Email address',
            fr: 'Adresse email'
        },
        theme: {
            en: 'Color theme',
            fr: 'Thème couleur'
        },
        language: {
            en: 'Language',
            fr: 'Langue'
        },
        user_settings: {
            en: 'User Settings',
            fr: 'Configuration utilisateur'
        },
        administration: {
            en: 'Administration',
            fr: 'Administration'
        },
        information: {
            en: 'Information',
            fr: 'Information'
        },
        login: {
            en: 'Login',
            fr: 'Connexion'
        },
        logout: {
            en: 'Logout',
            fr: 'Deconnexion'
        },
        open: {
            en: 'Open',
            fr: 'Ouvrir'
        },
        register: {
            en: 'Register',
            fr: 'Enregister'
        },
        uploading_in_progress: {
            en: 'Uploading in progress...',
            fr: 'Téléchargement en cours...'
        },
        uploading_done: {
            en: 'Uploading finished successfully!',
            fr: 'Téléchargement terminé avec succès!'
        }
    };
    var translate = function translate(language) {
        var appData = {};
        var keysOfText = Object.keys(text);
        for (i = 0; i < keysOfText.length; i++) {
            appData[keysOfText[i]] = text[keysOfText[i]][language];
        }
        return appData;
    }
    return {
        translate: translate
    }
})
