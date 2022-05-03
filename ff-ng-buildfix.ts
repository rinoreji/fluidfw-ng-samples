// This is a dummy file to fix the build issues with FluidFramework which is using node dependencies. 
// see link to this file in tsconfig.json

/**

BREAKING CHANGE: webpack < 5 used to include polyfills for node.js core modules by default.
This is no longer the case. Verify if you need this module and configure a polyfill for it.

If you want to include a polyfill, you need to:
        - add a fallback 'resolve.fallback: { "url": require.resolve("url/") }'
        - install 'url'
If you don't want to include a polyfill, you can use an empty module like this:
        resolve.fallback: { "url": false }

 */