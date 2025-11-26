## how to add new superBrand in Sponic Space?

1. add config JSON files
   a. public\config\demoServer\brandname.json -eg. public\config\demoServer\vodafone.json
   b. public\config\productionServer\brandname.json
   c. public\config\stageServer\brandname.json

2. add assets in branding folder (src\branding\brandname) -eg. src\branding\vodafone

3. add superBrand in brandConstants file (src\common\utils\brandConstants.js)

4. env file changes :
   a. add superBrand domains in domainsSettings (REACT_APP_BRANDNAME_DOMAINS) eg- REACT_APP_VODAFONE_DOMAINS
   b. add superBrandId in commonSettings (REACT_APP_BRANDNAME_DOMAINS) eg- REACT_APP_BRAND_ID_VODAFONE
   c. add voice api key (REACT_APP_API_TTS_API_KEY_BRANDNAME) eg- REACT_APP_API_TTS_API_KEY_SONICSPACE

   note: In env file superBrand name must be in uppercase.
   example: suppose new superBrand added Vodafone. We'll create a folder inside src/branding named as vodafone (src\branding\vodafone) (suggested in lowercase), then add suffix as uppercase of that folder name that is VODAFONE -eg. REACT_APP_API_TTS_API_KEY_SONICSPACE,REACT_APP_BRAND_ID_VODAFONE,REACT_APP_VODAFONE_DOMAINS etc.

5. add brandname condition in src\utils\getSuperBrandName.js
