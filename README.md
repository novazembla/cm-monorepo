

#Installation

Don't forget to run the following commands 

# Docker Setup
We support your development with a docker-compose.yml file. It provides two Postgresql instances (development and test), and a [Mailhog](https://github.com/mailhog/MailHog)instance providing a SMTP replacement that allows you to quickly check outgoing emails.

Please ensure that the following folders do exists in your project root

```console
foo@bar:~$ mkdir data
foo@bar:~$ mkdir data/postgres
foo@bar:~$ mkdir data/postgres-test
```

Both databased have to be installed 

```console
foo@bar:~$ npm run package:api:db:push
foo@bar:~$ npm run package:api:test:db:push
```




ln -s /opt/plesk/node/v14.17.5/bin/node /usr/bin/node
ln -s /opt/plesk/node/v14.17.5/bin/npm /usr/bin/npm
ln -s /opt/plesk/node/v14.17.5/bin/npx /usr/bin/npx

psql -d "postgresql://culturemap:culturemap@localhost/culturemap" -c "select now();"

alter user culturemap with encrypted password 'culturemap';

Granting privileges on database


```
npm run install
``` 

before you start to develop


# Environment Variables Backend
REACT_APP_FRONTEND_URL
REACT_APP_API_URL
REACT_APP_PREVIEW_SECRET=xZlkdelGi5KdxcpndXX

# Environment Variables API


# Environment Variables Frontend
PREVIEW_SECRET="xZlkdelGi5KdxcpndXX"
NEXT_PUBLIC_API_GRAPHQL_URL=https://localhost:4002/graphql

