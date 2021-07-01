# CultureMaps API

TODO: write short desription, what does it do? How to you develop, test, run it.

Prisma, 
GraphQL

## Prisma

We're using [Prisma](https://prisma.io) as database connection layer. Most likely you'll want to use the following commands. 

```bash
# During development (to initialize and/or after you've made changes)
# If you're using docker you'll have to make sure to run in in the CultureMapAPI container
# !!! WARNING !!! This will reset your data
npx prisma migrate dev

# fix ESLint errors
xxx complete

# run prettier
yarn prettier

# fix prettier errors
yarn prettier:fix
```

## License

[MIT](LICENSE)
