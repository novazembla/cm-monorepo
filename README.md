# Developing the Berlin.de Calendar Import
The import function is implemented using the following two files
```shell
./packages/api/src/scripts/import.berlin.de.calendar.ts
./packages/api/src/workers/importCalendar.ts
```

The first is the implementation. To test it locally you will have to

1. Run the backend in dev mode `npm run dev:backend`
2. Run `npm run app:api:import:dev:events` to trigger the importer manually

# Installation

Don't forget to run the following commands 

# Docker Setup
We support your development with a docker-compose.yml file. It provides a Postgresql instance and a [Mailhog](https://github.com/mailhog/MailHog)instance providing a SMTP replacement that allows you to quickly check outgoing emails.

Please ensure that the following folders do exists in your project root

```console
foo@bar:~$ mkdir data
foo@bar:~$ mkdir data/postgres
```

## Installation
The api and the backend are build for node v.16 (and probably up)

For production install the packages using 

```bash
npm ci 
```

For development use

```bash
npm i 
```

# Database Setup
We are using [Prisma](https://www.prisma.io/) as our ORM. It comes with a basic migration tool. To setup the database just run either 

```console
foo@bar:~$ npx prisma migrate
```

# Backend

## Environment variables

Make use to register the following environment variables (if stored in memory)
```
VITE_FRONTEND_URL=....
VITE_API_URL=....
VITE_PREVIEW_SECRET=...
```

Or if you want to retrieve the values from the .env file you only need to add (all other values will be taken from the API settings)

```
APP_PREVIEW_SECRET=...
```
The PREVIEW_SECRET is shared between between backend and front end and needs to be the same.


## Production
*Build*
```console
foo@bar:~$ npm run app:build:backend <-- if your environment variables are stored in memory
foo@bar:~$ npm run app:build:backend-read-env <-- if your environment variables should be read from the .env file on build time
```


## Development
```console
foo@bar:~$ npm run dev:api
```

# API

## Environment variables

Please make sure to register the following environmental variables.

```
API_PORT=3002
API_HOST=localhost
BASE_URL_FRONTEND=http://localhost:3000
BASE_URL_BACKEND=http://localhost:4001
BASE_URL_API=http://localhost:4002

DATABASE_URL="postgresql://culturemap:culturemap@localhost:5432/culturemap?schema=public&connection_limit=5"

HERE_API_KEY=...

MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_USERNAME=user
MAIL_PASSWORD=password
MAIL_SECURE=false
MAIL_EMAIL_SUBJECT_PREFIX="[TEST NAME]: "
MAIL_FROM_ADDRESS=info@your-project.test
MAIL_FROM_NAME="${APP_NAME}"

# JWT
# JWT secret key
JWT_SECRET=thisis23123--23423afdsa0--casfdsf
# Number of minutes after which an access token expires
JWT_ACCESS_EXPIRATION_MINUTES=15
# Number of days after which a refresh token expires
JWT_REFRESH_EXPIRATION_DAYS=30
# Number of minutes after which a reset password token expires
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=30
# Number of minutes after which a verify email token expires
JWT_VERIFY_EMAIL_EXPIRATION_DAYS=2
```
## Production
*Build*
```console
foo@bar:~$ npm run app:api:build
```

## Development
```console
foo@bar:~$ npm run dev:api
```

# Development
You can also run api and backend dev at the same time 
```console
foo@bar:~$ npm run dev 
```

# The following packages are currently locked to a certain version as compile errors make an update impossible

- @chakra-ui/react                    1.6.9 cm-monorepo
- @typescript-eslint/eslint-plugin   4.29.3 cm-monorepo
- autoprefixer                        9.8.8 backend
- eslint                             7.32.0 cm-monorepo
- graphql                            15.6.1 @culturemap/api
- graphql-scalars                    1.12.0 @culturemap/api
- maplibre-gl                        1.15.2 backend
- react-router-dom                    5.3.0 backend