'use client';

import { DataTable } from '@/components/data-table/DataTable';
import { useHistoryStore } from '@/stores/useHistoryStore';

import { columns } from './columns';

export function AttemptTable() {
  const attemptCollection = useHistoryStore.use.attemptCollection();
  const confirmLoading = useHistoryStore.use.confirmLoading();

  const data = attemptCollection?.attempts!;

  //   const confirmLoading = useQuestionsStore.use.confirmLoading();
  //   const setConfirmLoading = useQuestionsStore.use.setConfirmLoading();
  //   const [isDebouncing, setIsDebouncing] = useState(false);

  //   const [pagination, setPagination] = useState<PaginationState>({
  //     pageIndex: 0,
  //     pageSize: 10,
  //   });

  //   const resetPagination = () => {
  //     setPagination((prev) => ({
  //       ...prev,
  //       pageIndex: 0,
  //     }));
  //   };

  //   const [sorting, setSorting] = useState<SortingState>([
  //     {
  //       id: 'started_at',
  //       desc: true,
  //     },
  //   ]);

  //   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  //   const debouncedColumnFilters = useDebounce(
  //     columnFilters,
  //     300,
  //     () => {
  //       setConfirmLoading(true);
  //       setIsDebouncing(true);
  //     },
  //     () => {
  //       setConfirmLoading(false);
  //       setIsDebouncing(false);
  //     },
  //   );

  //   useEffect(() => {
  //     if (confirmLoading) {
  //       setConfirmLoading(true);
  //     } else {
  //       setConfirmLoading(false);
  //     }
  //   }, [pagination, sorting, debouncedColumnFilters, setConfirmLoading]);

  //   const onPaginationChange = (updater: Updater<PaginationState>) => {
  //     startTransition(() => {
  //       setPagination(updater);
  //     });
  //   };

  //   const onSortingChange = (updater: Updater<SortingState>) => {
  //     startTransition(() => {
  //       setSorting(updater);
  //       resetPagination();
  //     });
  //   };

  //   const onColumnFiltersChange = (updater: Updater<ColumnFiltersState>) => {
  //     startTransition(() => {
  //       setColumnFilters(updater);
  //       resetPagination();
  //     });
  //   };

  //   const controlledState: ControlledTableStateProps = {
  //     pagination,
  //     onPaginationChange,
  //     rowCount: metadata.totalCount,
  //     sorting,
  //     onSortingChange,
  //     columnFilters,
  //     onColumnFiltersChange,
  //   };

  return (
    <DataTable
      data={data}
      columns={columns}
      confirmLoading={false}
      //   TableToolbar={HistoryTableToolbar}
    />
  );
}
