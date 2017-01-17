const Constants = {
    WebAddress: "app1.cloud",
    MaxSessionTimeout: 1209600000,
    QuerySkip: 0,
    QueryLimit: 10,
    SessionCookie: 'app1_token',

    AdminCompany: "00000",
    ProductionCompany: "00000",
    ApplicationHome: "home",

    InitialPassword: "Start123",
    InitialPasswordHash: "cd769ac44d0eb8da97157c91e0770aea5298ca49c9199bd5bdbe985e695aeb18b54390c59e6137b9956d71b9bb67b002fefaaae7ab52e773a15e6da5128293bd6c5f7fee448cf6da55ae65bc41e196e05bef7ebc62e08b4aa2bce14aebdcb8ef0918172558755029d4bef916802c3dc8ab72acae19fa544b8b6ccdc905bcc1fb3ec5315b21aab9ed1fe73d5a4102057dca60eb59c00792374b7f56fd8694dedd394f8093956972d7224afce5d6238896cfa6dd02e183e7f336a4e445b4872a77e81ed97966f5d3192f0755d4b1963bee4d027c2f42990dfb627e2c152a850943851fe945a298d19c5e7db4e3793e053e2e38fd21da3e8fc78b92058162e90e7f",
    SecretKey: "App1!;ZXC",
    SecretIterations: 8924,
    SecretByteSize: 256,
    SecretAlgorithm:  "sha512",

    Public_User: "public",
    UserProfileAdministrator: "administrator",
    UserProfilePrivate: "private",
    UserProfileShare: "share",
    UserProfilePublic: "public",
    UserProfileAdministratorDefault: {
        list: {
            _company_code: "@@company_code"
        },
        create: {
            _company_code: "@@company_code",
            user: ["@@user"]
        },
        read: {
            _company_code: "@@company_code"
        },
        update: {
            _company_code: "@@company_code"
        },
        delete: {
            _company_code: "@@company_code"
        }
    },
    UserProfilePrivateDefault: {
        list: {
            _company_code: "@@company_code",
            user: ["@@user", "@@reports", "@@public"]
        },
        create: {
            _company_code: "@@company_code",
            user: ["@@user"]
        },
        read: {
            _company_code: "@@company_code",
            user: ["@@user", "@@reports", "@@public"]
        },
        update: {
            _company_code: "@@company_code",
            user: ["@@user", "@@reports", "@@public"]
        },
        delete: {
            _company_code: "@@company_code",
            user: ["@@user", "@@reports", "@@public"]
        }
    },
    UserProfilePublicDefault: {
        list: {
            _company_code: "@@company_code",
            user: ["@@public"]
        },
        create: {
            _company_code: "@@company_code",
            user: ["@@public"]
        },
        read: {
            _company_code: "@@company_code",
            user: ["@@public"]
        },
        update: {
            _company_code: "@@company_code",
            user: ["@@public"]
        }
    },

    S3_BUCKET: "app1data",
    REGION: "eu-central-1",
    ACCESS_KEY_ID: "AKIAIYXUGMUVMMXJXR3A",
    SECRET_ACCESS_KEY: "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",

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
    ValuesRelationUserList: 'user_list'
}

module.exports = Constants;
