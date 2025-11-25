import { Router } from "express";
import { getLikedVideos, toggleCommentLike, toggleTweetLike, toggleVideoLike, getVideoLikeCount, getCommentLikeCount } from "../controllers/like.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle-videolike/:videoId").patch(verifyJWT, toggleVideoLike);

router.route("/toggle-tweetlike/:tweetId").patch(verifyJWT, toggleTweetLike);

router.route("/toggle-commentlike/:commentId").patch(verifyJWT, toggleCommentLike);

router.route("/getlikedvideos").get(verifyJWT, getLikedVideos);

router.route("/video-like-count/:videoId").get(verifyJWT, getVideoLikeCount);

router.route("/comment-like-count/:commentId").get(verifyJWT, getCommentLikeCount);

export default router;