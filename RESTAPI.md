Login command

*	Request URL: https://app1.digital/authentication/login
*	Request Method: POST
*	Request Payload : {"user":"adminapp1@easy.com","password":"Start123"}
*	Response :
```
{
  "token": "5b5ae1ccb25ae8bb19fab92e",
  "user": {
    "_id": "58b5ed6833d1262f448e6bb4",
    "user": "adminapp1@easy.com",
    "_company_code": "demo1",
    "email": "adminapp1@easy.com",
    "firstname": "Admin",
    "lastname": "Demo",
    "properties": {
      "theme": "default",
      "language": "fr",
      "app_score": {
        "58209e223ee6583658eceedb": 75,
        "58223c8dfaa281219c13beaf": 75,
        "586bbda98983994e00fc9757": 75,
        "584185e59b20a92dd877ee9f": 75
      }
    },
    "company": {
      "_id": "58b87bf651edbb381c36e8ac",
      "name": "Cloud Ltd",
      "_company_code": "demo1",
      "__v": 0,
      "properties": {
        "logo_url": "http://www.publicis.com/typo3conf/ext/pww_templates/Resources/Public/images/Publicis_Worldwide_logo.png",
        "description": "Hello ! Bonjour ! Guten Tag ! Ciao ! Hola ! Kon-nichiwa ! Nei Ho !",
        "saml": {}
      },
      "_created_at": "2018-07-27T09:11:40.345Z",
      "_updated_at": "2017-03-02T20:09:26.275Z",
      "applications": [
        "58223c8dfaa281219c13beaf",
        "582b981f6c2db903cce2dbdf",
        "586bbda98983994e00fc9757",
        "58d4f5e4009d6c317864bf36",
        "58d522863c82531a1c9f22f9",
        "58d7cc4fffd112317c577509",
        "584185e59b20a92dd877ee9f",
        "58209e223ee6583658eceedb"
      ]
    },
    "profile": {
      "_id": "58b5ed3d33d1262f448e6bb2",
      "name": {
        "en": "Administrator"
      },
      "_company_code": "demo1",
      "__v": 0,
      "type": "administrator",
      "_created_at": "2018-07-27T09:11:40.345Z",
      "_updated_at": "2017-02-28T21:35:57.277Z"
    },
    "reports": [],
    "remote_applications": [],
    "remote_profiles": []
  }
}
```

Login command
*	Request URL: https://app1.digital/authentication/login?pid=5b68155f19e6a544a2280542
*	Request Method: GET
*	Response :
```
{
  "token": "5b68158eb25ae8bb19fd66a5",
  "user": {
    "_id": "5b646bdf8bca6160b0bec05b",
    "user": "public@demo1",
    "_company_code": "demo1",
    "email": "adminapp1@easy.com",
    "firstname": "Public",
    "lastname": "User",
    "company": {
      "_id": "58b87bf651edbb381c36e8ac",
      "name": "Cloud Ltd",
      "_company_code": "demo1",
      "__v": 0,
      "properties": {
        "logo_url": "http://www.publicis.com/typo3conf/ext/pww_templates/Resources/Public/images/Publicis_Worldwide_logo.png",
        "description": "Hello ! Bonjour ! Guten Tag ! Ciao ! Hola ! Kon-nichiwa ! Nei Ho !",
        "saml": {}
      },
      "_created_at": "2018-08-06T09:32:17.061Z",
      "_updated_at": "2017-03-02T20:09:26.275Z",
      "applications": [
        "58223c8dfaa281219c13beaf",
        "582b981f6c2db903cce2dbdf",
        "586bbda98983994e00fc9757",
        "58d4f5e4009d6c317864bf36",
        "58d522863c82531a1c9f22f9",
        "58d7cc4fffd112317c577509",
        "584185e59b20a92dd877ee9f",
        "58209e223ee6583658eceedb",
        "5b641f0dd0946d7e287ede3f"
      ]
    },
    "profile": {
      "_id": "5b64699aefb4965b1b41a3c3",
      "name": {
        "en": "Public"
      },
      "_company_code": "demo1",
      "__v": 0,
      "type": "public",
      "_created_at": "2018-08-03T14:41:30.544Z",
      "_updated_at": "2018-08-03T14:41:30.544Z"
    },
    "reports": [],
    "remote_applications": [],
    "remote_profiles": [
      {
        "_id": "5b68155f19e6a544a2280542",
        "name": {
          "en": "Share"
        },
        "profile": {
          "applications": {
            "5b641f0dd0946d7e287ede3f": {
              "workflows": {
                "5b643e96d0946d7e287ede42": true
              }
            }
          },
          "datamodels": {
            "5b5a1605e65a093a51156ecf": {
              "read": {
                "_company_code": "demo1"
              }
            }
          }
        },
        "properties": {
          "user": "public"
        },
        "type": "share",
        "_company_code": "demo1",
        "__v": 0,
        "_created_at": "2018-08-06T09:31:11.997Z",
        "_updated_at": "2018-08-06T09:31:11.997Z"
      }
    ]
  },
  "application_id": "5b641f0dd0946d7e287ede3f",
  "workflow_id": "5b643e96d0946d7e287ede42",
  "startup_form": "5b643ed5d0946d7e287ede43"
}
```

