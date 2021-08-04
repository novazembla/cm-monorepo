TODO: Scroll to (first) form error ... 
TODO: Is it possible to pause/queue apollo requests until the refresh action has come through? 
      And fail all of if the refresh didn't come through .. 


TODO: Change to use apollo cache: https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/
TODO: Study: https://github.com/sindresorhus/type-fest

Installation
Important to mention to clone src/config/appconfig.example.ts to src/config/appconfig.ts and to fill in the required settings .. 


monmitor is dirty and block back if data has been added ... 


Choc UI 

https://github.com/anubra266/choc-ui




Does the server need compression? 


PM2 Integration 

JWT 
https://kettan007.medium.com/json-web-token-jwt-in-node-js-implementing-using-refresh-token-90e24e046cf8


APP
- Loading Screen 
- Transition on page change (at least animate somethign)


Search MySQL does a loow since a few versions a smart search mode for text
https://dev.mysql.com/doc/refman/5.7/en/fulltext-natural-language.html

Magic Links Authentication
https://medium.com/@aleksandrasays/sending-magic-links-with-nodejs-765a8686996


Accessiblity
Install and use https://web.dev/accessibility-auditing-react/ AXE in Testing ...

WYSIWYG
https://draftjs.org/


GIT SUB MODULE 
- Would it be possible to pull one of the two API or APP into the dev project by using a sub-module 

https://stackoverflow.com/questions/38784922/getting-npm-modules-in-node-modules-under-git-control

https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/

https://classic.yarnpkg.com/en/docs/workspaces/

https://github.com/lerna/lerna

https://www.robinwieruch.de/react-internationalization
Extract translations: https://react.i18next.com/guides/extracting-translations, https://www.i18next.com/overview/plugins-and-utils#extraction-tools


INTERNATIONALIZATION
- Is it smart to inline translation.json or worth to that a backend to load dynamically?
- Persist user setting ... 
- Browser detection: https://github.com/i18next/i18next-browser-languageDetector


Maybe Use 
https://npm.io/package/clsx


# Caveats

## Content Security Policy CSP TODO: still valid?
The API is enfocing full CSP which collides with inline scripts. We will force the create react app to not inline any scripts into the index.html by setting INLINE_RUNTIME_CHUNK=false
in package.json

https://create-react-app.dev/docs/advanced-configuration/


## Craco
As we are using Tailwind CSS for the app we needed to overwrite built in postcss/webpack configs. To be able to do that we've chosen https://github.com/gsoft-inc/craco


