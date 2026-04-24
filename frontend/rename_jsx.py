import os
import re

base_dir = r"h:\UniFolio\UniFolio\frontend"
src_dir = os.path.join(base_dir, "src")

# Files to rename (old_path -> new_path)
renames = {
    "App.js": "App.jsx",
    "index.js": "main.jsx", # the user said main.js -> main.jsx but we created index.js. We'll rename index.js to main.jsx
    "main.js": "main.jsx",
    "pages/Home/HomePage.js": "pages/Home/HomePage.jsx",
    "pages/Auth/LoginPage.js": "pages/Auth/LoginPage.jsx",
    "pages/Auth/RegisterPage.js": "pages/Auth/RegisterPage.jsx",
    "pages/Dashboard/DashboardPage.js": "pages/Dashboard/DashboardPage.jsx",
    "pages/Resources/ResourcesPage.js": "pages/Resources/ResourcesPage.jsx",
    "pages/Bookings/BookingsPage.js": "pages/Bookings/BookingsPage.jsx",
    "pages/Tickets/TicketsPage.js": "pages/Tickets/TicketsPage.jsx",
    "pages/Notifications/NotificationsPage.js": "pages/Notifications/NotificationsPage.jsx",
    "pages/Admin/AdminDashboardPage.js": "pages/Admin/AdminDashboardPage.jsx",
    "components/common/Navbar/Navbar.js": "components/common/Navbar/Navbar.jsx",
    "components/common/Footer/Footer.js": "components/common/Footer/Footer.jsx",
    "components/ui/Button/Button.js": "components/ui/Button/Button.jsx",
    "components/ui/Card/Card.js": "components/ui/Card/Card.jsx",
    "context/AuthContext.js": "context/AuthContext.jsx",
    "hooks/useAuth.js": "hooks/useAuth.jsx"
}

renamed_files = []

for old_rel, new_rel in renames.items():
    old_path = os.path.join(src_dir, os.path.normpath(old_rel))
    new_path = os.path.join(src_dir, os.path.normpath(new_rel))
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        renamed_files.append(f"{old_rel} -> {new_rel}")

# Update imports in all .js and .jsx files
def update_imports():
    for root, _, files in os.walk(src_dir):
        for file in files:
            if file.endswith(".js") or file.endswith(".jsx"):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # We need to remove .js extension from imports or replace with .jsx
                # e.g., import App from './App.js' -> import App from './App'
                new_content = re.sub(r"(['\"])(.*?)(\.js)(\1)", r"\1\2\1", content)
                
                # Some renames might be implicitly matching the old file name without extension.
                # Vite auto-resolves correctly.
                
                if new_content != content:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(new_content)

update_imports()

# Update index.html
index_html = os.path.join(base_dir, "index.html")
if os.path.exists(index_html):
    with open(index_html, "r", encoding="utf-8") as f:
        content = f.read()
    
    content = re.sub(r'src="/src/index\.js"', 'src="/src/main.jsx"', content)
    content = re.sub(r'src="/src/main\.js"', 'src="/src/main.jsx"', content)
    
    with open(index_html, "w", encoding="utf-8") as f:
        f.write(content)

# Update vite.config.js
vite_config = os.path.join(base_dir, "vite.config.js")
if os.path.exists(vite_config):
    with open(vite_config, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "resolve:" not in content:
        # Simple injection if resolve is missing
        if "plugins: " in content:
            new_vite = content.replace("plugins: [react()],", "plugins: [react()],\n  resolve: {\n    extensions: ['.jsx', '.js', '.ts', '.tsx']\n  },")
            if new_vite == content:
                new_vite = content.replace("defineConfig({", "defineConfig({\n  resolve: {\n    extensions: ['.jsx', '.js', '.ts', '.tsx']\n  },")
            with open(vite_config, "w", encoding="utf-8") as f:
                f.write(new_vite)

print("Renamed files:")
for m in renamed_files:
    print(m)
