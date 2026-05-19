
import React from "react";
import { Button, Container } from "DropUi";

const Bottom = (props) => (<div>{props.text}</div>);

const design = [{"id":"1","type":"Bottom","template":"<div>{props.text}</div>","props":{"text":"hi","minHeight":"100px"}}];
const componentRegistry = {
  Button,
  button: Button,
  Container,
  container: Container,
  "Bottom": Bottom,
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
