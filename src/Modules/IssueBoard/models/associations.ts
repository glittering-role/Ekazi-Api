import Post from "./job_posts";
import PostImage from "./post_images";
import Like from "./likes";
import JobAssignment from "./job_assignments";
import Bid from "./bids";
import Comment from "./comments";
import CommentReplies from "./comments_reactions";
import { Users } from "../../Users/model/associations";
import { JobSubCategory } from "../../JobCategories/models/association";

// Post Relationships
JobSubCategory.hasMany(Post, { foreignKey: 'sub_category_id', as: 'post' });
Post.belongsTo(JobSubCategory, { foreignKey: 'sub_category_id', as: 'subcategory' });

Post.hasMany(PostImage, { foreignKey: 'post_id', as: 'images', onDelete: 'CASCADE' });
PostImage.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });

Post.hasMany(Bid, { foreignKey: 'post_id', as: 'bids', onDelete: 'CASCADE' });
Bid.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });

Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });

Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });

Post.hasMany(JobAssignment, { foreignKey: 'post_id', as: 'assignments', onDelete: 'CASCADE' });
JobAssignment.belongsTo(Post, { foreignKey: 'post_id', as: 'post', onDelete: 'CASCADE' });

// User Relationships
Users.hasMany(Post, { foreignKey: 'user_id', as: 'posts', onDelete: 'CASCADE' });
Post.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Users.hasMany(Bid, { foreignKey: 'user_id', as: 'bids', onDelete: 'CASCADE' });
Bid.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Users.hasMany(Comment, { foreignKey: 'user_id', as: 'comments', onDelete: 'CASCADE' });
Comment.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Users.hasMany(Like, { foreignKey: 'user_id', as: 'likes', onDelete: 'CASCADE' });
Like.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

Users.hasMany(JobAssignment, { foreignKey: 'provider_user_id', as: 'assignments', onDelete: 'CASCADE' });
JobAssignment.belongsTo(Users, { foreignKey: 'provider_user_id', as: 'provider', onDelete: 'CASCADE' });

// Comment Relationships (for nested comments)
Comment.hasMany(CommentReplies, { foreignKey: 'parent_comment_id', as: 'replies', onDelete: 'CASCADE' });
CommentReplies.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parentComment', onDelete: 'CASCADE' });

// Define the association between CommentReplies and Users
Users.hasMany(CommentReplies, { foreignKey: 'user_id', as: 'commentReplies', onDelete: 'CASCADE' });
CommentReplies.belongsTo(Users, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });

// Bid Relationships
Bid.hasOne(JobAssignment, { foreignKey: 'bid_id', as: 'assignment', onDelete: 'CASCADE' });
JobAssignment.belongsTo(Bid, { foreignKey: 'bid_id', as: 'bid', onDelete: 'CASCADE' });

export {
    Post,
    PostImage,
    Like,
    JobAssignment,
    Bid,
    Comment,
    CommentReplies
};