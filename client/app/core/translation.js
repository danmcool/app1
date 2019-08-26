app1.factory('AppTranslationService', function AppTranslationService() {
    var text = {
        app_title: {
            en: 'Application ONE',
            fr: 'Application ONE'
        },
        homepage_welcome: {
            en: 'Welcome to App1',
            fr: 'Bienvenue chez App1'
        },
        homepage_platform: {
            en: 'App1 is the platform for digital enterprise',
            fr: 'App1 est la plateforme de l\'entreprise digitale'
        },
        homepage_power: {
            en: 'Power',
            fr: 'Puissance'
        },
        homepage_design: {
            en: 'Looks',
            fr: 'Design'
        },
        homepage_flexibility: {
            en: 'Versatility',
            fr: 'Flexibilité'
        },
        homepage_architecture: {
            en: 'Modern architecture allows App1 to be one of the fastest cloud enterprise software',
            fr: 'L\'architecture moderne permet à App1 d\'être un des plus rapides logiciel cloud pour entreprise'
        },
        homepage_looks: {
            en: 'Easy to use, designed for mobile first, there\'s no need to read the manual',
            fr: 'Facile à utiliser, disponible sur mobile, tablette et desktop, pas besoin de regarder le manuel'
        },
        homepage_versatility: {
            en: 'Business partners can collaborate on different apps in same cloud',
            fr: 'Les partenaires business peuvent collaborer sur des applications différentes dans le même cloud'
        },
        homepage_products: {
            en: 'Products',
            fr: 'Produits'
        },
        homepage_contact: {
            en: 'Contact Us',
            fr: 'Nous contacter'
        },
        homepage_events_title: {
            en: 'Events',
            fr: 'Evénements'
        },
        homepage_events: {
            en: 'Organize internal events (trainings, workshops, etc), share venue et prerequisits information, let colleagues subscribe to an event',
            fr: 'Organisation des événements interne (trainings, workshops, etc), partager l\'adresse et les prérequis, permettez à vos collègues de souscrire à un événement'
        },
        homepage_incidents_title: {
            en: 'Incident Management',
            fr: 'Gestion des incidents'
        },
        homepage_incidents: {
            en: 'Manage incoming issues from customers or partners, easily find insightful information on your products, increase productivity',
            fr: 'Gérez les incidents saisis par des clients ou partenaires, trouver des informations pertinentes sur vos produits, augmentez votre productivité'
        },
        homepage_timesheets_title: {
            en: 'Timesheets',
            fr: 'Feuilles de présence'
        },
        homepage_timesheets: {
            en: 'Create timesheets and assign them to your employees, employees can get their timesheets validated by the customers',
            fr: 'Créer de feuilles de présence et assignez les a vos employés, vos employés peuvent les faire valider par les clients'
        },
        homepage_consulting: {
            en: 'Consulting',
            fr: 'Conseil'
        },
        homepage_buildpoc_title: {
            en: 'Let Us Build Your Live Proof Of Concept',
            fr: 'Laissez nous faire une preuve de concept live pour vous'
        },
        homepage_buildpoc: {
            en: 'Our consulting team can help you define your digital requirements; then rapidly create a App1 application and help you with the deployment of the solution in your enterprise',
            fr: 'Notre équipe de conseil peut vous aider à concrétiser vos besoins dans le numérique; ensuite créer très rapidement une application App1 et vous accompagner dans le déploiement de la solution dans votre entreprise'
        },
        homepage_appcreation_title: {
            en: 'Training For Partners And Power Users',
            fr: 'Training pour les partenaires et utilisateurs chevronnés'
        },
        homepage_appcreation: {
            en: 'We show you how App1 digital platform works so that you can create yourself your digital experience and applications',
            fr: 'On vous montre comment la plateforme numérique App1 marche pour que vous puissiez créer vous-mêmes votre expérience numérique ou vos applications'
        },
        homepage_register_free_trial: {
            en: 'Free registration for up to 10 users',
            fr: 'Enregistrement gratuit jusqu\'à 10 utilisateurs'
        },
        homepage_require_poc: {
            en: 'Free proof of concept -> Make your digital transformation with App1',
            fr: 'Preuve de concept gratuit -> Créez votre transformation digitale avec App1'
        },
        new_app: {
            en: 'New application',
            fr: 'Nouvelle application'
        },
        test_app: {
            en: 'Test application',
            fr: 'Tester l\'application'
        },
        new_app_name: {
            en: 'Name of the application',
            fr: 'Nom de l\'application'
        },
        app_description: {
            en: 'Application Description',
            fr: 'Description de l\'application'
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
            fr: 'Concepteur d\'application'
        },
        share_form: {
            en: 'Share Form',
            fr: 'Formulaire pour le partage'
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
            en: 'No public profile or workflow available',
            fr: 'Pas de profile publique ou de processus disponible'
        },
        error: {
            en: 'Error',
            fr: 'Erreur'
        },
        text_translation: {
            en: 'Text Translation',
            fr: 'Traduction de texte'
        },
        html_message: {
            en: 'Message (HTML Format)',
            fr: 'Message (format HTML)'
        },
        new_workflow: {
            en: 'New workflow',
            fr: 'Nouveau processus'
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
            en: 'New form',
            fr: 'Nouveau formulaire'
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
        standard: {
            en: 'Forms',
            fr: 'Formulaires'
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
        deactivate: {
            en: 'Deactivate',
            fr: 'Desactiver'
        },
        app_profile: {
            en: 'Application User Profile',
            fr: 'Profile utilisateur d\'application'
        },
        profiles: {
            en: 'Profiles',
            fr: 'Profiles'
        },
        new_profile: {
            en: 'New Application Profile',
            fr: 'Nouveau profile de l\'application'
        },
        default_profile: {
            en: 'Default User Profile',
            fr: 'Profiles utilisateur par défaut'
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
            fr: 'Le nouveau mot de passe n\'est pas identique!'
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
            en: 'App1 Website',
            fr: 'Site web App1'
        },
        no_account: {
            en: 'No account yet, register for free!',
            fr: 'Pas de compte, enregistrement gratuit!'
        },
        uploading_in_progress: {
            en: 'Uploading in progress',
            fr: 'Téléchargement en cours'
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
            fr: 'Activer le mode test - la connexion n\'est pas disponible'
        },
        saml_metadata_url: {
            en: 'Metadata definition of App1 service provider - to be uploaded to Identity Provider',
            fr: 'Définition des métadonnées du service App1 - a charger sur le service d\'Identification'
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
        error_creating_appointment: {
            en: 'Reservation cannot be created, please verify the date and try again!',
            fr: 'Le reservation n\'est pas possible veuillez verifier les dates et re-essayer!'
        },
        error_removing_appointment: {
            en: 'Reservation cannot be removed, please verify the date and try again!',
            fr: 'Le reservation ne peut pas être supprimée, veuillez verifier les dates et re-essayer!'
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
            en: 'Search',
            fr: 'Rechercher'
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
            fr: 'Disposition de l\'affichage'
        },
        form_actions: {
            en: 'Actions',
            fr: 'Actions'
        },
        form_values: {
            en: 'Data Values',
            fr: 'Valeurs de données'
        },
        new_data_value: {
            en: 'New Data Value',
            fr: 'Nouvelle valeur de données'
        },
        new_field: {
            en: 'New Element',
            fr: 'Nouvel élément'
        },
        new_section: {
            en: 'New Section',
            fr: 'Nouvelle section'
        },
        new_block: {
            en: 'New Block',
            fr: 'Nouveau bloc'
        },
        field_editor: {
            en: 'Element',
            fr: 'Elément'
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
        field_hide_name: {
            en: 'Hide name',
            fr: 'Cacher le nom'
        },
        field_show_search: {
            en: 'Display search field',
            fr: 'Afficher le champs de recherche'
        },
        field_show_interval: {
            en: 'Interval selection',
            fr: 'Sélection de la période '
        },
        field_show_icon: {
            en: 'Show icon',
            fr: 'Afficher icône'
        },
        field_destination_datafield: {
            en: 'Destination Data field',
            fr: 'Champ de données de destination'
        },
        field_datafield: {
            en: 'Data field',
            fr: 'Champ de données'
        },
        field_display: {
            en: 'Display type',
            fr: 'Type d\'affichage'
        },
        field_listofvalues: {
            en: 'Values',
            fr: 'Valeurs'
        },
        field_list_title: {
            en: 'First line',
            fr: 'Premiere ligne'
        },
        field_list_subtitle: {
            en: 'Second line',
            fr: 'Deuxieme ligne'
        },
        field_list_date: {
            en: 'Date format',
            fr: 'Format date'
        },
        field_date: {
            en: 'Date',
            fr: 'Date'
        },
        field_show_map: {
            en: 'Show Map',
            fr: 'Afficher carte'
        },
        field_show_busy_calendar: {
            en: 'Show calendar with busy schedules',
            fr: 'Afficher le calendrier avec les créneaux occupés'
        },
        field_init_value: {
            en: 'Initial value parameter',
            fr: 'Paramètre pour la valeur initiale'
        },
        field_default_value: {
            en: 'Default value',
            fr: 'Valeur par defaut'
        },
        field_init_value_start: {
            en: 'Initial value parameter for start',
            fr: 'Paramètre pour la valeur initiale pour debut'
        },
        field_init_value_end: {
            en: 'Initial value parameter for end',
            fr: 'Paramètre pour la valeur initiale pour fin'
        },
        action_editor: {
            en: 'Action',
            fr: 'Action'
        },
        action_type: {
            en: 'Type',
            fr: 'Type'
        },
        action_project_name: {
            en: 'Project Name',
            fr: 'Nom du projet'
        },
        action_start_date: {
            en: 'Start Date',
            fr: 'Date de début'
        },
        action_end_date: {
            en: 'End Date',
            fr: 'Date de fin'
        },
        action_forward_id: {
            en: 'Forward Object Id',
            fr: 'Transmettre l\'identifiant de l\'objet'
        },
        action_next_form: {
            en: 'Next Form',
            fr: 'Formulaire suivant'
        },
        action_subscription_list: {
            en: 'Subscription List',
            fr: 'Liste de souscription'
        },
        new_action: {
            en: 'New Action',
            fr: 'Nouvelle action'
        },
        new_action_name: {
            en: 'Action Name',
            fr: 'Nom de l\'action'
        },
        action_set_value: {
            en: 'Modify value',
            fr: 'Modifier la valeur'
        },
        action_formula: {
            en: 'Send value',
            fr: 'Envoyer valeur'
        },
        action_notify_user: {
            en: 'Notification Recipee User',
            fr: 'Utilisateur destinataire de la notification'
        },
        new_action_email_title: {
            en: 'Notification Email Title',
            fr: 'Titre du courriel de notification'
        },
        new_action_email_html: {
            en: 'Notification HTML Email Content',
            fr: 'Contenu HTML du courriel de notification'
        },
        value_editor: {
            en: 'Value',
            fr: 'Valeur'
        },
        new_value: {
            en: 'New Value',
            fr: 'Nouvelle valuer'
        },
        new_value_name: {
            en: 'Value Name',
            fr: 'Nom de la valeur'
        },
        value_type: {
            en: 'Type',
            fr: 'Type'
        },
        value_user_relation_type: {
            en: 'Relation type',
            fr: 'Type de relation'
        },
        add_value_list: {
            en: 'Add new value',
            fr: 'Ajouter une nouvelle valeur'
        },
        datamodel_designer: {
            en: 'Data Modeler',
            fr: 'Modélisateur de données'
        },
        new_datamodel: {
            en: 'New data model',
            fr: 'Noveau model de données'
        },
        new_datamodel_name: {
            en: 'Name',
            fr: 'Nom'
        },
        datamodel_description: {
            en: 'Description',
            fr: 'Description'
        },
        datamodel_field_list: {
            en: 'Data fields',
            fr: 'Champs de données'
        },
        datamodel_add_field: {
            en: 'Add field',
            fr: 'Ajouter champ'
        },
        datamodel_field_name: {
            en: 'Technical name',
            fr: 'Nom technique'
        },
        datamodel_field_type: {
            en: 'Field type',
            fr: 'Type champ'
        },
        datamodel_field_index: {
            en: 'Searcheable',
            fr: 'Rechercheable'
        },
        datamodel_field_index_weight: {
            en: 'Importance',
            fr: 'Importance'
        },
        start_time: {
            en: 'Start Time',
            fr: 'Temps de début'
        },
        end_time: {
            en: 'End Time',
            fr: 'Temps de fin'
        },
        day: {
            en: 'Day',
            fr: 'Jour'
        },
        hour: {
            en: 'Hour',
            fr: 'Heure'
        },
        minute: {
            en: 'Minute',
            fr: 'Minute'
        },
        action_event_object_name: {
            en: 'Name of object',
            fr: 'Nom de l\'objet'
        },
        action_event_period: {
            en: 'Period',
            fr: 'Période'
        },
        action_event_reservation: {
            en: 'Reservation Data Model',
            fr: 'Modèle de données pour les reservations'
        },
        action_event_reservation_object_id_path: {
            en: 'Object Id Field',
            fr: 'Champs pour l\'id de l\'objet'
        },
        action_event_reservation_name_path: {
            en: 'Object Name Field',
            fr: 'Champs pour le nom de l\'objet'
        },
        action_event_reservation_period_path: {
            en: 'Reservation Period Field',
            fr: 'Champs pour la période de la reservation'
        },
        whole_day: {
            en: 'Whole Day',
            fr: 'Journée entière'
        },
        whole_week: {
            en: 'Whole Week',
            fr: 'Semaine entière'
        },
        appointments: {
            en: 'Booked Timeslots',
            fr: 'Créneaux reservés'
        },
        previous_messages: {
            en: 'Previous Messages',
            fr: 'Messages precedents'
        },
        paypal_merchant_id: {
            en: 'PayPal merchant ID (Account settings/Business Information)',
            fr: 'ID vendeur PayPal (Configuration compte/Information vendeur)'
        },
        payment_country: {
            en: 'Payment country',
            fr: 'Pays pour paiement'
        },
        payment_currency: {
            en: 'Payment currency',
            fr: 'Monnaie pour paiement'
        },
        payment_value: {
            en: 'Payement value',
            fr: 'Montant pour paiement'
        },
        payment_label: {
            en: 'Payment label',
            fr: 'Etiquette pour paiement'
        },
        payment_update_path: {
            en: 'Field to be updated after payment',
            fr: 'Champs à mettre à jour après paiement'
        },
        payment_update_value: {
            en: 'Value to set after payment',
            fr: 'Valeur à mettre après paiement'
        },
        payment_using_paypal: {
            en: 'Payment using PayPal (http://www.paypal.com)',
            fr: 'Payment avec PayPal (http://www.paypal.com)'
        }
    }
    var translate = function translate(language) {
        var appData = {};
        var keysOfText = Object.keys(text);
        for (var i = 0; i < keysOfText.length; i++) {
            appData[keysOfText[i]] = text[keysOfText[i]][language];
        }
        return appData;
    }
    return {
        translate: translate
    }
})
