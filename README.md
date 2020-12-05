# [Ghost](https://ghost.org/) Dockerfile with Custom Helpers support

## tldr:
1. Do `mkdir custom-helpers/{default,async}` directory with your `default/syncHelper.js` or `async/asyncHelper.js` hbs helpers
2. Make sure a `custom-helpers/` directory is copied into the containers working directory (`COPY custom-helpers custom-helpers` or mount via `-v` flag)
3. Run it and use your helpers in your template from now on.


## More details:

The problem with the current Ghost 3.x version is that it not only does not have any interface for adding custom template helpers
but it also prevents you from manipulating it by its dependency `gscan` which will check if you are ONLY using official Ghost helpers - if not: page throws an error.

This image fixes this by copying over the custom-helpers to the official ghost installation, registering them and also putting them to the `knownHelpers` in `gscan` therefore making it valid.

For details of the implementation feel free to checkout https://github.com/activenode/ghost-docker-custom-helpers

## tldr Usage:

### Creating a `myName.js` helper

```js
// filename = myName.js - do NOT use dashes since they are not valid function names
// and therefore also not valid filenames here!
module.exports = function myName(options) {
    return 'hello there';
};
```

### In Dockerfile:

```Dockerfile
FROM activenode/ghost-docker-custom-helpers:latest
```

if you want to run your own scripts before startup of Ghost do the following:

```Dockerfile
FROM activenode/ghost-docker-custom-helpers:latest

# this tells the script that it should run a before.sh file before startup
ENV EXECUTE_BEFORE_STARTUP before.sh
COPY . .
```

### `docker run`

```
docker run --publish 8000:10000 --detach -v /HOST/content:/var/lib/ghost/content -v /HOST/custom-helpers:/var/lib/ghost/custom-helpers activenode/ghost-docker-custom-helpers:latest
```