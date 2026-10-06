export function CourtBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='20' cy='20' r='8' fill='none' stroke='%231E5AA8' stroke-width='1.5'/%3E%3C/svg%3E")`,
        backgroundSize: '40px 40px',
      }}
    />
  )
}
