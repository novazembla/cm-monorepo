
TODO: Solve the need for a custom config file the the admin tool... Maybe load more settings from the api? 

TODO: Change to use apollo cache: https://www.apollographql.com/blog/apollo-client/caching/when-to-use-refetch-queries/

TODO: UserProfile
- User should be able to self delete if registration is switched on 


TODO: AdminTable
- is using (... as any)
- should be having batch processing
- should be having a "owner" or "role" filter above the table 
- on pagination table should probably scroll to top, right? 
- filter input could have a clear button if something has been entered
- is there a way to return to default if module is loaded via main navigation ... 
- useRef with the table header is caching the AppUser changes to the user will not be reflected by the future evaluation of the permissions
- Mouse over of row does not look too nice in firefox

TODO: Taxonomy
- Change of taxonomy to module relations need also to remove connected terms to items ... 

TODO: CSS
- Nicer action bar on mobile phones
- Select options ugly in FF
- Expose scroll bar width as a variable 

TODO: Events
- Optimize Event Date Table on Mobile CSS
- Validation of event dates, begin needs to be < than end


TODO: NPM Packages
- react-icons had missing fonts, for now I've install a clone of the project "@hacknug/react-icons/ri" to use the icons in the editor
monitor if you can switch back to the original one in a few month https://github.com/react-icons/react-icons/issues/446 

Installation
Important to mention to clone src/config/appconfig.example.ts to src/config/appconfig.ts and to fill in the required settings .. 

Search MySQL does a loow since a few versions a smart search mode for text
https://dev.mysql.com/doc/refman/5.7/en/fulltext-natural-language.html

Magic Links Authentication
https://medium.com/@aleksandrasays/sending-magic-links-with-nodejs-765a8686996


Accessibility
Install and use https://web.dev/accessibility-auditing-react/ AXE in Testing ...

WYSIWYG
https://draftjs.org/


GIT SUB MODULE 
- Would it be possible to pull one of the two API or APP into the dev project by using a sub-module 

https://stackoverflow.com/questions/38784922/getting-npm-modules-in-node-modules-under-git-control

https://classic.yarnpkg.com/blog/2017/08/02/introducing-workspaces/

https://classic.yarnpkg.com/en/docs/workspaces/

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


