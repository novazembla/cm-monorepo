

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


# The following packages are currently locked to a certain version as compile error make an update impossible

@chakra-ui/react                    1.6.9  1.6.12       1.6.12  node_modules/@chakra-ui/react                  cm-monorepo
@typescript-eslint/eslint-plugin   4.29.3  4.33.0        5.3.0  node_modules/@typescript-eslint/eslint-plugin  cm-monorepo
autoprefixer                        9.8.8   9.8.8       10.4.0  node_modules/autoprefixer                      backend@0.1.0
eslint                             7.32.0  7.32.0        8.1.0  node_modules/eslint                            cm-monorepo
graphql                            15.6.1  15.7.2       16.0.1  packages/api/node_modules/graphql              api@npm:@culturemap/api@0.0.1
graphql-scalars                    1.12.0  1.13.1       1.13.1  node_modules/graphql-scalars                   api@npm:@culturemap/api@0.0.1
maplibre-gl                        1.15.2  1.15.2  2.0.0-pre.1  node_modules/maplibre-gl                       backend@0.1.0
react-router-dom                    5.3.0   5.3.0        6.0.0  node_modules/react-router-dom                  backend@0.1.0