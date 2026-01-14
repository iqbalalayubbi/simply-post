type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  bio?: string | null;
  avatar_url: string;
};

export default User;
