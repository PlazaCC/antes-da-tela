import './landing.css'

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* suppress the global app NavBar on the landing page */}
      <style>{`header[aria-label="Principal"] { display: none !important; }`}</style>
      {children}
    </>
  )
}
