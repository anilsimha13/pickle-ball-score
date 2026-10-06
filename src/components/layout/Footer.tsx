export function Footer() {
  return (
    <footer className="bg-net text-line mt-auto" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-heading text-lg text-ball">Pickle Ball Score</p>
          <p className="text-xs text-line/60 text-center sm:text-right max-w-sm">
            All data is stored only in this browser and stays here after you log out.
            Use Reset all data to remove it.
          </p>
        </div>
      </div>
    </footer>
  )
}
