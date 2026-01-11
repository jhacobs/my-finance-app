import { DropEvent } from "react-dropzone";

const isDropEvent = (event: DropEvent): event is DragEvent => {
  return !Array.isArray(event) && event.type === "drop";
};

const isChangeEvent = (event: DropEvent): event is Event => {
  return !Array.isArray(event) && event.type === "change";
};

export const getFiles = async (
  event: DropEvent,
): Promise<(File | DataTransferItem)[]> => {
  if (Array.isArray(event)) {
    return [];
  }

  if (isDropEvent(event)) {
    const files = Array.from(event.dataTransfer?.files ?? []);
    return files;
  }

  if (isChangeEvent(event)) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    return files;
  }

  return [];
};
