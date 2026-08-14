// features/create/services/postService.js
export const postService = {
  async create(post) {
    console.log("Creating post:", post);

    // simulate API
    await new Promise((r) => setTimeout(r, 500));

    return { success: true };
  },
};