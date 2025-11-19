import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <section className="page-section">
        <div className="container">
          <div className="section-header">
            <h1 className="text-5xl font-bold mb-4">Simple Pricing</h1>
            <p className="section-subtitle">Start free, upgrade when you're ready</p>
        </div>
        
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
            <div className="card text-center">
              <h3 className="text-2xl font-semibold mb-2">Free</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>Perfect for getting started</p>
              <div className="text-4xl font-bold mb-6">$0</div>
              <ul className="text-left space-y-3 mb-8" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>3 active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Basic collaboration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>5GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>10 AI credits/mo</span>
                </li>
              </ul>
              <Link href="/auth?signup=true" className="button secondary w-full">
                Start Free
              </Link>
            </div>
            
            <div className="card text-center">
              <h3 className="text-2xl font-semibold mb-2">Songwriter</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>For solo artists</p>
              <div className="text-4xl font-bold mb-6">
                $9<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>10 active projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>AI songwriting tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>25GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>100 AI credits/mo</span>
                </li>
              </ul>
              <Link href="/auth?signup=true&plan=songwriter" className="button secondary w-full">
                Start Free Trial
              </Link>
            </div>
            
            <div 
              className="card text-center relative" 
              style={{ 
                borderColor: 'var(--accent)',
                borderWidth: '2px' 
              }}
            >
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full"
                style={{ 
                  background: 'var(--accent)',
                  color: '#0B0B0C'
                }}
              >
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-semibold mb-2">Band</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>For groups</p>
              <div className="text-4xl font-bold mb-6">
                $29<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Unlimited projects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Video calls & sharing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>100GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>500 AI credits/mo</span>
                </li>
              </ul>
              <Link href="/auth?signup=true&plan=band" className="button w-full">
                Start Free Trial
              </Link>
            </div>
            
            <div className="card text-center">
              <h3 className="text-2xl font-semibold mb-2">Studio</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>For professionals</p>
              <div className="text-4xl font-bold mb-6">
                $99<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Everything in Band</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>1TB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>2000 AI credits/mo</span>
                </li>
              </ul>
              <Link href="/contact?plan=studio" className="button secondary w-full">
                Contact Sales
              </Link>
            </div>
            
            <div className="card text-center relative" style={{ background: 'linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(138,43,226,0.05) 100%)' }}>
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 text-sm font-semibold rounded-full"
                style={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #8a2be2 100%)',
                  color: 'white'
                }}
              >
                ENTERPRISE
              </div>
              <h3 className="text-2xl font-semibold mb-2">Studio Pro</h3>
              <p className="mb-4" style={{ color: 'var(--muted)' }}>For labels & studios</p>
              <div className="text-4xl font-bold mb-6">
                $299<span className="text-base font-normal">/mo</span>
              </div>
              <ul className="text-left space-y-3 mb-8" style={{ color: 'var(--text)' }}>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>500GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span><strong>Unlimited AI</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>White-label options</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--accent)' }}>✓</span>
                  <span>Dedicated manager</span>
                </li>
              </ul>
              <Link href="/contact?plan=enterprise" className="button w-full">
                Contact Sales
              </Link>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-semibold mb-8">All plans include</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div>
                <h3 className="text-xl font-semibold mb-2">Secure Storage</h3>
                <p style={{ color: 'var(--muted)' }}>Your music is encrypted and backed up automatically</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Full Ownership</h3>
                <p style={{ color: 'var(--muted)' }}>You retain 100% rights to all your creative work</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Export Anytime</h3>
                <p style={{ color: 'var(--muted)' }}>Download your projects in industry-standard formats</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6) 0' }}>
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm" style={{ color: 'var(--muted)' }}>
              © 2024 Rock N' Roll Basement. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/about" className="nav-link">About</Link>
              <Link href="/terms" className="nav-link">Terms</Link>
              <Link href="/privacy" className="nav-link">Privacy</Link>
              <Link href="/contact" className="nav-link">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}