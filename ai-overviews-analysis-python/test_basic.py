#!/usr/bin/env python3
"""
Basic test script for AI Overviews Analysis Tool
"""

import asyncio
import aiohttp
import json
import sys
from analyzer import analyze_data, BrandConfig

# Test data - sample DataForSEO structure
SAMPLE_DATA = {
    "0": {
        "0": {
            "keyword": "test keyword",
            "type": "organic",
            "items": [
                {
                    "type": "ai_overview", 
                    "markdown": "This is a test AI overview with some content.",
                    "references": [
                        {
                            "domain": "example.com",
                            "source": "Example Site",
                            "url": "https://example.com"
                        },
                        {
                            "domain": "testsite.com", 
                            "source": "Test Brand",
                            "url": "https://testsite.com"
                        }
                    ]
                }
            ]
        },
        "1": {
            "keyword": "another keyword",
            "type": "organic", 
            "items": [
                {
                    "type": "organic",
                    "title": "Regular organic result"
                }
            ]
        }
    }
}

async def test_analyzer():
    """Test the analysis functionality"""
    print("🧪 Testing analyzer functionality...")
    
    config = BrandConfig(name="Test Brand", domain="testsite.com")
    
    try:
        results = await analyze_data(SAMPLE_DATA, config)
        
        print(f"✅ Analysis completed successfully!")
        print(f"   Keywords processed: {len(results['keywords'])}")
        print(f"   AI Overviews found: {len(results['aiOverviews'])}")
        print(f"   Competitors identified: {len(results['competitors'])}")
        print(f"   Brand mentions: {len(results['brandMentions'])}")
        
        # Verify structure
        assert len(results['keywords']) == 2, "Should process 2 keywords"
        assert len(results['aiOverviews']) == 1, "Should find 1 AI overview"
        assert len(results['competitors']) >= 1, "Should identify competitors"
        
        print("✅ All assertions passed!")
        return True
        
    except Exception as e:
        print(f"❌ Analyzer test failed: {e}")
        return False

async def test_api_endpoints():
    """Test API endpoints (requires running server)"""
    print("🌐 Testing API endpoints...")
    
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        try:
            # Test health endpoint
            async with session.get(f"{base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Health check passed: {data['status']}")
                else:
                    print(f"❌ Health check failed: {response.status}")
                    return False
            
            # Test analyze endpoint
            test_payload = {
                "brand_name": "Test Brand",
                "brand_domain": "testsite.com", 
                "data": SAMPLE_DATA
            }
            
            async with session.post(
                f"{base_url}/api/ai-analysis/analyze",
                json=test_payload
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    print(f"✅ Analysis endpoint works: {data['success']}")
                    print(f"   Summary: {data['summary']}")
                else:
                    error_text = await response.text()
                    print(f"❌ Analysis endpoint failed: {response.status}")
                    print(f"   Error: {error_text}")
                    return False
                    
            return True
            
        except aiohttp.ClientConnectorError:
            print("⚠️  Server not running. Start with: python main.py")
            return False
        except Exception as e:
            print(f"❌ API test failed: {e}")
            return False

def test_imports():
    """Test that all required modules can be imported"""
    print("📦 Testing imports...")
    
    required_modules = [
        'fastapi', 'uvicorn', 'aiohttp', 'pandas', 
        'pydantic', 'python_multipart', 'aiofiles'
    ]
    
    missing = []
    for module in required_modules:
        try:
            __import__(module)
            print(f"✅ {module}")
        except ImportError:
            missing.append(module)
            print(f"❌ {module} - MISSING")
    
    if missing:
        print(f"\n⚠️  Missing modules: {', '.join(missing)}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    print("✅ All required modules available!")
    return True

async def main():
    """Run all tests"""
    print("🚀 AI Overviews Analysis Tool - Test Suite\n")
    
    # Test 1: Check imports
    imports_ok = test_imports()
    print()
    
    # Test 2: Test analyzer logic
    analyzer_ok = await test_analyzer() if imports_ok else False
    print()
    
    # Test 3: Test API endpoints (optional)
    api_ok = await test_api_endpoints() if imports_ok else False
    print()
    
    # Summary
    print("📋 Test Summary:")
    print(f"   Imports: {'✅' if imports_ok else '❌'}")
    print(f"   Analyzer: {'✅' if analyzer_ok else '❌'}")
    print(f"   API: {'✅' if api_ok else '⚠️  (requires running server)'}")
    
    if imports_ok and analyzer_ok:
        print("\n🎉 Core functionality is working! Ready for deployment.")
        if not api_ok:
            print("💡 To test API endpoints, run: python main.py (in another terminal)")
        return 0
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)