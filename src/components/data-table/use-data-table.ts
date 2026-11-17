import {
  type ColumnDef,
  type ReactTable,
  type RowData,
  useTable,
} from "@tanstack/react-table";
import {
  type DataTableFeatures,
  dataTableFeatures,
} from "./data-table-features";

export const DATA_TABLE_BATCH_SIZE = 20;

type UseDataTableOptions<TData extends RowData> = {
  data: TData[];
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  getRowId: (row: TData) => string;
};

export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>;

export function useDataTable<TData extends RowData>({
  data,
  columns,
  getRowId,
}: UseDataTableOptions<TData>): DataTableInstance<TData> {
  return useTable({
    features: dataTableFeatures,
    data,
    columns,
    getRowId,
    globalFilterFn: "includesString",
    autoResetPageIndex: false,
    initialState: {
      pagination: { pageIndex: 0, pageSize: DATA_TABLE_BATCH_SIZE },
    },
  });
}

export function loadMoreRows<TData extends RowData>(
  table: DataTableInstance<TData>,
): void {
  if (!table.getCanNextPage()) return;
  table.setPageSize(
    (currentPageSize) => currentPageSize + DATA_TABLE_BATCH_SIZE,
  );
}

export function resetLoadedRows<TData extends RowData>(
  table: DataTableInstance<TData>,
): void {
  table.setPageIndex(0);
  table.setPageSize(DATA_TABLE_BATCH_SIZE);
}
