export function generateCode(tree) {
  let imports = new Set();

  // CSS-only properties that should go in style, not as attributes
  const CSS_STYLE_KEYS = new Set([
    "color",
    "background",
    "backgroundColor",
    "fontSize",
    "textAlign",
    "fontWeight",
    "fontStyle",
    "letterSpacing",
    "lineHeight",
    "padding",
    "margin",
    "width",
    "height",
    "minWidth",
    "maxWidth",
    "minHeight",
    "maxHeight",
    "display",
    "gap",
    "flexDirection",
    "justifyContent",
    "alignItems",
    "alignContent",
    "flexWrap",
    "position",
    "top",
    "right",
    "bottom",
    "left",
    "zIndex",
    "overflow",
    "overflowX",
    "overflowY",
    "border",
    "borderRadius",
    "boxShadow",
  ]);

  function sanitizeName(name) {
    let safe = String(name || '').trim().replace(/[^A-Za-z0-9_$]/g, '_');
    if (/^[0-9]/.test(safe)) safe = `_${safe}`;
    if (!safe) safe = 'CustomComponent';
    return safe;
  }

  function getComponentName(code) {
    const functionMatch = code.match(/(?:export\s+default\s+function|export\s+function|function)\s+([A-Za-z0-9_]+)/);
    const constMatch = code.match(/(?:export\s+const|const)\s+([A-Za-z0-9_]+)\s*=/);
    const arrowMatch = code.match(/(?:export\s+const|const)?\s*([A-Za-z0-9_]+)\s*=\s*\(.*\)\s*=>/);
    return (functionMatch || constMatch || arrowMatch)?.[1] || null;
  }

  function collectTemplates(node, map = new Map()) {
    if (!node) return map;
    if (Array.isArray(node)) {
      node.forEach((child) => collectTemplates(child, map));
      return map;
    }
    if (node.template && !map.has(node.type)) {
      map.set(node.type, node.template);
    }
    node.children?.forEach((child) => collectTemplates(child, map));
    return map;
  }

  function normalizeTemplateDefinition(type, template) {
    const safeName = sanitizeName(type);
    const raw = template.trim();
    const cleaned = raw.replace(/\bexport\s+(default\s+)?/, "");
    const originalName = getComponentName(cleaned);

    if (originalName && cleaned.includes(originalName)) {
      if (originalName === safeName) {
        return cleaned;
      }
      return `${cleaned}\n\nconst ${safeName} = (props) => <${originalName} {...props} />;`;
    }

    if (cleaned.startsWith("<")) {
      return `const ${safeName} = (props) => (${cleaned});`;
    }

    return `const ${safeName} = (props) => (${cleaned});`;
  }

  function buildTemplateDefinitions(templateMap) {
    return [...templateMap.entries()]
      .map(([type, template]) => normalizeTemplateDefinition(type, template))
      .join('\n\n');
  }

  function renderNode(node, templateMap) {
    if (!node) return "";

    const children = node.children?.map((child) => renderNode(child, templateMap)).join("\n") || "";
    const styleProps = getStyleObject(node.props);
    const styleAttr = styleProps ? ` style={${styleProps}}` : "";
    const classAttr = node.props?.className ? ` className="${node.props.className}"` : "";

    // HANDLE DIV
    if (node.type === "div") {
      return `<div${classAttr}${styleAttr}>\n${children}\n</div>`;
    }

    // HANDLE BUTTON
    if (node.type === "Button") {
      imports.add("Button");
      return `<Button${classAttr}${styleAttr}${generateProps(node.props) ? ` ${generateProps(node.props)}` : ""}>${children}</Button>`;
    }

    // HANDLE CONTAINER
    if (node.type === "Container") {
      imports.add("Container");
      return `<Container${classAttr}${styleAttr}${generateProps(node.props) ? ` ${generateProps(node.props)}` : ""}>${children}</Container>`;
    }

    // CUSTOM TEMPLATES
    if (templateMap.has(node.type)) {
      const safeName = sanitizeName(node.type);
      const propsString = generateProps(node.props);
      if (children) {
        return `<${safeName}${classAttr}${styleAttr}${propsString ? ` ${propsString}` : ""}>${children}</${safeName}>`;
      }
      return `<${safeName}${classAttr}${styleAttr}${propsString ? ` ${propsString}` : ""} />`;
    }

    return `<div${classAttr}${styleAttr}>\n      <div style="padding:12px;border:1px dashed #f59e0b;background:#fef3c7;margin-bottom:12px;">Custom component: ${node.type}</div>\n      ${children}\n    </div>`;
  }

  function getStyleObject(props = {}) {
    const styleObj = {};
    
    Object.entries(props).forEach(([key, value]) => {
      if (CSS_STYLE_KEYS.has(key)) {
        styleObj[key] = value;
      }
    });

    if (Object.keys(styleObj).length === 0) return null;

    const entries = Object.entries(styleObj)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(", ");
    
    return `{${entries}}`;
  }

  function generateProps(props = {}) {
    return Object.entries(props)
      .filter(([key, value]) => value !== undefined && key !== 'className' && !CSS_STYLE_KEYS.has(key))
      .map(([key, value]) => `${key}={${JSON.stringify(value)}}`)
      .join(" ");
  }

  const templateMap = collectTemplates(tree);
  const templateDefinitions = buildTemplateDefinitions(templateMap);
  const importLine = `import { Button, Container } from "DropUi";\n\n`;
  const componentDefinitions = templateDefinitions ? `${templateDefinitions}\n\n` : "";
  const componentRegistryEntries = [
    `  Button,`,
    `  button: Button,`,
    `  Container,`,
    `  container: Container,`,
    ...[...templateMap.entries()].map(([type]) => {
      const safeName = sanitizeName(type);
      return `  ${JSON.stringify(type)}: ${safeName},`;
    }),
  ];
  const registryString = componentRegistryEntries.join("\n");

  return `
import React from "react";
${importLine}${componentDefinitions}const design = ${JSON.stringify(tree)};
const componentRegistry = {
${registryString}
};

const CSS_STYLE_KEYS = new Set([
  'color',
  'background',
  'backgroundColor',
  'fontSize',
  'textAlign',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'padding',
  'margin',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'display',
  'gap',
  'flexDirection',
  'justifyContent',
  'alignItems',
  'alignContent',
  'flexWrap',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'overflow',
  'overflowX',
  'overflowY',
  'border',
  'borderRadius',
  'boxShadow',
]);

const Renderer = ({ node }) => {
  if (!node) return null;
  const Comp = componentRegistry[node.type] || 'div';
  const isKnownComponent = !!componentRegistry[node.type];
  const cssProps = {};
  const domProps = {};
  Object.entries(node.props || {}).forEach(([key, value]) => {
    if (CSS_STYLE_KEYS.has(key)) {
      cssProps[key] = value;
    } else {
      domProps[key] = value;
    }
  });
  const style = Object.keys(cssProps).length > 0 ? cssProps : undefined;
  return (
    <Comp {...domProps} style={style} className={node.props?.className || ''}>
      {!isKnownComponent ? (
        <div style={{ padding: 12, border: '1px dashed #f59e0b', borderRadius: 16, background: '#fef3c7', marginBottom: 12, color: '#92400e', fontSize: 14 }}>
          Custom component: {node.type}
        </div>
      ) : null}
      {node.children?.map((child) => (<Renderer key={child.id} node={child} />))}
    </Comp>
  );
};

export default function GeneratedUI() {
  const nodes = Array.isArray(design) ? design : design?.children || [];
  return (
    <div className="generated-ui">
      {nodes.map((node) => (
        <Renderer key={node.id} node={node} />
      ))}
    </div>
  );
}
`;}