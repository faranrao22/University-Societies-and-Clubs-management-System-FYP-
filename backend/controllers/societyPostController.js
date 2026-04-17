const fs = require("fs");
const path = require("path");
const Society = require("../models/societyModel");
const SocietyPost = require("../models/societyPostModel");

function canManageSocietyDoc(society, userId) {
  if (!society || !userId) return false;
  const uid = String(userId);
  if (society.Creator && String(society.Creator._id || society.Creator) === uid) return true;
  const roles = society.roles || [];
  return roles.some((r) => r.user && String(r.user._id || r.user) === uid);
}

function unlinkPostImage(filename) {
  if (!filename || typeof filename !== "string") return;
  const imagePath = path.join(__dirname, "../uploads", filename);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
}

async function managedSocietyIds(userId) {
  return Society.find({
    $or: [{ Creator: userId }, { "roles.user": userId }],
  }).distinct("_id");
}

/** POST /api/societies/posts — multipart: societyId, title, content, image? */
const createSocietyPost = async (req, res) => {
  try {
    const { societyId, title, content } = req.body;
    if (!societyId || !title?.trim()) {
      return res.status(400).json({ success: false, message: "Society and title are required" });
    }
    const html = typeof content === "string" ? content : "";
    if (!html.replace(/<[^>]+>/g, "").trim()) {
      return res.status(400).json({ success: false, message: "Post content cannot be empty" });
    }

    const society = await Society.findById(societyId);
    if (!society) return res.status(404).json({ success: false, message: "Society not found" });

    if (!canManageSocietyDoc(society, req.user.id)) {
      return res.status(403).json({ success: false, message: "You cannot post for this society" });
    }

    const post = await SocietyPost.create({
      society: societyId,
      author: req.user.id,
      title: title.trim(),
      content: html,
      image: req.file ? req.file.filename : null,
    });

    const populated = await SocietyPost.findById(post._id)
      .populate("society", "name image department")
      .populate("author", "fullname email");

    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/societies/posts/all — public feed (active societies only) */
const listAllPostsPublic = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const activeSocietyIds = await Society.find({ status: "Active" }).distinct("_id");
    const baseFilter = { society: { $in: activeSocietyIds } };

    const [items, total] = await Promise.all([
      SocietyPost.find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("society", "name image department status")
        .populate("author", "fullname"),
      SocietyPost.countDocuments(baseFilter),
    ]);

    return res.json({
      success: true,
      data: items,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      total,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/societies/posts/society/:societyId */
const listPostsBySociety = async (req, res) => {
  try {
    const { societyId } = req.params;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const posts = await SocietyPost.find({ society: societyId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("author", "fullname");
    return res.json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/societies/posts/managed — all posts for societies the user manages (creator or role) */
const listManagedPosts = async (req, res) => {
  try {
    const ids = await managedSocietyIds(req.user.id);
    if (!ids.length) {
      return res.json({ success: true, data: [] });
    }
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit, 10) || 100));
    const posts = await SocietyPost.find({ society: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("society", "name image department status")
      .populate("author", "fullname email");
    return res.json({ success: true, data: posts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** PUT /api/societies/posts/:postId — multipart optional image; body title, content, removeImage */
const updateSocietyPost = async (req, res) => {
  try {
    const post = await SocietyPost.findById(req.params.postId).populate("society");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (!canManageSocietyDoc(post.society, req.user.id)) {
      return res.status(403).json({ success: false, message: "You cannot edit this post" });
    }

    const { title, content, removeImage } = req.body;
    if (title != null && String(title).trim()) post.title = String(title).trim();
    if (content != null) {
      const html = String(content);
      if (!html.replace(/<[^>]+>/g, "").trim()) {
        return res.status(400).json({ success: false, message: "Post content cannot be empty" });
      }
      post.content = html;
    }

    const shouldRemove = removeImage === "true" || removeImage === true;
    if (shouldRemove && post.image) {
      unlinkPostImage(post.image);
      post.image = null;
    }
    if (req.file) {
      if (post.image) unlinkPostImage(post.image);
      post.image = req.file.filename;
    }

    await post.save();
    const populated = await SocietyPost.findById(post._id)
      .populate("society", "name image department")
      .populate("author", "fullname email");
    return res.json({ success: true, data: populated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** DELETE /api/societies/posts/:postId — manager of that society */
const deleteSocietyPostManager = async (req, res) => {
  try {
    const post = await SocietyPost.findById(req.params.postId).populate("society");
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (!canManageSocietyDoc(post.society, req.user.id)) {
      return res.status(403).json({ success: false, message: "You cannot delete this post" });
    }
    if (post.image) unlinkPostImage(post.image);
    await SocietyPost.findByIdAndDelete(post._id);
    return res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/** GET /api/societies/posts/my-feed — societies current user is a member of */
const listPostsForMemberSocieties = async (req, res) => {
  try {
    const societies = await Society.find({
      members: req.user.id,
      status: "Active",
    }).select("_id");
    const ids = societies.map((s) => s._id);
    if (!ids.length) {
      return res.json({ success: true, data: [], total: 0 });
    }
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const posts = await SocietyPost.find({ society: { $in: ids } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("society", "name image department")
      .populate("author", "fullname");
    return res.json({ success: true, data: posts, total: posts.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createSocietyPost,
  listAllPostsPublic,
  listPostsBySociety,
  listPostsForMemberSocieties,
  listManagedPosts,
  updateSocietyPost,
  deleteSocietyPostManager,
};
