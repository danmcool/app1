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
    Public_User: "public",
    UserProfileAdministrator: "administrator",
    UserProfilePrivate: "private",
    UserProfileShare: "share",
    UserProfilePublic: "public",

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
