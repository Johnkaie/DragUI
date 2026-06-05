import fs from "fs-extra";
import path from "path";

export const generateFrontend =
async (
  outputDir
) => {

  await fs.ensureDir(
    outputDir
  );

  await fs.writeFile(
    path.join(
      outputDir,
      "App.jsx"
    ),

`export default function App(){
  return <h1>DropUI App</h1>
}`
  );

  return true;
};

export const generateBackend =
async (
  outputDir
) => {

  await fs.ensureDir(
    outputDir
  );

  await fs.writeFile(
    path.join(
      outputDir,
      "server.js"
    ),

`import express from "express";

const app = express();

app.listen(
  5000,
  ()=>console.log("Server Started")
);`
  );

  return true;
};