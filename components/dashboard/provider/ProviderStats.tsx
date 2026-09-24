import {
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
} from "lucide-react";

interface Props {
  totalGear: number;
  activeGear: number;
  pendingOrders: number;
  totalRevenue: number;
}

export default function ProviderStats({
  totalGear,
  activeGear,
  pendingOrders,
  totalRevenue,
}: Props) {
  const stats = [
    {
      title: "Total Gear",
      value: totalGear,
      icon: Package,
    },
    {
      title: "Active Gear",
      value: activeGear,
      icon: ShoppingBag,
    },
    {
      title: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {stat.title}
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>

              <div className="rounded-xl bg-gray-100 p-3">
                <Icon
                  size={22}
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}