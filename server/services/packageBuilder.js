import archiver from "archiver";
import fs from "fs";
import path from "path";

export const buildPackage =
async (
 project
) => {

 const outputPath =
 path.join(
  process.cwd(),
  "exports",
  `${project.projectId}.zip`
 );

 if(
  !fs.existsSync(
   path.dirname(
    outputPath
   )
  )
 ){
  fs.mkdirSync(
   path.dirname(
    outputPath
   ),
   {
    recursive:true
   }
  );
 }

 return new Promise(
 (
  resolve,
  reject
 ) => {

  const output =
   fs.createWriteStream(
    outputPath
   );

  const archive =
   archiver(
    "zip",
    {
     zlib:{
      level:9
     }
    }
   );

  output.on(
   "close",
   () => resolve(
    outputPath
   )
  );

  archive.on(
   "error",
   reject
  );

  archive.pipe(
   output
  );

  project.files.forEach(
   (
    file
   ) => {

    archive.append(
     file.code,
     {
      name:
      file.path
     }
    );

   }
  );

  archive.finalize();
 });

};