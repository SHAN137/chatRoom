
const exclusionList = require('metro-config/src/defaults/exclusionList');
 module.exports = {
   resolver: {
    //  blacklistRE: exclusionList([/#current-cloud-backend\/.*/]),
    blacklistRE: exclusionList([/backend\/.*/]),
   },
   transformer: {
     getTransformOptions: async () => ({
       transform: {
         experimentalImportSupport: false,
         inlineRequires: false,
       },
     }),
   },
 };