Logout command
*	Request URL: https://app1.digital/authentication/logout
*	Request Method: GET
*	Request Payload : 
*	Response : 

Status command
*	Request URL : https://app1.digital/authentication/status
*	Request Method : GET
*	Request Payload : 
*	Response :
```
{"token":"5b603275b25ae8bb19fbcbf7","user":{"_id":"58b5ed6833d1262f448e6bb4","user":"adminapp1@easy.com","_company_code":"demo1","email":"adminapp1@easy.com","firstname":"Admin","lastname":"Demo","properties":{"theme":"default","language":"fr","app_score":{"58209e223ee6583658eceedb":75,"58223c8dfaa281219c13beaf":75,"586bbda98983994e00fc9757":75,"584185e59b20a92dd877ee9f":75},"correctedLanguage":"en","uiLanguage":"auto"},"company":{"_id":"58b87bf651edbb381c36e8ac","name":"Cloud Ltd","_company_code":"demo1","__v":0,"properties":{"logo_url":"http://www.publicis.com/typo3conf/ext/pww_templates/Resources/Public/images/Publicis_Worldwide_logo.png","description":"Hello ! Bonjour ! Guten Tag ! Ciao ! Hola ! Kon-nichiwa ! Nei Ho !","saml":{}},"_created_at":"2018-07-31T09:57:09.547Z","_updated_at":"2017-03-02T20:09:26.275Z","applications":["58223c8dfaa281219c13beaf","582b981f6c2db903cce2dbdf","586bbda98983994e00fc9757","58d4f5e4009d6c317864bf36","58d522863c82531a1c9f22f9","58d7cc4fffd112317c577509","584185e59b20a92dd877ee9f","58209e223ee6583658eceedb"]},"profile":{"_id":"58b5ed3d33d1262f448e6bb2","name":{"en":"Administrator"},"_company_code":"demo1","__v":0,"type":"administrator","_created_at":"2018-07-31T09:57:09.547Z","_updated_at":"2017-02-28T21:35:57.277Z"},"reports":[],"remote_applications":[],"remote_profiles":[]}}
```

Register to an existing company command; use this command to add an user the an existing company; sid : specifies the token of a connected user of the corresponding company; properties.extra : can contain any additional or custom properties of the user
*	Request URL: https://app1.digital/authentication/register_company
*	Request Method: POST
*	Request Payload :
```
{"sid":"5b603c56b25ae8bb19fbce0b","firstname":"xxx","lastname":"yyy","email":"ttt7@@gmail.com","properties":{"extra":{"type":"coworker","color":"blue"}}}
*	Response : {"msg":"Registration: please check your email inbox to validate the registration!"}
```

