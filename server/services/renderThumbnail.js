import fs from "fs-extra";
import path from "path";
import { chromium } from "playwright";

import cloudinary from "../config/cloudinary.js";

const TEMPLATE = (code) => `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8" />

<script src="https://cdn.tailwindcss.com"></script>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>

<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>

<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

<style>

body{
  margin:0;
  padding:0;
  width:1200px;
  height:630px;

  display:flex;
  justify-content:center;
  align-items:center;

  background:#0f172a;
}

#root{
  width:100%;
  height:100%;

  display:flex;
  justify-content:center;
  align-items:center;
}

</style>

</head>

<body>

<div id="root"></div>

<script type="text/babel">

${code}

const root =
ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  React.createElement(
    typeof App !== "undefined"
      ? App
      : (() => (
        <div
          style={{
            color:"white"
          }}
        >
          Preview
        </div>
      ))
  )
);

</script>

</body>
</html>
`;

export const renderThumbnail =
async (
 component
) => {

 try {

   const tempDir =
     path.join(
       process.cwd(),
       "temp"
     );

   const thumbDir =
     path.join(
       process.cwd(),
       "thumbnails"
     );

   await fs.ensureDir(
     tempDir
   );

   await fs.ensureDir(
     thumbDir
   );

   const htmlPath =
     path.join(
       tempDir,
       `${component.slug}.html`
     );

   const imagePath =
     path.join(
       thumbDir,
       `${component.slug}.png`
     );

   await fs.writeFile(
     htmlPath,
     TEMPLATE(
       component.code
     )
   );

   const browser =
     await chromium.launch();

   const page =
     await browser.newPage({
       viewport:{
         width:1200,
         height:630
       }
     });

   await page.goto(
     `file://${htmlPath}`
   );

   await page.screenshot({
     path:imagePath
   });

   await browser.close();

   const uploaded =
     await cloudinary.uploader.upload(
       imagePath,
       {
         folder:
           "dropui-thumbnails"
       }
     );

   return {
     url:
       uploaded.secure_url,

     publicId:
       uploaded.public_id
   };

 } catch(error){

   console.error(
     error
   );

   return null;

 }

};