DATABASE_URL = "sqlite:///./portfolio.db"

# Admin / auth settings
SECRET_KEY = "change-me-to-a-secure-random-string"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Default admin credentials (override via env in production)
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "adminpass"
