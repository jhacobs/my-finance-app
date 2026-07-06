import { closeDBIfOpen } from "@/db/db";
import { clearEncryptionKey } from "./encryption";

export const logoutUser = (): void => {
  closeDBIfOpen();
  clearEncryptionKey();
};
