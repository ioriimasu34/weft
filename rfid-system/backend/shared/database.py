"""
Database connection and utilities for the RFID tracking system
"""

import asyncio
import logging
from typing import Optional, Dict, Any, List
from contextlib import asynccontextmanager

from supabase import create_client, Client
from postgrest import APIError
from shared.config import get_settings

logger = logging.getLogger(__name__)

# Global Supabase client
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Get Supabase client singleton"""
    global _supabase_client
    
    if _supabase_client is None:
        settings = get_settings()
        _supabase_client = create_client(
            settings.supabase_url,
            settings.supabase_service_key
        )
        logger.info("Supabase client initialized")
    
    return _supabase_client


def get_supabase_anon_client() -> Client:
    """Get Supabase anonymous client for public operations"""
    settings = get_settings()
    return create_client(
        settings.supabase_url,
        settings.supabase_anon_key
    )


class DatabaseManager:
    """Database manager for common operations"""
    
    def __init__(self):
        self.client = get_supabase_client()
        self.anon_client = get_supabase_anon_client()
    
    async def execute_query(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Execute a raw SQL query"""
        try:
            # Note: Supabase doesn't support raw SQL queries directly
            # This would need to be implemented with a different approach
            # For now, we'll use the table API
            raise NotImplementedError("Raw SQL queries not supported in Supabase")
        except Exception as e:
            logger.error(f"Failed to execute query: {e}")
            raise
    
    async def get_by_id(self, table: str, record_id: str) -> Optional[Dict[str, Any]]:
        """Get a record by ID"""
        try:
            response = self.client.table(table).select("*").eq("id", record_id).execute()
            if response.data:
                return response.data[0]
            return None
        except APIError as e:
            logger.error(f"Failed to get record from {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting record from {table}: {e}")
            raise
    
    async def get_by_field(self, table: str, field: str, value: Any) -> List[Dict[str, Any]]:
        """Get records by field value"""
        try:
            response = self.client.table(table).select("*").eq(field, value).execute()
            return response.data or []
        except APIError as e:
            logger.error(f"Failed to get records from {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error getting records from {table}: {e}")
            raise
    
    async def insert(self, table: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Insert a new record"""
        try:
            response = self.client.table(table).insert(data).execute()
            if response.data:
                return response.data[0]
            raise Exception("No data returned from insert")
        except APIError as e:
            logger.error(f"Failed to insert into {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error inserting into {table}: {e}")
            raise
    
    async def update(self, table: str, record_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a record"""
        try:
            response = self.client.table(table).update(data).eq("id", record_id).execute()
            if response.data:
                return response.data[0]
            raise Exception("No data returned from update")
        except APIError as e:
            logger.error(f"Failed to update {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error updating {table}: {e}")
            raise
    
    async def delete(self, table: str, record_id: str) -> bool:
        """Delete a record"""
        try:
            response = self.client.table(table).delete().eq("id", record_id).execute()
            return True
        except APIError as e:
            logger.error(f"Failed to delete from {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error deleting from {table}: {e}")
            raise
    
    async def list_records(
        self, 
        table: str, 
        filters: Dict[str, Any] = None,
        order_by: str = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """List records with optional filtering and pagination"""
        try:
            query = self.client.table(table).select("*")
            
            # Apply filters
            if filters:
                for field, value in filters.items():
                    if isinstance(value, (list, tuple)):
                        query = query.in_(field, value)
                    else:
                        query = query.eq(field, value)
            
            # Apply ordering
            if order_by:
                if order_by.startswith("-"):
                    query = query.order(order_by[1:], desc=True)
                else:
                    query = query.order(order_by, desc=False)
            
            # Apply pagination
            query = query.range(offset, offset + limit - 1)
            
            response = query.execute()
            return response.data or []
            
        except APIError as e:
            logger.error(f"Failed to list records from {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error listing records from {table}: {e}")
            raise
    
    async def count_records(self, table: str, filters: Dict[str, Any] = None) -> int:
        """Count records with optional filtering"""
        try:
            query = self.client.table(table).select("id", count="exact")
            
            # Apply filters
            if filters:
                for field, value in filters.items():
                    if isinstance(value, (list, tuple)):
                        query = query.in_(field, value)
                    else:
                        query = query.eq(field, value)
            
            response = query.execute()
            return response.count or 0
            
        except APIError as e:
            logger.error(f"Failed to count records from {table}: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error counting records from {table}: {e}")
            raise


class TransactionManager:
    """Transaction manager for complex operations"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.operations: List[Dict[str, Any]] = []
    
    async def add_operation(self, operation: Dict[str, Any]):
        """Add an operation to the transaction"""
        self.operations.append(operation)
    
    async def execute(self) -> bool:
        """Execute all operations in the transaction"""
        try:
            # Note: Supabase doesn't support traditional transactions
            # We'll implement a rollback mechanism using operation logs
            for operation in self.operations:
                op_type = operation["type"]
                table = operation["table"]
                data = operation["data"]
                
                if op_type == "insert":
                    await self.db_manager.insert(table, data)
                elif op_type == "update":
                    await self.db_manager.update(table, data["id"], data["updates"])
                elif op_type == "delete":
                    await self.db_manager.delete(table, data["id"])
                
                logger.info(f"Executed {op_type} operation on {table}")
            
            return True
            
        except Exception as e:
            logger.error(f"Transaction failed: {e}")
            # In a real implementation, you would implement rollback logic
            return False
    
    async def rollback(self):
        """Rollback transaction (not fully supported in Supabase)"""
        logger.warning("Rollback not fully supported in Supabase")
        self.operations.clear()


# Database connection utilities
@asynccontextmanager
async def get_db_manager():
    """Get database manager context manager"""
    db_manager = DatabaseManager()
    try:
        yield db_manager
    finally:
        # Cleanup if needed
        pass


@asynccontextmanager
async def get_transaction():
    """Get transaction context manager"""
    db_manager = DatabaseManager()
    transaction = TransactionManager(db_manager)
    try:
        yield transaction
    finally:
        # Cleanup if needed
        pass


# Health check functions
async def check_database_health() -> Dict[str, Any]:
    """Check database health status"""
    try:
        db_manager = DatabaseManager()
        
        # Test basic operations
        start_time = asyncio.get_event_loop().time()
        
        # Try to get a record from a system table
        response = db_manager.client.table("factories").select("id").limit(1).execute()
        
        response_time = asyncio.get_event_loop().time() - start_time
        
        return {
            "status": "healthy",
            "response_time_ms": round(response_time * 1000, 2),
            "tables_accessible": True,
            "timestamp": asyncio.get_event_loop().time()
        }
        
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": asyncio.get_event_loop().time()
        }


async def get_database_stats() -> Dict[str, Any]:
    """Get database statistics"""
    try:
        db_manager = DatabaseManager()
        
        stats = {}
        
        # Count records in main tables
        tables = ["factories", "users", "rfid_tags", "scan_events", "production_tracking"]
        
        for table in tables:
            try:
                count = await db_manager.count_records(table)
                stats[f"{table}_count"] = count
            except Exception as e:
                logger.warning(f"Failed to get count for {table}: {e}")
                stats[f"{table}_count"] = -1
        
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get database stats: {e}")
        return {"error": str(e)}


# Migration utilities
async def run_migrations() -> bool:
    """Run database migrations"""
    try:
        # Note: Supabase handles migrations through their dashboard
        # This function would be used for custom migrations if needed
        logger.info("Migrations handled by Supabase dashboard")
        return True
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        return False


async def reset_database() -> bool:
    """Reset database (development only)"""
    try:
        # This should only be used in development/testing
        settings = get_settings()
        if settings.debug:
            logger.warning("Resetting database in development mode")
            # Implement reset logic here
            return True
        else:
            logger.error("Cannot reset database in production mode")
            return False
            
    except Exception as e:
        logger.error(f"Database reset failed: {e}")
        return False


# Initialize database on module import
async def initialize_database():
    """Initialize database connections and check health"""
    try:
        # Test connection
        client = get_supabase_client()
        
        # Check health
        health = await check_database_health()
        
        if health["status"] == "healthy":
            logger.info("Database initialized successfully")
            return True
        else:
            logger.error(f"Database health check failed: {health}")
            return False
            
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False


# Export commonly used functions
__all__ = [
    "get_supabase_client",
    "get_supabase_anon_client",
    "DatabaseManager",
    "TransactionManager",
    "get_db_manager",
    "get_transaction",
    "check_database_health",
    "get_database_stats",
    "run_migrations",
    "reset_database",
    "initialize_database"
]