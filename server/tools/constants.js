const Constants = {
    CommandLineParameterCount: 8,
    CommandLineParameterDatabaseIp: 2,
    CommandLineParameterDatabasePort: 3,
    CommandLineParameterDatabasePassword: 4,
    CommandLineParameterEmailUsername: 5,
    CommandLineParameterEmailPassword: 6,
    CommandLineParameterSecretKey: 7,

    MaxSessionTimeout: 14 * 24 * 60 * 60 * 1000, // 2 weeks cookie validity
    MaxSessionPublicTimeout: 15 * 60 * 1000, // 15 minutes cookie validity
    MaxSessionCacheTimeout: 60 * 60 * 1000, // 1 hour cookie cache
    DBSessionTimerCleanup: 1 * 60 * 1000, // clean up expired sessions every hour
    CacheSessionTimerCleanup: 1 * 60 * 1000, // clean up cookie cache every 30 minutes
    QuerySkip: 0,
    QueryLimit: 10,
    SessionCookie: 'app1_token',

    OneWeek: 7 * 24 * 60 * 60 * 1000, // 1 week of time
    OneDay: 1 * 24 * 60 * 60 * 1000, // 1 week of time
    StartOfDay: 0,
    EndOfDay: 24 * 60,

    AdminCompany: '00000',
    ProductionCompany: '00000',
    ApplicationHome: 'home',

    SecretIterations: 8924,
    SecretByteSize: 256,
    SecretAlgorithm: 'sha512',
    FilesCryptingAlgorithm: 'aes-256-ctr',

    PublicUser: 'public',
    PublicUserFirstName: 'Public',
    PublicUserLastName: 'User',
    UserProfileAdministrator: 'administrator',
    UserProfilePrivate: 'private',
    UserProfileShare: 'share',
    UserProfilePublic: 'public',
    UserProfileApplication: 'application',
    UserProfileAdministratorDefault: {
        list: {
            _company_code: '@@company_code'
        },
        create: {
            _company_code: '@@company_code',
            _user: ['@@user']
        },
        read: {
            _company_code: '@@company_code'
        },
        update: {
            _company_code: '@@company_code'
        },
        delete: {
            _company_code: '@@company_code'
        }
    },
    UserProfilePrivateDefault: {
        list: {
            _company_code: '@@company_code'
        },
        create: {
            _company_code: '@@company_code',
            _user: ['@@user']
        },
        read: {
            _company_code: '@@company_code'
        },
        update: {
            _company_code: '@@company_code'
        },
        delete: {
            _company_code: '@@company_code',
            _user: ['@@reports', '@@user']
        }
    },
    UserProfilePublicDefault: {
        list: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        create: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        read: {
            _company_code: '@@company_code',
            _user: ['@@public']
        },
        update: {
            _company_code: '@@company_code',
            _user: ['@@public']
        }
    },
    UserProfileApplicationTypeDefault: 'default',
    UserProfileApplicationTypePublic: 'public',

    S3_BUCKET: '',
    REGION: '',
    ACCESS_KEY_ID: '',
    SECRET_ACCESS_KEY: '',

    EmailHost: 'smtp.gmail.com',
    EmailPort: '465',
    EmailSSL: true,
    EmailDomain: 'gmail.com',
    EmailAuthentication: 'login',

    ValuesTypeList: 'list',
    ValuesTypeUser: 'user',
    ValuesTypeQuery: 'query',
    ValuesRelationUserManager: 'user_manager',
    ValuesRelationUserReports: 'user_reports',
    ValuesRelationUserList: 'user_list',

    DataModelPrefix: 'datas',
    DataModelUserId: 'userdata',
    DataModelFileId: 'filedata',
    DataModelIndexName: '_search',
    DataModelIndexLanguageOverride: '_none_language',

    MachineLearningMaxTrainingDataPoints: 2000,
    MachineLearningMaxTrainingBatch: 100
}

module.exports = Constants;
