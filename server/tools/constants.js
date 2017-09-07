const Constants = {
    WebAddress: 'app1.cloud',
    MaxSessionTimeout: 14 * 24 * 60 * 60 * 1000, // 2 weeks cookie validity
    MaxSessionPublicTimeout: 15 * 60 * 1000, // 15 minutes cookie validity
    MaxSessionCacheTimeout: 60 * 60 * 1000, // 1 hour cookie cache
    DBSessionTimerCleanup: 60 * 60 * 1000, // clean up expired sessions every hour
    CacheSessionTimerCleanup: 30 * 60 * 1000, // clean up cookie cache every 30 minutes
    QuerySkip: 0,
    QueryLimit: 10,
    SessionCookie: 'app1_token',

    AdminCompany: '00000',
    ProductionCompany: '00000',
    ApplicationHome: 'home',

    SecretKey: 'App1!;ZXC',
    SecretIterations: 8924,
    SecretByteSize: 256,
    SecretAlgorithm: 'sha512',

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
            _user: ['@@user', '@@reports', '@@public']
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

    S3_BUCKET: 'app1data',
    REGION: 'eu-central-1',
    ACCESS_KEY_ID: 'AKIAIYXUGMUVMMXJXR3A',
    SECRET_ACCESS_KEY: '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',

    EmailUserName: 'app1.noreply@gmail.com',
    EmailPassword: 'Admin;App1',
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
    DataModelIndexName: '_search'
}

module.exports = Constants;
