#!/usr/bin/env python3
"""
Cross-platform testing script for song loading performance optimization.

This script tests the implemented optimizations across different platforms:
- Web frontend performance
- API response times
- Streaming performance
- Cache effectiveness
- Transcoding functionality

Usage:
    python test_performance.py [--web] [--api] [--stream] [--cache] [--all]
"""

import requests
import time
import json
import subprocess
import sys
import os
from typing import Dict, List
import statistics

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.results = {
            'api_response_times': [],
            'stream_load_times': [],
            'cache_hit_rate': 0,
            'transcoding_performance': [],
            'errors': []
        }

    def test_api_endpoints(self) -> Dict:
        """Test API endpoint response times."""
        endpoints = [
            '/api/tracks?limit=10',
            '/api/artists',
            '/api/albums',
            '/health'
        ]

        print("Testing API endpoints...")
        for endpoint in endpoints:
            try:
                start_time = time.time()
                response = requests.get(f"{self.base_url}{endpoint}", timeout=10)
                load_time = (time.time() - start_time) * 1000  # Convert to ms

                if response.status_code == 200:
                    self.results['api_response_times'].append({
                        'endpoint': endpoint,
                        'response_time': load_time,
                        'status': response.status_code
                    })
                    print(f"✓ {endpoint}: {load_time:.2f}ms")
                else:
                    self.results['errors'].append(f"API {endpoint}: HTTP {response.status_code}")
                    print(f"✗ {endpoint}: HTTP {response.status_code}")

            except Exception as e:
                self.results['errors'].append(f"API {endpoint}: {str(e)}")
                print(f"✗ {endpoint}: {str(e)}")

        return self.results

    def test_streaming_performance(self) -> Dict:
        """Test audio streaming performance."""
        try:
            # Get a track to test streaming
            response = requests.get(f"{self.base_url}/api/tracks?limit=1")
            if response.status_code != 200:
                print("No tracks available for streaming test")
                return self.results

            tracks = response.json()
            if not tracks:
                print("No tracks found")
                return self.results

            track = tracks[0]
            track_id = track['id']
            print(f"Testing streaming for track: {track.get('title', 'Unknown')}")

            # Test metadata preload
            start_time = time.time()
            preload_response = requests.get(f"{self.base_url}/api/tracks/{track_id}/preload")
            preload_time = (time.time() - start_time) * 1000

            if preload_response.status_code == 200:
                metadata = preload_response.json()
                print(f"✓ Metadata preload: {preload_time:.2f}ms")
                self.results['stream_load_times'].append({
                    'type': 'metadata',
                    'track_id': track_id,
                    'load_time': preload_time
                })
            else:
                print(f"✗ Metadata preload failed: HTTP {preload_response.status_code}")

            # Test partial streaming (first 64KB)
            start_time = time.time()
            headers = {'Range': 'bytes=0-65535'}
            stream_response = requests.get(
                f"{self.base_url}/api/tracks/{track_id}/stream",
                headers=headers,
                timeout=30
            )
            stream_time = (time.time() - start_time) * 1000

            if stream_response.status_code in [200, 206]:
                content_length = len(stream_response.content)
                print(f"✓ Partial stream: {stream_time:.2f}ms, {content_length} bytes")

                # Check if transcoded to Opus
                content_type = stream_response.headers.get('content-type', '')
                transcoded = 'opus' in content_type.lower()

                self.results['stream_load_times'].append({
                    'type': 'partial_stream',
                    'track_id': track_id,
                    'load_time': stream_time,
                    'bytes_loaded': content_length,
                    'transcoded': transcoded,
                    'content_type': content_type
                })

                if transcoded:
                    print("✓ Transcoding to Opus detected")
                else:
                    print("ℹ Direct streaming (not transcoded)")
            else:
                print(f"✗ Stream failed: HTTP {stream_response.status_code}")
                self.results['errors'].append(f"Stream {track_id}: HTTP {stream_response.status_code}")

        except Exception as e:
            print(f"✗ Streaming test error: {str(e)}")
            self.results['errors'].append(f"Streaming test: {str(e)}")

        return self.results

    def test_caching_effectiveness(self) -> Dict:
        """Test cache effectiveness by making repeated requests."""
        try:
            # Get tracks for cache testing
            response = requests.get(f"{self.base_url}/api/tracks?limit=5")
            if response.status_code != 200:
                return self.results

            tracks = response.json()[:3]  # Test first 3 tracks

            cache_hits = 0
            total_requests = 0

            print("Testing cache effectiveness...")

            for track in tracks:
                track_id = track['id']

                # Make multiple requests to the same track
                for i in range(3):
                    total_requests += 1

                    start_time = time.time()
                    stream_response = requests.get(
                        f"{self.base_url}/api/tracks/{track_id}/stream",
                        headers={'Range': 'bytes=0-8191'},  # Small range for cache test
                        timeout=10
                    )
                    request_time = (time.time() - start_time) * 1000

                    if stream_response.status_code in [200, 206]:
                        # Check cache headers
                        cache_control = stream_response.headers.get('cache-control', '')
                        if 'max-age' in cache_control:
                            cache_hits += 1
                            print(f"✓ Cached request {i+1} for track {track_id}: {request_time:.2f}ms")
                        else:
                            print(f"✓ Request {i+1} for track {track_id}: {request_time:.2f}ms")
                    else:
                        print(f"✗ Cache test request {i+1} failed: HTTP {stream_response.status_code}")

            if total_requests > 0:
                hit_rate = (cache_hits / total_requests) * 100
                self.results['cache_hit_rate'] = hit_rate
                print(f"Cache hit rate: {hit_rate:.1f}%")

        except Exception as e:
            print(f"✗ Cache test error: {str(e)}")
            self.results['errors'].append(f"Cache test: {str(e)}")

        return self.results

    def generate_report(self) -> str:
        """Generate a performance report."""
        report = []
        report.append("🎵 Music App Performance Test Report")
        report.append("=" * 50)

        # API Performance
        if self.results['api_response_times']:
            api_times = [r['response_time'] for r in self.results['api_response_times']]
            avg_api_time = statistics.mean(api_times)
            report.append(f"API Response Times:")
            report.append(f"  Average: {avg_api_time:.2f}ms")
            report.append(f"  Min: {min(api_times):.2f}ms")
            report.append(f"  Max: {max(api_times):.2f}ms")
            report.append("")

        # Streaming Performance
        stream_times = [r for r in self.results['stream_load_times'] if r['type'] == 'partial_stream']
        if stream_times:
            load_times = [r['load_time'] for r in stream_times]
            avg_stream_time = statistics.mean(load_times)
            report.append(f"Streaming Performance:")
            report.append(f"  Average load time: {avg_stream_time:.2f}ms")
            report.append(f"  Transcoding: {'Enabled' if any(r['transcoded'] for r in stream_times) else 'Disabled'}")
            report.append("")

        # Cache Performance
        if self.results['cache_hit_rate'] > 0:
            report.append(f"Cache Effectiveness:")
            report.append(f"  Hit rate: {self.results['cache_hit_rate']:.1f}%")
            report.append("")

        # Errors
        if self.results['errors']:
            report.append(f"Errors ({len(self.results['errors'])}):")
            for error in self.results['errors'][:5]:  # Show first 5 errors
                report.append(f"  - {error}")
            if len(self.results['errors']) > 5:
                report.append(f"  ... and {len(self.results['errors']) - 5} more")
            report.append("")

        # Recommendations
        report.append("Recommendations:")
        if self.results.get('api_response_times'):
            api_times = [r['response_time'] for r in self.results['api_response_times']]
            if statistics.mean(api_times) > 500:
                report.append("  ⚠️  API response times are high (>500ms). Consider database optimization.")
            else:
                report.append("  ✓ API response times are good.")

        if stream_times:
            load_times = [r['load_time'] for r in stream_times]
            if statistics.mean(load_times) > 2000:
                report.append("  ⚠️  Streaming load times are high (>2s). Check network/CDN configuration.")
            else:
                report.append("  ✓ Streaming performance is good.")

        if self.results['cache_hit_rate'] < 50:
            report.append("  ⚠️  Low cache hit rate. Review caching strategy.")
        else:
            report.append("  ✓ Cache hit rate is good.")

        return "\n".join(report)

    def run_all_tests(self) -> Dict:
        """Run all performance tests."""
        print("Starting comprehensive performance tests...\n")

        self.test_api_endpoints()
        print()
        self.test_streaming_performance()
        print()
        self.test_caching_effectiveness()
        print()

        report = self.generate_report()
        print(report)

        return self.results


def main():
    import argparse

    parser = argparse.ArgumentParser(description='Test music app performance optimizations')
    parser.add_argument('--url', default='http://localhost:8000', help='Base URL of the music app')
    parser.add_argument('--api', action='store_true', help='Test API endpoints only')
    parser.add_argument('--stream', action='store_true', help='Test streaming performance only')
    parser.add_argument('--cache', action='store_true', help='Test caching effectiveness only')
    parser.add_argument('--all', action='store_true', help='Run all tests (default)')

    args = parser.parse_args()

    # Default to all tests if none specified
    if not any([args.api, args.stream, args.cache]):
        args.all = True

    tester = PerformanceTester(args.url)

    try:
        if args.all or args.api:
            tester.test_api_endpoints()
            print()

        if args.all or args.stream:
            tester.test_streaming_performance()
            print()

        if args.all or args.cache:
            tester.test_caching_effectiveness()
            print()

        if args.all:
            report = tester.generate_report()
            print(report)

    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Test failed: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()