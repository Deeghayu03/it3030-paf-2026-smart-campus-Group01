import os

base_dir = r"h:\UniFolio\UniFolio\frontend\src"

directories = [
    "api",
    "assets/styles",
    "components/common/Navbar",
    "components/common/Footer",
    "components/ui/Button",
    "components/ui/Card",
    "constants",
    "context",
    "hooks",
    "pages/Home",
    "pages/Auth",
    "pages/Dashboard",
    "pages/Resources",
    "pages/Bookings",
    "pages/Tickets",
    "pages/Notifications",
    "pages/Admin",
    "services",
    "utils"
]

files = {
    "api/axiosConfig.js": "",
    "assets/styles/global.css": "",
    "components/common/Navbar/Navbar.js": "",
    "components/common/Navbar/Navbar.css": "",
    "components/common/Footer/Footer.js": "",
    "components/common/Footer/Footer.css": "",
    "components/ui/Button/Button.js": "",
    "components/ui/Button/Button.css": "",
    "components/ui/Card/Card.js": "",
    "components/ui/Card/Card.css": "",
    "constants/routes.js": "export const ROUTES = { HOME: '/', LOGIN: '/login', REGISTER: '/register', DASHBOARD: '/dashboard', RESOURCES: '/dashboard/resources', BOOKINGS: '/dashboard/bookings', TICKETS: '/dashboard/tickets', NOTIFICATIONS: '/dashboard/notifications', ADMIN: '/admin/dashboard' };",
    "context/AuthContext.js": "",
    "hooks/useAuth.js": "",
    "pages/Home/HomePage.js": "",
    "pages/Home/HomePage.css": "",
    "pages/Auth/LoginPage.js": "",
    "pages/Auth/LoginPage.css": "",
    "pages/Auth/RegisterPage.js": "",
    "pages/Auth/RegisterPage.css": "",
    "pages/Dashboard/DashboardPage.js": "",
    "pages/Dashboard/DashboardPage.css": "",
    "pages/Resources/ResourcesPage.js": "// Module A - Facilities & Assets - Team Member 1\n",
    "pages/Resources/ResourcesPage.css": "",
    "pages/Bookings/BookingsPage.js": "// Module B - Booking Management - Team Member 2\n",
    "pages/Bookings/BookingsPage.css": "",
    "pages/Tickets/TicketsPage.js": "// Module C - Maintenance & Incidents - Team Member 3\n",
    "pages/Tickets/TicketsPage.css": "",
    "pages/Notifications/NotificationsPage.js": "// Module D - Notifications - Team Member 4 (Group Leader)\n",
    "pages/Notifications/NotificationsPage.css": "",
    "pages/Admin/AdminDashboardPage.js": "",
    "pages/Admin/AdminDashboardPage.css": "",
    "services/authService.js": "// Module E (auth API calls) - Auth Developer\n",
    "services/resourceService.js": "// Module A (resource API calls) - Team Member 1\n",
    "services/bookingService.js": "// Module B (booking API calls) - Team Member 2\n",
    "services/ticketService.js": "// Module C (ticket API calls) - Team Member 3\n",
    "services/notificationService.js": "// Module D (notification API calls) - Team Member 4 (Group Leader)\n",
    "utils/helpers.js": "",
    "App.js": "",
    "index.js": ""
}

for d in directories:
    os.makedirs(os.path.join(base_dir, d), exist_ok=True)

for f, content in files.items():
    with open(os.path.join(base_dir, f), "w", encoding="utf-8") as file:
        file.write(content)

# Remove files from create-vite if they exist
for f in ["main.jsx", "App.jsx", "index.css", "App.css"]:
    try:
        os.remove(os.path.join(base_dir, f))
    except FileNotFoundError:
        pass
    except Exception as e:
        print(e)
