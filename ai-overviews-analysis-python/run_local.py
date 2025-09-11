#!/usr/bin/env python3
"""
Local development runner with enhanced logging
"""

import uvicorn
import os
import sys
from pathlib import Path

def main():
    # Add current directory to Python path
    current_dir = Path(__file__).parent
    sys.path.insert(0, str(current_dir))
    
    # Set development environment
    os.environ.setdefault('ENVIRONMENT', 'development')
    
    print("🚀 Starting AI Overviews Analysis Tool...")
    print("📍 Local development mode")
    print("🌐 Access at: http://localhost:8000")
    print("📚 API docs at: http://localhost:8000/docs")
    print("❤️  Health check: http://localhost:8000/health")
    print("\n" + "="*50)
    
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            reload_dirs=[str(current_dir)],
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()