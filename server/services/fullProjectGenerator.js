import {
 generateReactPage
}
from "./frontendGenerator.js";

import {
 generateRoute
}
from "./backendGenerator.js";

import {
 generateModel
}
from "./modelGenerator.js";

export const buildFullProject =
async (
 blueprint
) => {

 const frontend = [];

 const backend = [];

 const database = [];

 for (
  const page
  of blueprint.frontend
 ) {

  const code =
  await generateReactPage(
   page.name,
   page.description
  );

  frontend.push({

   name:
   page.name,

   path:
   `src/pages/${page.name}.jsx`,

   code
  });

 }

 for (
  const route
  of blueprint.backend
 ) {

  const code =
  await generateRoute(
   route.name
  );

  backend.push({

   name:
   route.name,

   path:
   `routes/${route.name}.js`,

   code
  });

 }

 for (
  const model
  of blueprint.database
 ) {

  const code =
  await generateModel(
   model.name,
   model.fields
  );

  database.push({

   name:
   model.name,

   path:
   `models/${model.name}.js`,

   code
  });

 }

 return {

  frontend,

  backend,

  database
 };

};