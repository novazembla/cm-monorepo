TODO: so much to do 
TODO: Learn from: https://github.com/belgattitude/nextjs-monorepo-example
                  https://github.com/atlassian/changesets

TODO: Monitor seed issue https://github.com/prisma/prisma/issues/7053 
Would be much nicer to use prisma db seed instead of the 

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







```
npm run install
``` 

before you start to develop