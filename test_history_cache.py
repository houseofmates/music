#!/usr/bin/env python3
"""
Simple test script to verify history caching performance.
Run this to test the backend caching implementation.
"""

import time
import asyncio
import aiohttp
import json
from typing import List, Dict

BASE_URL = "http://localhost:3006/api"

async def test_history_performance():
    """Test the performance of the history endpoint with caching."""
    
    async with aiohttp.ClientSession() as session:
        
        print("🎵 Testing History Cache Performance")
        print("=" * 50)
        
        # Test 1: First request (cache miss)
        print("\n1️⃣ First request (cache miss)...")
        start_time = time.time()
        async with session.get(f"{BASE_URL}/users/me/history?limit=100") as resp:
            if resp.status == 200:
                data = await resp.json()
                first_request_time = time.time() - start_time
                print(f"   ✅ Response time: {first_request_time:.3f}s")
                print(f"   📊 Items returned: {len(data)}")
            else:
                print(f"   ❌ Error: {resp.status}")
                return
        
        # Test 2: Second request (cache hit)
        print("\n2️⃣ Second request (cache hit)...")
        start_time = time.time()
        async with session.get(f"{BASE_URL}/users/me/history?limit=100") as resp:
            if resp.status == 200:
                data = await resp.json()
                second_request_time = time.time() - start_time
                print(f"   ✅ Response time: {second_request_time:.3f}s")
                print(f"   📊 Items returned: {len(data)}")
                
                # Calculate performance improvement
                if first_request_time > 0:
                    improvement = ((first_request_time - second_request_time) / first_request_time) * 100
                    print(f"   🚀 Performance improvement: {improvement:.1f}% faster")
            else:
                print(f"   ❌ Error: {resp.status}")
        
        # Test 3: Different limit (different cache key)
        print("\n3️⃣ Different limit (different cache key)...")
        start_time = time.time()
        async with session.get(f"{BASE_URL}/users/me/history?limit=50") as resp:
            if resp.status == 200:
                data = await resp.json()
                third_request_time = time.time() - start_time
                print(f"   ✅ Response time: {third_request_time:.3f}s")
                print(f"   📊 Items returned: {len(data)}")
            else:
                print(f"   ❌ Error: {resp.status}")
        
        # Test 4: Second request with same limit (cache hit)
        print("\n4️⃣ Second request with limit 50 (cache hit)...")
        start_time = time.time()
        async with session.get(f"{BASE_URL}/users/me/history?limit=50") as resp:
            if resp.status == 200:
                data = await resp.json()
                fourth_request_time = time.time() - start_time
                print(f"   ✅ Response time: {fourth_request_time:.3f}s")
                print(f"   📊 Items returned: {len(data)}")
                
                if third_request_time > 0:
                    improvement = ((third_request_time - fourth_request_time) / third_request_time) * 100
                    print(f"   🚀 Performance improvement: {improvement:.1f}% faster")
            else:
                print(f"   ❌ Error: {resp.status}")
        
        print("\n" + "=" * 50)
        print("✅ Cache performance test completed!")
        print("\n💡 Tips:")
        print("   - First request will be slower (cache miss)")
        print("   - Subsequent requests should be significantly faster")
        print("   - Different limits create separate cache entries")
        print("   - Cache expires after 5 minutes on the backend")

if __name__ == "__main__":
    print("🎵 Music App History Cache Test")
    print("Make sure the backend is running on localhost:3006")
    print()
    
    try:
        asyncio.run(test_history_performance())
    except Exception as e:
        print(f"❌ Error running test: {e}")
        print("\n💡 Make sure:")
        print("   - Backend server is running on localhost:3006")
        print("   - You have valid authentication token")
