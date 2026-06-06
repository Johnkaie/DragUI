const IMPORT_REGEX =
/from\s+['"]([^'"]+)['"]/g;

export const resolveDependencies =
(code = "") => {

 const dependencies =
 [];

 let match;

 while (
  (
   match =
    IMPORT_REGEX.exec(
      code
    )
  ) !== null
 ) {

  const dep =
   match[1];

  if (
   dep.startsWith(".")
  ) continue;

  dependencies.push(
   dep
  );
 }

 return [
  ...new Set(
   dependencies
  )
 ];
};