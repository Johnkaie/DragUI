import * as componentService
from "../services/componentService.js";

import Component
from "../models/Component.js";

export const create =
async (
  req,
  res
) => {
  try {

    const component =
      await componentService.createComponent(
        req.body,
        req.adminId
      );

    res.status(201).json({
      success:true,
      component
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

export const getAll =
async (
  req,
  res
) => {

  try {

    const components =
      await Component.find()
      .sort({
        createdAt:-1
      });

    res.json({
      success:true,
      components
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};