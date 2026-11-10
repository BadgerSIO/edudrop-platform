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
  const orderTabs = [
    {
      value: "all",
      label: "All",
      data: all,
      badgeClass:
        "bg-surface-forest/10 text-surface-forest group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
    },
    {
      value: "pending",
      label: "Pending",
      data: pending,
      badgeClass:
        "bg-amber-100 text-amber-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
    },
    {
      value: "processing",
      label: "Processing",
      data: processing,
      badgeClass:
        "bg-sky-100 text-sky-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
    },
    {
      value: "on the way",
      label: "On The Way",
      data: onTheWay,
      badgeClass:
        "bg-purple-100 text-purple-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
    },
    {
      value: "received",
      label: "Received",
      data: received,
      badgeClass:
        "bg-emerald-100 text-emerald-700 group-data-[state=active]:bg-white/20 group-data-[state=active]:text-white",
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          {orderTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="group">
              {tab.label}
              {tab.data?.length > 0 && (
                <span
                  className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold ${tab.badgeClass}`}
                >
                  {tab.data.length}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {orderTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value}>
            <DataTable
              columns={columns}
              data={tab.data}
              searchPlaceholder="Search orders by ID, school, donor, tracking..."
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TableWrapper;
