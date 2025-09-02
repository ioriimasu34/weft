"""
Authentication and authorization for the RFID tracking system
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from functools import wraps

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from shared.config import get_settings
from shared.database import DatabaseManager

logger = logging.getLogger(__name__)

# Security configuration
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Global settings
settings = get_settings()


class AuthManager:
    """Authentication and authorization manager"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.secret_key = settings.jwt_secret
        self.algorithm = settings.jwt_algorithm
        self.access_token_expire_minutes = settings.jwt_expiration_hours * 60
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"JWT verification failed: {e}")
            return None
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate user with email and password"""
        try:
            # Get user from database
            users = await self.db_manager.get_by_field("users", "email", email)
            
            if not users:
                return None
            
            user = users[0]
            
            # Check if user is active
            if not user.get("is_active"):
                return None
            
            # Verify password
            if not self.verify_password(password, user.get("password_hash", "")):
                return None
            
            # Update last login
            await self.db_manager.update("users", user["id"], {
                "last_login": datetime.utcnow().isoformat()
            })
            
            return user
            
        except Exception as e:
            logger.error(f"Authentication failed for user {email}: {e}")
            return None
    
    async def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        """Get current user from JWT token"""
        try:
            payload = self.verify_token(token)
            if not payload:
                return None
            
            user_id = payload.get("sub")
            if not user_id:
                return None
            
            # Get user from database
            user = await self.db_manager.get_by_id("users", user_id)
            
            if not user:
                return None
            
            # Check if user is still active
            if not user.get("is_active"):
                return None
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to get current user: {e}")
            return None
    
    async def get_user_permissions(self, user_id: str) -> Dict[str, Any]:
        """Get user permissions and roles"""
        try:
            user = await self.db_manager.get_by_id("users", user_id)
            if not user:
                return {}
            
            role = user.get("role", "operator")
            
            # Define permissions based on role
            permissions = {
                "admin": {
                    "can_manage_users": True,
                    "can_manage_factories": True,
                    "can_manage_rfid_tags": True,
                    "can_manage_production_lines": True,
                    "can_manage_checkpoints": True,
                    "can_view_all_data": True,
                    "can_export_data": True,
                    "can_manage_system": True
                },
                "hr": {
                    "can_manage_users": True,
                    "can_manage_factories": False,
                    "can_manage_rfid_tags": False,
                    "can_manage_production_lines": False,
                    "can_manage_checkpoints": False,
                    "can_view_all_data": True,
                    "can_export_data": True,
                    "can_manage_system": False
                },
                "supervisor": {
                    "can_manage_users": False,
                    "can_manage_factories": False,
                    "can_manage_rfid_tags": True,
                    "can_manage_production_lines": True,
                    "can_manage_checkpoints": True,
                    "can_view_all_data": True,
                    "can_export_data": True,
                    "can_manage_system": False
                },
                "operator": {
                    "can_manage_users": False,
                    "can_manage_factories": False,
                    "can_manage_rfid_tags": False,
                    "can_manage_production_lines": False,
                    "can_manage_checkpoints": False,
                    "can_view_all_data": False,
                    "can_export_data": False,
                    "can_manage_system": False
                }
            }
            
            return {
                "user_id": user_id,
                "role": role,
                "permissions": permissions.get(role, {}),
                "factory_id": user.get("factory_id")
            }
            
        except Exception as e:
            logger.error(f"Failed to get user permissions: {e}")
            return {}
    
    def require_permission(self, permission: str):
        """Decorator to require specific permission"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # This would be used in FastAPI dependencies
                # For now, we'll implement it in the dependency functions
                return await func(*args, **kwargs)
            return wrapper
        return decorator


# Global auth manager instance
auth_manager = AuthManager()


# FastAPI dependencies
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        user = await auth_manager.get_current_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user
        
    except Exception as e:
        logger.error(f"Authentication failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """Get current active user"""
    if not current_user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_user_with_permissions(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current user with permissions"""
    permissions = await auth_manager.get_user_permissions(current_user["id"])
    return {
        **current_user,
        "permissions": permissions
    }


def require_role(required_role: str):
    """Dependency to require specific user role"""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role", "operator")
        
        # Define role hierarchy
        role_hierarchy = {
            "admin": 4,
            "hr": 3,
            "supervisor": 2,
            "operator": 1
        }
        
        required_level = role_hierarchy.get(required_role, 0)
        user_level = role_hierarchy.get(user_role, 0)
        
        if user_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role}"
            )
        
        return current_user
    
    return role_checker


def require_permission(permission: str):
    """Dependency to require specific permission"""
    async def permission_checker(
        current_user: Dict[str, Any] = Depends(get_current_user_with_permissions)
    ):
        user_permissions = current_user.get("permissions", {})
        
        if not user_permissions.get(permission, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required permission: {permission}"
            )
        
        return current_user
    
    return permission_checker


# Authentication endpoints
async def login(email: str, password: str) -> Optional[Dict[str, Any]]:
    """User login"""
    try:
        user = await auth_manager.authenticate_user(email, password)
        
        if not user:
            return None
        
        # Create access token
        access_token_expires = timedelta(minutes=auth_manager.access_token_expire_minutes)
        access_token = auth_manager.create_access_token(
            data={"sub": user["id"]}, 
            expires_delta=access_token_expires
        )
        
        # Get user permissions
        permissions = await auth_manager.get_user_permissions(user["id"])
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": auth_manager.access_token_expire_minutes * 60,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "role": user["role"],
                "factory_id": user["factory_id"]
            },
            "permissions": permissions
        }
        
    except Exception as e:
        logger.error(f"Login failed for user {email}: {e}")
        return None


