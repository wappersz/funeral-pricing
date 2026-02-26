const ITEMS = [
  { label: "Cremation or burial fee", amount: "~£600", covered: true },
  { label: "Death certificates", amount: "~£55", covered: true },
  { label: "Travel costs", amount: "varies", covered: true },
  { label: "Other expenses (max)", amount: "£1,000", covered: true },
  { label: "Coffin upgrades", amount: "", covered: false },
  { label: "Flowers and tributes", amount: "", covered: false },
  { label: "Order of service printing", amount: "", covered: false },
  { label: "Wake or reception", amount: "", covered: false },
];

const TOTAL_COST = 3500;
const FEP_MAX = 1700;
const fepPct = Math.round((FEP_MAX / TOTAL_COST) * 100);

export default function FepCoverageChart() {
  return (
    <div className="my-8 rounded-lg border border-border bg-slate-50 p-5 text-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray">
        Funeral Expenses Payment
      </p>
      <h3 className="mb-5 text-base font-semibold text-navy">
        How much does FEP typically cover?
      </h3>

      {/* Coverage bar */}
      <div className="mb-1 flex h-9 w-full overflow-hidden rounded-md">
        <div
          className="flex items-center justify-center bg-[#4bbb94] text-xs font-semibold text-white"
          style={{ width: `${fepPct}%` }}
        >
          FEP: up to £{FEP_MAX.toLocaleString()}
        </div>
        <div
          className="flex items-center justify-center bg-gray-200 text-xs font-medium text-gray-500"
          style={{ width: `${100 - fepPct}%` }}
        >
          Gap: ~£{(TOTAL_COST - FEP_MAX).toLocaleString()}
        </div>
      </div>
      <p className="mb-5 text-xs text-gray">
        Based on a typical funeral cost of £{TOTAL_COST.toLocaleString()}. FEP covers around{" "}
        {fepPct}% of a standard funeral in most cases.
      </p>

      {/* What's covered / not covered */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-0">
        <div>
          <p className="mb-2 text-xs font-semibold text-navy">Covered by FEP</p>
          <ul className="space-y-1.5">
            {ITEMS.filter((i) => i.covered).map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-xs text-foreground">
                <span className="mt-0.5 text-[#4bbb94]">✓</span>
                <span>
                  {item.label}
                  {item.amount && (
                    <span className="ml-1 text-gray">{item.amount}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-navy">Not covered</p>
          <ul className="space-y-1.5">
            {ITEMS.filter((i) => !i.covered).map((item) => (
              <li key={item.label} className="flex items-start gap-2 text-xs text-gray">
                <span className="mt-0.5 text-gray-400">✗</span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
