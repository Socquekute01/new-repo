import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, LogOut, UserCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
    const navigate = useNavigate();
    const { getCartItemsCount } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState('Vi');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const userMenuRef = useRef(null);

    const cartItemsCount = getCartItemsCount();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        setShowUserMenu(false);
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const menuItems = [
        'SHOP',
        // 'THE ROLLING STONES',
        // "COLLAB'S",
        // 'OUTLET',
        'CONTACT',
        'ABOUT US',
        'BEST SELLER'
    ];

    return (
        <header className="bg-white sticky top-0 z-50 shadow-md">
            {/* Top navigation bar */}
            <div className="border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-1">
                    <div className="flex items-center justify-between h-20">

                        {/* Logo */}
                        <div className="flex-shrink-0">
                            <div
                                onClick={() => navigate('/')}
                                className="cursor-pointer hover:opacity-80 transition-opacity duration-200">
                                <img
                                    src="/picture/logo.png"
                                    alt="Logo"
                                    className="h-14 w-14 object-cover rounded-full"
                                />
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => {
                                        if (item === 'SHOP') {
                                            navigate('/shop');
                                        } else if (item === 'CONTACT') {
                                            navigate('/contact');
                                        } else if (item === 'ABOUT US') {
                                            navigate('/about');
                                        } else if (item === 'BEST SELLER') {
                                            navigate('/bestseller');
                                        }
                                    }}
                                    className="px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors duration-200"
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>

                        {/* Right side icons and search */}
                        <div className="flex items-center space-x-6">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className="bg-gray-100 flex-1 outline-none text-sm text-gray-700 placeholder-gray-500"
                                />
                                <button type="submit" className="flex items-center">
                                    <Search size={18} className="text-gray-400 cursor-pointer hover:text-gray-600" />
                                </button>
                            </form>

                            {/* Icons */}
                            <div className="flex items-center space-x-4">
                                {/* User Profile / Username */}
                                {isAuthenticated && user ? (
                                    <div className="relative" ref={userMenuRef}>
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center space-x-2 text-gray-800 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            <User size={22} />
                                            <span className="text-sm font-medium hidden sm:block">
                                                {user.username || user.name}
                                            </span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {showUserMenu && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false);
                                                        navigate('/profile');
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                                >
                                                    <UserCircle size={18} />
                                                    <span>Profile</span>
                                                </button>
                                                {/* Admin Dashboard Link */}
                                                {(user?.roles?.some(role => role.name === 'admin') || user?.role === 'admin') && (
                                                    <button
                                                        onClick={() => {
                                                            setShowUserMenu(false);
                                                            navigate('/admin/dashboard');
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                        </svg>
                                                        <span>Admin Dashboard</span>
                                                    </button>
                                                )}
                                                {/* Manager Dashboard Link */}
                                                {(user?.roles?.some(role => role.name === 'manager') || user?.role === 'manager') &&
                                                    !(user?.roles?.some(role => role.name === 'admin') || user?.role === 'admin') && (
                                                        <button
                                                            onClick={() => {
                                                                setShowUserMenu(false);
                                                                navigate('/manager/dashboard');
                                                            }}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                            </svg>
                                                            <span>Manager Dashboard</span>
                                                        </button>
                                                    )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                >
                                                    <LogOut size={18} />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="text-gray-800 hover:text-gray-600 transition-colors duration-200">
                                        <User size={22} />
                                    </button>
                                )}

                                {/* Shopping Cart */}
                                <button
                                    onClick={() => navigate('/cart')}
                                    className="text-gray-800 hover:text-gray-600 transition-colors duration-200 relative">
                                    <ShoppingBag size={22} />
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </button>

                                {/* Language Selector */}
                                {/* <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
                                    <button
                                        onClick={() => setLanguage('Vi')}
                                        className={`text-sm font-medium transition-colors duration-200 ${language === 'Vi'
                                            ? 'text-gray-800'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Vi
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => setLanguage('En')}
                                        className={`text-sm font-medium transition-colors duration-200 ${language === 'En'
                                            ? 'text-gray-800'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        En
                                    </button>
                                </div> */}

                                {/* Mobile menu button */}
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="md:hidden text-gray-800"
                                >
                                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    <form onSubmit={handleSearch} className="lg:hidden pb-4 flex items-center bg-gray-100 rounded-full px-4 py-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="bg-gray-100 flex-1 outline-none text-sm text-gray-700 placeholder-gray-500"
                        />
                        <button type="submit" className="flex items-center">
                            <Search size={18} className="text-gray-400 cursor-pointer" />
                        </button>
                    </form>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <nav className="md:hidden pb-4 space-y-2">
                            {menuItems.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => {
                                        if (item === 'SHOP') {
                                            navigate('/shop');
                                        } else if (item === 'CONTACT') {
                                            navigate('/contact');
                                        } else if (item === 'ABOUT US') {
                                            navigate('/about');
                                        } else if (item === 'BEST SELLER') {
                                            navigate('/bestseller');
                                        }
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 rounded transition-colors duration-200"
                                >
                                    {item}
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </div>
        </header>
    );
}
