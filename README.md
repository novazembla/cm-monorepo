

#Installation

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

# Environment Variables Backend

Make use to register the following environment variables 
```
REACT_APP_FRONTEND_URL=....
REACT_APP_API_URL=....
REACT_APP_PREVIEW_SECRET=...
```
The PREVIEW_SECRET is shared between between backend and front end and needs to be the same.

# Environment Variables API

Please make sure to register the following environmental variables.

```

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


# The following packages are currently locked to a certain version as compile error make an update impossible

@chakra-ui/react                    1.6.9  1.6.12       1.6.12  node_modules/@chakra-ui/react                  cm-monorepo
@typescript-eslint/eslint-plugin   4.29.3  4.33.0        5.3.0  node_modules/@typescript-eslint/eslint-plugin  cm-monorepo
autoprefixer                        9.8.8   9.8.8       10.4.0  node_modules/autoprefixer                      backend@0.1.0
eslint                             7.32.0  7.32.0        8.1.0  node_modules/eslint                            cm-monorepo
graphql                            15.6.1  15.7.2       16.0.1  packages/api/node_modules/graphql              api@npm:@culturemap/api@0.0.1
graphql-scalars                    1.12.0  1.13.1       1.13.1  node_modules/graphql-scalars                   api@npm:@culturemap/api@0.0.1
maplibre-gl                        1.15.2  1.15.2  2.0.0-pre.1  node_modules/maplibre-gl                       backend@0.1.0
react-router-dom                    5.3.0   5.3.0        6.0.0  node_modules/react-router-dom                  backend@0.1.0