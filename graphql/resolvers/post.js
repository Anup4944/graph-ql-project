const Post = require("../../models/Post");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const post = await Post.find();
        return post;
      } catch (error) {
        throw new Error(error);
      }
    },
  },
};
