export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    page_size: number;
  };
};
