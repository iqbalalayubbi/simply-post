import * as z from "zod";

z.config({
  customError: (issue) => {
    if (issue.path) {
      const fieldName = issue.path.join(".") || "Field";
      if (issue.code === "invalid_type" && !issue.input) {
        return `${fieldName} wajib diisi`;
      }
    }
    return null;
  },
});

export default z;
