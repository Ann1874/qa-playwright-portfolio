import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, useTheme, useToast } from '../App'
import Modal from '../components/Modal'
import ThemeToggle from '../components/ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  // Start closed on mobile, open on desktop
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false)
    logout()
    showToast('You have been signed out', 'success')
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Mobile Header - always visible on mobile */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-slate-800 flex items-center px-4 z-30 md:hidden">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 -ml-2 text-white"
          aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
          data-testid="menu-button"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-white font-bold ml-2">SaaS Dashboard</h1>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-slate-800 text-white flex flex-col shrink-0 transition-all duration-200
          fixed md:static inset-y-0 left-0 z-50
          ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-16 md:translate-x-0'}
        `}
        data-testid="sidebar"
      >
        {/* Header with hamburger */}
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label={sidebarOpen ? 'Collapse menu' : 'Expand menu'}
            data-testid="sidebar-toggle"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          {sidebarOpen && <h1 className="text-xl font-bold">SaaS Dashboard</h1>}
        </div>

        <nav className="flex-1 p-2 space-y-1" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.href
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              aria-current={location.pathname === item.href ? 'page' : undefined}
              title={!sidebarOpen ? item.name : undefined}
            >
              <span aria-hidden="true" className="text-lg">{item.icon}</span>
              {sidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-700 space-y-2">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} collapsed={!sidebarOpen} />

          {sidebarOpen && (
            <div className="flex items-center gap-3 px-2 pt-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center shrink-0">
                {user?.name[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" data-testid="user-name">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
          )}

          {!sidebarOpen && (
            <div className="hidden md:flex justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                {user?.name[0].toUpperCase()}
              </div>
            </div>
          )}

          <button
            onClick={handleLogoutClick}
            className={`w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors flex items-center ${
              sidebarOpen ? '' : 'justify-center'
            }`}
            data-testid="logout-button"
            title={!sidebarOpen ? 'Sign out' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="ml-2">Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-100 dark:bg-slate-900 overflow-y-auto pt-14 md:pt-0" data-testid="main-content">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Sign out"
        message="Are you sure you want to sign out? You'll need to log in again to access your dashboard."
        confirmText="Sign out"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
