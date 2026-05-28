import express from "express";
import axios from "axios";
import Component from "../models/components.js";
import { upload } from "../middleware/upload.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

// 🔥 Create Component with Code (New Format - Protected)
router.post(
  "/components/create",
  adminAuth,
  async (req, res) => {
    try {
      const { name, label, category, description, template, installSteps, props } = req.body;

      if (!name || !category) {
        return res.status(400).json({ message: "Name and category are required" });
      }

      const component = await Component.create({
        name,
        label: label || name,
        category,
        description: description || "",
        installSteps: installSteps || "",
        props: props || [],
        code: template || "",
        path: `${category}/${name}`,
      });

      res.status(201).json({
        message: "Component created successfully",
        component,
      });
    } catch (err) {
      console.error("Component creation error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// 🔥 Upload Component (Protected) - Legacy format
router.post(
  "/component",
  adminAuth,
  upload.array("files"),
  async (req, res) => {
    try {
      const { name, type, category, props } = req.body;

      if (!name || !type || !category) {
        return res.status(400).json({ message: "Name, type, and category are required" });
      }

      const files = req.files ? req.files.map((f) => f.filename) : [];

      const component = await Component.create({
        name,
        type,
        category,
        path: `${type}/${name}`,
        props: props ? props.split(",").map(p => ({ name: p.trim() })) : [],
        files,
      });

      res.status(201).json({
        message: "Component created successfully",
        component,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Get all components
router.get("/components", adminAuth, async (req, res) => {
  try {
    const components = await Component.find();
    res.json(components);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete component
router.delete("/component/:id", adminAuth, async (req, res) => {
  try {
    const component = await Component.findByIdAndDelete(req.params.id);
    res.json({ message: "Component deleted", component });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

// AI helpers: fix or generate code using OpenAI (requires OPENAI_API_KEY env)
router.post("/components/ai/fix", adminAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "code is required" });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(501).json({ message: "AI not configured on server (OPENAI_API_KEY missing)" });
    }

    const resp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert React developer. Return only the updated code block with no explanation." },
          { role: "user", content: `Please fix, refactor and rewrite this React component code to be correct, safe, and production-ready. Output only the updated code:\n\n${code}` },
        ],
        max_tokens: 2000,
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" } }
    );

    const aiText = resp.data.choices?.[0]?.message?.content || resp.data.choices?.[0]?.text;
    res.json({ code: aiText });
  } catch (err) {
    console.error("AI fix error:", err?.message || err);
    res.status(500).json({ message: err.message || String(err) });
  }
});

router.post("/components/ai/generate", adminAuth, async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "prompt is required" });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(501).json({ message: "AI not configured on server (OPENAI_API_KEY missing)" });
    }

    const resp = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert React developer. Return only a self-contained React component in JSX (ESM)." },
          { role: "user", content: `Generate a React component based on the following description. Include prop definitions when relevant and ensure it can be previewed in a live editor.\n\n${prompt}` },
        ],
        max_tokens: 2000,
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" } }
    );

    const aiText = resp.data.choices?.[0]?.message?.content || resp.data.choices?.[0]?.text;
    res.json({ code: aiText });
  } catch (err) {
    console.error("AI generate error:", err?.message || err);
    res.status(500).json({ message: err.message || String(err) });
  }
});