Create data command; add data model id to the URL
*	Request URL: https://app1.digital/client/data/58403392cc33781c8cc5c2d5
*	Request Method : POST
*	Request Payload :
```
{"project":"Test 1","start_date":"2018-07-22T22:00:00.000Z","end_date":"2018-07-26T22:00:00.000Z","time":{"value":40,"currency":"0"},"description":"New project for the office website","status":"1"}
*	Response : {"msg":"Data: entry created!","_id":"5b5ae434e65a093a51156ed7"}
```

Get data command; add data model id and object id to the URL; populate : specifies the references from object’s definition that have to be loaded (list of field names space separated); search_criteria : specifies a “MongoDB” like query for filtering data on the DB (json formatted string with field names and the type of conditions) : {"project":{"$eq":"Test 1"}}
*	Request URL : https://app1.digital/client/data/58403392cc33781c8cc5c2d5/5b5ae434e65a093a51156ed7?populate=&search_criteria=
*	Request Method : GET
*	Request Payload : 
*	Response :
```
{"_id":"5b5ae434e65a093a51156ed7","_user":"58b5ed6833d1262f448e6bb4","project":"Test 1","start_date":"2018-07-22T22:00:00.000Z","end_date":"2018-07-26T22:00:00.000Z","description":"New project for the office website","status":"1","_created_at":"2018-07-27T09:21:56.776Z","_updated_at":"2018-07-27T09:21:56.776Z","_company_code":"demo1","__v":0,"time":{"value":40,"currency":"0"}}
```

List data command; limit : specifies the maximum number of objects returned; skip : specifies the number of objects skipped from the beginning of the query; sorty_by : specifies a “MongoDB” like sort by clause (json formatted string with field name and the type of sorting) : {"_updated_at":"descending"}; search_criteria : specifies a “MongoDB” like query for filtering data on the DB (json formatted string with field names and the type of conditions) : {"status":{"$eq":"1"}}; search_text : specifies a string containing the search words
*	Request URL : https://app1.digital/client/data/58403392cc33781c8cc5c2d5?limit=10&search_criteria=%7B%22status%22:%7B%22$eq%22:%221%22%7D%7D&search_text=&skip=0&sort_by=%7B%22_updated_at%22:%22descending%22%7D
*	Request Method : GET
*	Request Payload : 
*	Response :
```
[{"_id":"5b5ae434e65a093a51156ed7","_user":"58b5ed6833d1262f448e6bb4","project":"Test 1","start_date":"2018-07-22T22:00:00.000Z","end_date":"2018-07-26T22:00:00.000Z","description":"New project for the office website","status":"1","_created_at":"2018-07-27T09:21:56.776Z","_updated_at":"2018-07-27T09:21:56.776Z","_company_code":"demo1","__v":0,"time":{"value":40,"currency":"0"}}]
```

File object creation; this API will create a file object, and provide a file upload URL that has to be used to upload the file (url value from the result)
*	Request URL : https://app1.digital/client/file
*	Request Method : POST
*	Request Payload : {name: "Superpiki2_Adria-1024x592.jpg", type: "image/jpeg"}
*	Response :
```
{"file":{"__v":0,"name":"Superpiki2_Adria-1024x592.jpg","type":"image/jpeg","_company_code":"demo1","_id":"5b7152fd19e6a544a2280548","_created_at":"2018-08-13T09:44:29.636Z","_updated_at":"2018-08-13T09:44:29.636Z"},"url":"/client/file/upload/demo1/5b7152fd19e6a544a2280548"}
```

File upload; this API will upload a file once the file object having been created
*	Request URL : https://app1.digital/client/file/upload/demo1/5b7152fd19e6a544a2280548
*	Request Method : PUT
*	Request Payload : 
*	Response : 

File delete; this API will remove a file object and its underlaying file 
*	Request URL : https://app1.digital/client/file/5b7152fd19e6a544a2280548
*	Request Method : DELETE
*	Request Payload : 
*	Response : {"msg":"File has been deleted!"}

File download; this API will download a file
*	Request URL : https://app1.digital/client/file/5b71552519e6a544a2280549
*	Request Method : GET
*	Request Payload : 
*	Response : Binary file data
