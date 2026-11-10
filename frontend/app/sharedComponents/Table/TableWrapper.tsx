import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { columns } from "@/app/sharedComponents/Table/columns";
import { DataTable } from "@/app/sharedComponents/Table/data-table";
import { IOrder } from "@/app/types/Order";
import React from "react";

type TableWrapperProps = {
  all: IOrder[];
  pending: IOrder[];
  processing: IOrder[];
  onTheWay: IOrder[];
  received: IOrder[];
};

const TableWrapper = async ({
  all = [],
  pending = [],
  processing = [],
  onTheWay = [],
  received = [],
}: TableWrapperProps) => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All
            {all?.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-surface-forest/10 px-1.5 text-[11px] font-bold text-surface-forest group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white">
                {all.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pending?.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold text-amber-700">
                {pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="processing">
            Processing
            {processing?.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-sky-100 px-1.5 text-[11px] font-bold text-sky-700">
                {processing.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="on the way">
            On The Way
            {onTheWay?.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-purple-100 px-1.5 text-[11px] font-bold text-purple-700">
                {onTheWay.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="received">
            Received
            {received?.length > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-100 px-1.5 text-[11px] font-bold text-emerald-700">
                {received.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="all"
          className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
        >
          <DataTable columns={columns} data={all} />
        </TabsContent>
        <TabsContent
          value="pending"
          className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
        >
          <DataTable columns={columns} data={pending} />
        </TabsContent>
        <TabsContent
          value="processing"
          className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
        >
          <DataTable columns={columns} data={processing} />
        </TabsContent>
        <TabsContent
          value="on the way"
          className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
        >
          <DataTable columns={columns} data={onTheWay} />
        </TabsContent>
        <TabsContent
          value="received"
          className="overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-bento"
        >
          <DataTable columns={columns} data={received} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TableWrapper;
