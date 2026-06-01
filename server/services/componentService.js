import slugify from "slugify";

import Component from "../models/Component.js";
import ComponentVersion from "../models/ComponentVersion.js";

import extractProps from "../utils/extractProps.js";
import extractDependencies from "../utils/extractDependencies.js";

import { saveTemplate } from "./templateService.js";

export const createComponent = async (
  payload,
  adminId
) => {
  const {
    name,
    label,
    type,
    category,
    description,
    code,
  } = payload;

  const slug = slugify(name, {
    lower: true,
  });

  const props = extractProps(code);

  const dependencies =
    extractDependencies(code);

  const template =
    await saveTemplate({
      type,
      name: slug,
      code,
    });

  const component =
    await Component.create({
      name,
      slug,
      label,
      type,
      category,
      description,

      template: template.path,

      props,

      dependencies,

      createdBy: adminId,
    });

  await ComponentVersion.create({
    component: component._id,
    version: "1.0.0",
    template: code,
    props,
    dependencies,
  });

  return component;
};