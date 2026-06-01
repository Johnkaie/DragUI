import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export default function extractProps(code) {
  const props = [];

  try {
    const ast = parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
    });

    traverse.default(ast, {
      FunctionDeclaration(path) {
        const firstParam = path.node.params[0];

        if (
          firstParam &&
          firstParam.type === "ObjectPattern"
        ) {
          firstParam.properties.forEach((prop) => {
            props.push({
              name: prop.key.name,
              label: prop.key.name,
              type: "text",
            });
          });
        }
      },

      ArrowFunctionExpression(path) {
        const firstParam = path.node.params[0];

        if (
          firstParam &&
          firstParam.type === "ObjectPattern"
        ) {
          firstParam.properties.forEach((prop) => {
            props.push({
              name: prop.key.name,
              label: prop.key.name,
              type: "text",
            });
          });
        }
      },
    });

    return props;
  } catch {
    return [];
  }
}