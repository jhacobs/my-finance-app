export type ImportCSVResult =
  | {
      success: true;
      insertedCount: number;
      skippedCount: number;
    }
  | {
      success: false;
      error: string;
    };
