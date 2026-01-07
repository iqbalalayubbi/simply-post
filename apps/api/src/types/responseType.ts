type ResponseType = {
  status: "error" | "success";
  data: object | null;
  message: string;
};

export default ResponseType;
