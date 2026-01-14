import prisma from "../../src/config/prisma";

const cleanDatabase = async () => {
  // Gunakan transaction agar penghapusan lebih cepat dan aman
  // Urutan delete penting (Child dulu baru Parent)
  const deleteLikes = prisma.like.deleteMany();
  const deleteComments = prisma.comment.deleteMany();
  const deletePosts = prisma.post.deleteMany();
  const deleteUsers = prisma.user.deleteMany();

  await prisma.$transaction([
    deleteLikes,
    deleteComments,
    deletePosts,
    deleteUsers,
  ]);
};

export { cleanDatabase, prisma };
