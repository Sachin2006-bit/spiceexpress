import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import { getUserFromStorage } from '../lib/auth'
import { 
  User, 
  CreditCard, 
  Calculator, 
  MapPin, 
  FileText, 
  BarChart3, 
  Truck, 
  FileSpreadsheet, 
  Map, 
  Tag,
  Home
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: Home, roles: ['admin', 'user'] },
  { label: 'Profile', to: '/profile', icon: User, roles: ['admin', 'user'] },
  { label: 'Tracking', to: '/tracking', icon: MapPin, roles: ['admin', 'user'] },
  { label: 'LRs', to: '/lrs', icon: Truck, roles: ['admin', 'user'] },
  { label: 'Invoices', to: '/invoices', icon: FileText, roles: ['admin', 'user'] },
  { label: 'Customer List', to: '/admin/customer-list', icon: User, roles: ['admin'] },
  { label: 'Add Customer', to: '/admin/add-customer', icon: User, roles: ['admin'] },
  { label: 'MIS', to: '/mis', icon: BarChart3, roles: ['admin'] },
  { label: 'Create LR', to: '/create-lr', icon: FileSpreadsheet, roles: ['admin'] },
  { label: 'Rates Mapping', to: '/rates', icon: Map, roles: ['admin'] },
  { label: 'Vendor Code', to: '/vendors', icon: Tag, roles: ['admin'] },
]

export default function Sidebar() {
  const user = getUserFromStorage();
  // If user is not authenticated, show a compact sidebar with only a Login link
  if (!user) {
    return (
      <aside className="h-screen w-64 flex flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800 fixed top-0 left-0 z-30">
        <div className="flex h-16 items-center border-b px-6 dark:border-gray-800 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigation</h2>
        </div>
        <nav className="flex-1 p-4">
          <NavLink to="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            <User className="h-5 w-5" />
            <span>Login</span>
          </NavLink>
        </nav>
      </aside>
    )
  }

  return (
    <aside className="h-screen w-64 flex flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800 fixed top-0 left-0 z-30">
      {/* Sidebar Header */}
      <div className="flex h-16 items-center border-b px-6 dark:border-gray-800 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Navigation</h2>
      </div>
      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-4 overflow-visible">
        {navItems.filter(item => !item.roles || (user && item.roles.includes(user.role))).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                  isActive 
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100" 
                    : "text-gray-600 dark:text-gray-400"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
      {/* Sidebar Footer (Logout + User details) */}
      <div className="border-t p-4 dark:border-gray-800 shrink-0 flex flex-col gap-3">
    <NavLink
      to="/"
      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      Back to Landing Page
    </NavLink>
        <button
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 transition"
          onClick={() => {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" /></svg>
          Logout
        </button>
        {user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="object-cover w-8 h-8 rounded-full" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}


