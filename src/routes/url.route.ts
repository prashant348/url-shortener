import { Router } from "express";
import { db } from "../db/db.js";
import { UrlRepository } from "../repositories/url.repository.js";
import { UrlService } from "../services/url.service.js";
import { UrlController } from "../controllers/url.controller.js";
import { ENV } from "../config/env.js";

const prisma = db.getClient();
const urlRepository = new UrlRepository(prisma);
const urlService = new UrlService(urlRepository, ENV.BASE_URL);
const urlController = new UrlController(urlService);

const router = Router();

router.post("/api/shorten", urlController.create);

router.get("/:code", urlController.redirect);

export default router;