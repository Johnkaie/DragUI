import * as analyticsService
from "../services/analyticsService.js";

export const dashboard =
async (
  req,
  res
) => {

  try {

    const stats =
      await analyticsService.getDashboardStats();

    res.json({
      success:true,
      stats
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};