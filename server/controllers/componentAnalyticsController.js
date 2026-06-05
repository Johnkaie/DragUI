import ComponentAnalytics
from "../models/ComponentAnalytics.js";

import Component
from "../models/Component.js";

/*
=========================
VIEW
=========================
*/

export const addView =
async (
 req,
 res
) => {

 try {

   const analytics =
     await ComponentAnalytics.findOneAndUpdate(
       {
         component:
           req.params.id
       },
       {
         $inc:{
           views:1
         }
       },
       {
         upsert:true,
         new:true
       }
     );

   res.json({
     success:true,
     analytics
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};

/*
=========================
DOWNLOAD
=========================
*/

export const addDownload =
async (
 req,
 res
) => {

 try {

   const analytics =
     await ComponentAnalytics.findOneAndUpdate(
       {
         component:
           req.params.id
       },
       {
         $inc:{
           downloads:1
         }
       },
       {
         upsert:true,
         new:true
       }
     );

   await Component.findByIdAndUpdate(
     req.params.id,
     {
       $inc:{
         downloads:1
       }
     }
   );

   res.json({
     success:true,
     analytics
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};

/*
=========================
INSTALL
=========================
*/

export const addInstall =
async (
 req,
 res
) => {

 try {

   const analytics =
     await ComponentAnalytics.findOneAndUpdate(
       {
         component:
           req.params.id
       },
       {
         $inc:{
           installs:1
         }
       },
       {
         upsert:true,
         new:true
       }
     );

   res.json({
     success:true,
     analytics
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};

/*
=========================
LIKE
=========================
*/

export const addLike =
async (
 req,
 res
) => {

 try {

   const analytics =
     await ComponentAnalytics.findOneAndUpdate(
       {
         component:
           req.params.id
       },
       {
         $inc:{
           likes:1
         }
       },
       {
         upsert:true,
         new:true
       }
     );

   res.json({
     success:true,
     analytics
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};

/*
=========================
GET ANALYTICS
=========================
*/

export const getAnalytics =
async (
 req,
 res
) => {

 try {

   const analytics =
     await ComponentAnalytics.findOne({
       component:
         req.params.id
     });

   res.json({
     success:true,
     analytics
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};
export const trending =
async (
 req,
 res
) => {

 try {

   const trending =
     await ComponentAnalytics
       .find()
       .populate(
         "component"
       )
       .sort({
         downloads:-1,
         installs:-1,
         views:-1
       })
       .limit(20);

   res.json({
     success:true,
     trending
   });

 } catch(error){

   res.status(500).json({
     success:false,
     message:error.message
   });

 }

};