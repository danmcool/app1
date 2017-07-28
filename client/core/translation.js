app1.factory('AppTranslationService', function AppTranslationService() {
    var text = {
        app_title: {
            en: 'Application ONE',
            fr: 'Application ONE'
        },
        new_app: {
            en: 'New application...',
            fr: 'Nouvelle application...'
        },
        new_app_name: {
            en: 'Name of the application',
            fr: 'Nom de l`application'
        },
        app_description: {
            en: 'Application Description',
            fr: 'Description de l`application'
        },
        app_icon: {
            en: 'Icon',
            fr: 'Icône'
        },
        list_app: {
            en: 'Application List',
            fr: 'Liste des applications'
        },
        app_designer: {
            en: 'Application Designer',
            fr: 'Editeur d`application'
        },
        share_url: {
            en: 'Share URL',
            fr: 'URL pour le partage'
        },
        public_share: {
            en: 'Public Share',
            fr: 'Partage publique'
        },
        no_public_profile: {
            en: 'No public profile available',
            fr: 'Pas de profile publique disponible'
        },
        error: {
            en: 'Error',
            fr: 'Erreur'
        },
        text_translation: {
            en: 'Text Translation',
            fr: 'Traduction de texte'
        },
        new_workflow: {
            en: 'New workflow...',
            fr: 'Nouveau processus...'
        },
        new_workflow_name: {
            en: 'Workflow Name',
            fr: 'Nom du processus'
        },
        workflow_description: {
            en: 'Workflow Description',
            fr: 'Description du processus'
        },
        list_workflow: {
            en: 'Workflow List',
            fr: 'Liste des processus'
        },
        startup_form: {
            en: 'Startup Form',
            fr: 'Formulaire de démarrage'
        },
        new_form: {
            en: 'New form...',
            fr: 'Nouveau formulaire...'
        },
        new_form_name: {
            en: 'Form Name',
            fr: 'Nom du formulaire'
        },
        list_form: {
            en: 'Form List',
            fr: 'Liste des formulaires'
        },
        form: {
            en: 'Form',
            fr: 'Formulaire'
        },
        workflow: {
            en: 'Workflow',
            fr: 'Processus'
        },
        application: {
            en: 'Application',
            fr: 'Application'
        },
        url: {
            en: 'Link',
            fr: 'Lien'
        },
        application_url: {
            en: 'Web application link',
            fr: 'Lien application web'
        },
        file: {
            en: 'File',
            fr: 'Fichier'
        },
        app_wkf_type: {
            en: 'Please choose a type',
            fr: 'Veuillez choisir le type'
        },
        activate: {
            en: 'Activate',
            fr: 'Activer'
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
        change_password: {
            en: 'Change Password',
            fr: 'Changement du mot de passe'
        },
        current_password: {
            en: 'Current password',
            fr: 'Mot de passe actuel'
        },
        new_password: {
            en: 'New Password',
            fr: 'Nouvel mot de passe'
        },
        repeat_new_password: {
            en: 'Repeat New Password',
            fr: 'Répéter le nouvel mot de passe'
        },
        password_match: {
            en: 'New password does not match!',
            fr: 'Le nouveau mot de passe n`est pas identique!'
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
            en: 'Your company code must be between 5 and 20 characters long, it is used for the security of company data.',
            fr: 'Votre code société doit contenir entre 5 et 20 caractères, il sera utilisé pour la sécurité des données de votre société.'
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
        company_settings: {
            en: 'Company Settings',
            fr: 'Configuration enterprise'
        },
        company_logo_url: {
            en: 'Please prove an URL for company logo',
            fr: 'Veuillez fournir une URL pour le logo de la société'
        },
        company_description: {
            en: 'Please enter a notice for users',
            fr: 'Veuillez saisir une information pour les utilisateurs'
        },
        saml_settings: {
            en: 'SSO Configuration using SAML',
            fr: 'Configuration SSO en utilisant SAML'
        },
        user_invitation: {
            en: 'Invite Enterprise Users',
            fr: 'Inviter utilisateurs entreprise'
        },
        user_invitation_key: {
            en: 'User invitation key:',
            fr: 'Clé pour invitation utilisateur:'
        },
        download_outlook_plugin: {
            en: 'Download Outlook Plugin',
            fr: 'Télécharger le plugin pour Outlook'
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
        welcome: {
            en: 'Welcome',
            fr: 'Accueil'
        },
        uploading_in_progress: {
            en: 'Uploading in progress...',
            fr: 'Téléchargement en cours...'
        },
        uploading_done: {
            en: 'Uploading finished successfully!',
            fr: 'Téléchargement terminé avec succès!'
        },
        already_account: {
            en: 'If you already have an account, please click here to login!',
            fr: 'Si vous avez déjà un compte, veuillez cliquer ici pour se connecter!'
        },
        enable_saml: {
            en: 'Enable user SSO login for enterprise using SAML',
            fr: 'Activer la connexion automatique des utilisateurs en utilisant le SAML de l’entreprise'
        },
        saml_sso_redirect_url: {
            en: 'Enter URL used for SAML SSO connection (redirect)',
            fr: 'Saisir le lien utilisé pour la connexion SAML SSO (redirection)'
        },
        saml_sso_certificate: {
            en: 'Paste the certificate for Identity Provide connection',
            fr: 'Coller le certificat pour la connexion avec le service de l’identification'
        },
        saml_login_url: {
            en: 'Following URL is allowing the SSO SAML login',
            fr: 'Cette URL permet le login SSO SAML'
        },
        saml_activate_test: {
            en: 'Activate test mode - login is not possible',
            fr: 'Activer le mode test - la connexion n`est pas disponible'
        },
        saml_metadata_url: {
            en: 'Metadata definition of App1 service provider - to be uploaded to Identity Provider',
            fr: 'Définition des métadonnées du service App1 - a charger sur le service d`Identification'
        },
        already_modified_document: {
            en: 'The underlying data of this document has been modified by another user,' +
                ' please revise the content and save again!',
            fr: 'Le document courant a été déjà modifié par un autre utilisateur,' +
                ' veuillez vérifier le contenu et sauvegarder à nouveau!'
        },
        new_document_version: {
            en: 'New document version',
            fr: 'Nouvelle version de document'
        },
        removal_confirmation: {
            en: 'Remove the object?',
            fr: 'Supprimer l’objet?'
        },
        confirmation: {
            en: 'Confirm',
            fr: 'Confirmer'
        },
        yes: {
            en: 'Yes',
            fr: 'Oui'
        },
        no: {
            en: 'No',
            fr: 'Non'
        },
        ok: {
            en: 'Ok',
            fr: 'Ok'
        },
        cancel: {
            en: 'Cancel',
            fr: 'Annuler'
        },
        search_text: {
            en: 'Search...',
            fr: 'Rechercher...'
        },
        form_search_criteria: {
            en: 'Search Criteria',
            fr: 'Critères de recherche'
        },
        form_sort_by: {
            en: 'Sort By',
            fr: 'Trier après'
        },
        datamodel: {
            en: 'Data Model',
            fr: 'Modèle de données'
        },
        form_display: {
            en: 'Display Layout',
            fr: 'Disposition de l`affichage'
        },
        form_actions: {
            en: 'Actions',
            fr: 'Actions'
        },
        new_action: {
            en: 'New Action...',
            fr: 'Nouvelle action...'
        },
        form_values: {
            en: 'Data Values',
            fr: 'Valeurs de données'
        },
        new_value: {
            en: 'New Data Value...',
            fr: 'Nouvelle valeur de données...'
        },
        new_field: {
            en: 'New Element...',
            fr: 'Nouvel élément...'
        },
        new_section: {
            en: 'New Section...',
            fr: 'Nouvelle section...'
        },
        new_block: {
            en: 'New Block...',
            fr: 'Nouveau bloc...'
        },
        field_editor: {
            en: 'Element Properties',
            fr: 'Propriétés de l`élément'
        },
        field_name: {
            en: 'Text',
            fr: 'Texte'
        },
        field_disabled: {
            en: 'Disabled',
            fr: 'Désactivé'
        },
        field_required: {
            en: 'Mandatory',
            fr: 'Obligatoire'
        },
        field_datafield: {
            en: 'Data field',
            fr: 'Champ de données'
        },
        field_display: {
            en: 'Display type',
            fr: 'Type d`affichage'
        },
        field_listofvalues: {
            en: 'List of values',
            fr: 'Liste de valeurs'
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
