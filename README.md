# NoCode Application Development As A Service Framework (App1)

## What is it?
App1 is an open-source framework designed to build NoCode Applications as a Service (NaaS) infrastructure. It enables end-users to create, modify, and share applications, model underlying data, and manage workflows directly through a web browser on mobile, tablet, or desktop devices.

The framework handles core development tasks, allowing you to focus on business logic:
* **Application Lifecycle & Design**: Managed through a responsive user interface.
* **Data Modeling**: Flexible modeling of underlying data structures.
* **Security**: Includes file encryption and performant session management.
* **Integration**: Features SAML for enterprise connections and a full Rest API.
* **Machine Learning**: Integration with Brain.JS for training and implementing models into workflows.



## Module Architecture

The App1 framework is divided into two primary modules: the **Server** (backend) and the **Client** (frontend).

### Server Module
The Server is the core backend engine built with **Node.js** and **Express**. It manages the heavy lifting of the framework, including:
* **Database Management**: Connects to MongoDB to store and retrieve application metadata and user data.
* **Security & Authentication**: Implements secure session management and handles user authentication via local credentials or SAML.
* **REST API**: Exposes the functional endpoints for data manipulation, file management, and application configuration.
* **File Processing**: Manages file object creation, uploads, and downloads.
* **Service Initialization**: Configures environment variables for database, email, and security settings during startup.

### Client Module
The Client is the frontend web application that provides the visual interface for users. It is built using **AngularJS** and **Material Design** components to ensure a responsive experience across devices. Key sub-modules include:
* **Core**: Handles fundamental UI logic like user profiles, login/registration, and workflow navigation.
* **Designer**: A visual NoCode environment where administrators can create forms, define application workflows, and set security profiles.
* **Data Modeler**: A tool for administrators to define and modify the underlying data structures without writing database queries.
* **Machine Learning UI**: Provides an interface for end-users to train and deploy ML models using existing application data.

## Basics of App1 Applications
Applications in App1 are structured into **workflows**; each workflow contains a list of **forms**. These forms serve as an interpretation of the underlying data, supporting read mode, write mode, or a combination of both.

## Most Common Use Cases
* Public forms for data input.
* Secure file sharing between enterprises.
* External validation workflows and internal applications (e.g., car sharing, event management).
* Complex registration systems for websites.

## Installation
Ensure you have Node.js installed. Clone the repository and install the required dependencies:
```bash
npm install
```

## How to Run

The framework requires several environment variables to be set before starting the server. Below is an example of the command line sequence to deploy the application:

```bash
# Set required environment variables
export APP1_SERVER_NAME='xxx.com'
export APP1_DB_PASSWORD='xxxxxxx'
export APP1_DB_ADDRESS='127.0.0.1'
export APP1_DB_PORT='55055'
export APP1_EMAIL_USERNAME='contact@xxx.com'
export APP1_EMAIL_PASSWORD='xxxxx;'
export APP1_SECRET_KEY='xx:01010:yy'

# Server-specific requirements
export APP1_DEFAULT_APP='your_default_app_id'
export APP1_ADMIN_PROFILE='your_admin_profile_id'

# Start the server in a detached screen session
screen -dmS node nodemon server/server.js
screen -R
```


# App1 REST API Documentation

## 1. Authentication APIs

### Login (Standard)
* **URL**: `/authentication/login`
* **Method**: `POST`
* **Payload**: `{"user":"email@example.com","password":"yourpassword"}`
* **Response**: Returns a session `token` and detailed `user` object including company and profile metadata.

### Login (Public/Shared)
* **URL**: `/authentication/login?pid=[PROFILE_ID]`
* **Method**: `GET`
* **Description**: Used for public or shared access profiles.

### Status
* **URL**: `/authentication/status`
* **Method**: `GET`
* **Description**: Returns the current session status and user information.

### Logout
* **URL**: `/authentication/logout`
* **Method**: `GET`

### Register to Company
* **URL**: `/authentication/register_company`
* **Method**: `POST`
* **Payload**: Includes `sid` (token of a connected user), user details, and custom `properties.extra`.

## 2. Data Management APIs

### Create Data
* **URL**: `/client/data/[DATA_MODEL_ID]`
* **Method**: `POST`
* **Payload**: JSON object representing the data entry (e.g., project name, dates, status).

### Get Data Entry
* **URL**: `/client/data/[DATA_MODEL_ID]/[OBJECT_ID]`
* **Method**: `GET`
* **Parameters**: 
    * `populate`: Space-separated field names to load references.
    * `search_criteria`: MongoDB-style JSON filter (e.g., `{"project":{"$eq":"Test 1"}}`).

### List Data
* **URL**: `/client/data/[DATA_MODEL_ID]`
* **Method**: `GET`
* **Parameters**: `limit`, `skip`, `sort_by`, `search_criteria`, and `search_text`.

## 3. File Management APIs

### Create File Object
* **URL**: `/client/file`
* **Method**: `POST`
* **Payload**: `{ "name": "filename.jpg", "type": "image/jpeg" }`
* **Response**: Provides a `file` object and a unique `url` for the actual upload.

### Upload File
* **URL**: `[URL_FROM_CREATE_FILE_STEP]`
* **Method**: `PUT`
* **Description**: Uploads the binary data to the reserved file object.

### Download File
* **URL**: `/client/file/[FILE_ID]`
* **Method**: `GET`
* **Response**: Binary file data.

### Delete File
* **URL**: `/client/file/[FILE_ID]`
* **Method**: `DELETE`
* **Response**: `{"msg":"File has been deleted!"}`.