async def refresh_token(current_user: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Refresh access token"""
    try:
        # Create new access token
        access_token_expires = timedelta(minutes=auth_manager.access_token_expire_minutes)
        access_token = auth_manager.create_access_token(
            data={"sub": current_user["id"]}, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": auth_manager.access_token_expire_minutes * 60
        }
        
    except Exception as e:
        logger.error(f"Token refresh failed for user {current_user.get('id')}: {e}")
        return None


async def change_password(
    current_user: Dict[str, Any], 
    current_password: str, 
    new_password: str
) -> bool:
    """Change user password"""
    try:
        # Verify current password
        if not auth_manager.verify_password(current_password, current_user.get("password_hash", "")):
            return False
        
        # Hash new password
        new_password_hash = auth_manager.get_password_hash(new_password)
        
        # Update password in database
        await auth_manager.db_manager.update("users", current_user["id"], {
            "password_hash": new_password_hash,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Password changed for user {current_user['id']}")
        return True
        
    except Exception as e:
        logger.error(f"Password change failed for user {current_user.get('id')}: {e}")
        return False


async def create_user(user_data: Dict[str, Any], created_by: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Create new user"""
    try:
        # Check if creator has permission
        creator_permissions = await auth_manager.get_user_permissions(created_by["id"])
        if not creator_permissions.get("permissions", {}).get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to create users"
            )
        
        # Hash password
        password_hash = auth_manager.get_password_hash(user_data["password"])
        
        # Prepare user data
        user_record = {
            "employee_id": user_data["employee_id"],
            "first_name": user_data["first_name"],
            "last_name": user_data["last_name"],
            "email": user_data["email"],
            "phone": user_data.get("phone"),
            "role": user_data["role"],
            "department": user_data.get("department"),
            "factory_id": user_data["factory_id"],
            "password_hash": password_hash,
            "is_active": True
        }
        
        # Create user
        created_user = await auth_manager.db_manager.insert("users", user_record)
        
        # Remove password hash from response
        if created_user:
            created_user.pop("password_hash", None)
        
        logger.info(f"User created: {created_user['email']} by {created_by['email']}")
        return created_user
        
    except Exception as e:
        logger.error(f"User creation failed: {e}")
        raise


async def update_user(
    user_id: str, 
    user_data: Dict[str, Any], 
    updated_by: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Update existing user"""
    try:
        # Check if updater has permission
        updater_permissions = await auth_manager.get_user_permissions(updated_by["id"])
        if not updater_permissions.get("permissions", {}).get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to update users"
            )
        
        # Prepare update data
        update_data = {}
        for field in ["first_name", "last_name", "email", "phone", "role", "department", "is_active"]:
            if field in user_data:
                update_data[field] = user_data[field]
        
        # Update password if provided
        if "password" in user_data:
            update_data["password_hash"] = auth_manager.get_password_hash(user_data["password"])
        
        # Add timestamp
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Update user
        updated_user = await auth_manager.db_manager.update("users", user_id, update_data)
        
        logger.info(f"User updated: {user_id} by {updated_by['email']}")
        return updated_user
        
    except Exception as e:
        logger.error(f"User update failed: {e}")
        raise


async def delete_user(user_id: str, deleted_by: Dict[str, Any]) -> bool:
    """Delete user (soft delete)"""
    try:
        # Check if deleter has permission
        deleter_permissions = await auth_manager.get_user_permissions(deleted_by["id"])
        if not deleter_permissions.get("permissions", {}).get("can_manage_users", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete users"
            )
        
        # Soft delete by setting is_active to False
        await auth_manager.db_manager.update("users", user_id, {
            "is_active": False,
            "updated_at": datetime.utcnow().isoformat()
        })
        
        logger.info(f"User deleted: {user_id} by {deleted_by['email']}")
        return True
        
    except Exception as e:
        logger.error(f"User deletion failed: {e}")
        return False


# Utility functions
def is_admin(user: Dict[str, Any]) -> bool:
    """Check if user is admin"""
    return user.get("role") == "admin"


def is_hr_or_admin(user: Dict[str, Any]) -> bool:
    """Check if user is HR or admin"""
    return user.get("role") in ["hr", "admin"]


def is_supervisor_or_higher(user: Dict[str, Any]) -> bool:
    """Check if user is supervisor or higher"""
    return user.get("role") in ["supervisor", "hr", "admin"]


def get_user_factory_id(user: Dict[str, Any]) -> Optional[str]:
    """Get user's factory ID"""
    return user.get("factory_id")


# Export commonly used functions and classes
__all__ = [
    "AuthManager",
    "auth_manager",
    "get_current_user",
    "get_current_active_user",
    "get_current_user_with_permissions",
    "require_role",
    "require_permission",
    "login",
    "refresh_token",
    "change_password",
    "create_user",
    "update_user",
    "delete_user",
    "is_admin",
    "is_hr_or_admin",
    "is_supervisor_or_higher",
    "get_user_factory_id"
]