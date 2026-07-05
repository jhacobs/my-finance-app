import { getDB } from "@/db/db";
import { clearEncryptionKey } from "./encryption";

export const logoutUser = (): void => {
  clearEncryptionKey();
  getDB().close();
};
