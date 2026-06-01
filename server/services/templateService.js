import fs from "fs";
import path from "path";

export const saveTemplate = async ({
  type,
  name,
  code,
}) => {
  const dir = path.join(
    process.cwd(),
    "templates",
    type,
    name
  );

  fs.mkdirSync(dir, {
    recursive: true,
  });

  const filePath = path.join(
    dir,
    `${name}.jsx`
  );

  fs.writeFileSync(filePath, code);

  return {
    path: `${type}/${name}`,
    filePath,
  };
};