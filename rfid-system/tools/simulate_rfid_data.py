#!/usr/bin/env python3
"""
RFID Data Simulation Tool

Simulates RFID tag scans for testing the StitchOS RFID tracking system.
Generates realistic data patterns for production lines, uniforms, and checkpoints.
"""

import asyncio
import json
import random
import time
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
import argparse
import httpx
import click


class RFIDDataSimulator:
    """Simulates RFID data for testing purposes"""
    
    def __init__(self, api_url: str = "http://localhost:8001"):
        self.api_url = api_url
        self.session = httpx.AsyncClient(timeout=30.0)
        
        # Sample data for realistic simulation
        self.tag_epcs = [
            "3034257BF400000000000001", "3034257BF400000000000002",
            "3034257BF400000000000003", "3034257BF400000000000004",
            "3034257BF400000000000005", "3034257BF400000000000006",
            "3034257BF400000000000007", "3034257BF400000000000008",
            "3034257BF400000000000009", "3034257BF40000000000000A"
        ]
        
        self.checkpoints = [
            {"id": "checkpoint-1", "name": "Cut Entry", "type": "entry"},
            {"id": "checkpoint-2", "name": "Issue Point", "type": "issue"},
            {"id": "checkpoint-3", "name": "Station 1", "type": "checkpoint"},
            {"id": "checkpoint-4", "name": "Station 2", "type": "checkpoint"},
            {"id": "checkpoint-5", "name": "Finish Exit", "type": "exit"}
        ]
        
        self.production_stages = ["cut", "issue", "station1", "station2", "finish"]
        
    async def close(self):
        """Close HTTP session"""
        await self.session.aclose()
    
    async def simulate_production_line(self, line_number: int, duration_minutes: int):
        """Simulate production line activity"""
        print(f"🎯 Simulating Production Line {line_number} for {duration_minutes} minutes")
        
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Generate tags for this line
        line_tags = random.sample(self.tag_epcs, random.randint(50, 150))
        
        # Track tag progress through stages
        tag_progress = {tag: 0 for tag in line_tags}
        
        while datetime.utcnow() < end_time:
            # Simulate tag movement through production stages
            for tag in line_tags:
                if tag_progress[tag] < len(self.production_stages):
                    # Random chance to advance tag
                    if random.random() < 0.3:  # 30% chance per iteration
                        stage = self.production_stages[tag_progress[tag]]
                        checkpoint = self._get_checkpoint_for_stage(stage)
                        
                        # Create scan event
                        scan_event = {
                            "factory_id": "ktl-factory-001",
                            "tag_id": f"tag-{tag}",
                            "checkpoint_id": checkpoint["id"],
                            "scan_type": checkpoint["type"],
                            "timestamp": datetime.utcnow().isoformat(),
                            "signal_strength": random.randint(-60, -30),
                            "antenna_number": random.randint(1, 4),
                            "read_count": random.randint(1, 3)
                        }
                        
                        # Send to API
                        await self._send_scan_event(scan_event)
                        
                        # Advance tag
                        tag_progress[tag] += 1
                        
                        print(f"📦 Tag {tag[:8]}... → {stage}")
            
            # Wait before next iteration
            await asyncio.sleep(random.uniform(2, 8))
        
        print(f"✅ Production Line {line_number} simulation completed")
    
    async def simulate_uniform_management(self, duration_minutes: int):
        """Simulate uniform issue and return activity"""
        print(f"👕 Simulating Uniform Management for {duration_minutes} minutes")
        
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Generate uniform tags
        uniform_tags = random.sample(self.tag_epcs, random.randint(20, 50))
        
        # Track issued uniforms
        issued_uniforms = {}
        
        while datetime.utcnow() < end_time:
            current_time = datetime.utcnow()
            
            # Simulate uniform issues (morning shift)
            if 6 <= current_time.hour <= 9:
                for tag in uniform_tags:
                    if tag not in issued_uniforms and random.random() < 0.4:
                        # Issue uniform
                        scan_event = {
                            "factory_id": "ktl-factory-001",
                            "tag_id": f"uniform-{tag}",
                            "checkpoint_id": "checkpoint-2",  # Issue Point
                            "scan_type": "issue",
                            "timestamp": current_time.isoformat(),
                            "signal_strength": random.randint(-50, -25),
                            "antenna_number": random.randint(1, 2),
                            "read_count": 1
                        }
                        
                        await self._send_scan_event(scan_event)
                        issued_uniforms[tag] = current_time
                        print(f"👔 Uniform {tag[:8]}... issued")
            
            # Simulate uniform returns (evening shift)
            elif 17 <= current_time.hour <= 20:
                for tag, issue_time in list(issued_uniforms.items()):
                    if random.random() < 0.5:
                        # Return uniform
                        scan_event = {
                            "factory_id": "ktl-factory-001",
                            "tag_id": f"uniform-{tag}",
                            "checkpoint_id": "checkpoint-2",  # Issue Point
                            "scan_type": "return",
                            "timestamp": current_time.isoformat(),
                            "signal_strength": random.randint(-50, -25),
                            "antenna_number": random.randint(1, 2),
                            "read_count": 1
                        }
                        
                        await self._send_scan_event(scan_event)
                        del issued_uniforms[tag]
                        print(f"🔄 Uniform {tag[:8]}... returned")
            
            await asyncio.sleep(random.uniform(10, 30))
        
        print(f"✅ Uniform Management simulation completed")
    
    async def simulate_random_scans(self, duration_minutes: int, scan_rate: int = 10):
        """Simulate random RFID scans"""
        print(f"🎲 Simulating Random Scans for {duration_minutes} minutes (rate: {scan_rate}/min)")
        
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        while datetime.utcnow() < end_time:
            # Generate random scan events
            for _ in range(random.randint(1, scan_rate)):
                tag = random.choice(self.tag_epcs)
                checkpoint = random.choice(self.checkpoints)
                
                scan_event = {
                    "factory_id": "ktl-factory-001",
                    "tag_id": f"tag-{tag}",
                    "checkpoint_id": checkpoint["id"],
                    "scan_type": checkpoint["type"],
                    "timestamp": datetime.utcnow().isoformat(),
                    "signal_strength": random.randint(-70, -20),
                    "antenna_number": random.randint(1, 8),
                    "read_count": random.randint(1, 5)
                }
                
                await self._send_scan_event(scan_event)
            
            # Wait for next minute
            await asyncio.sleep(60)
        
        print(f"✅ Random Scans simulation completed")
    
    async def simulate_bottleneck_scenario(self, duration_minutes: int):
        """Simulate production bottleneck scenario"""
        print(f"🚧 Simulating Bottleneck Scenario for {duration_minutes} minutes")
        
        start_time = datetime.utcnow()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        # Create bottleneck at Station 1
        bottleneck_checkpoint = "checkpoint-3"  # Station 1
        
        # Generate tags that will get stuck
        stuck_tags = random.sample(self.tag_epcs, random.randint(20, 40))
        
        # Move tags to bottleneck
        for tag in stuck_tags:
            scan_event = {
                "factory_id": "ktl-factory-001",
                "tag_id": f"tag-{tag}",
                "checkpoint_id": bottleneck_checkpoint,
                "scan_type": "checkpoint",
                "timestamp": datetime.utcnow().isoformat(),
                "signal_strength": random.randint(-55, -35),
                "antenna_number": random.randint(1, 2),
                "read_count": 1
            }
            
            await self._send_scan_event(scan_event)
            print(f"🚧 Tag {tag[:8]}... stuck at bottleneck")
        
        # Keep tags at bottleneck for duration
        await asyncio.sleep(duration_minutes * 60)
        
        print(f"✅ Bottleneck Scenario simulation completed")
    
    def _get_checkpoint_for_stage(self, stage: str) -> Dict[str, Any]:
        """Get checkpoint configuration for production stage"""
        stage_mapping = {
            "cut": {"id": "checkpoint-1", "name": "Cut Entry", "type": "entry"},
            "issue": {"id": "checkpoint-2", "name": "Issue Point", "type": "issue"},
            "station1": {"id": "checkpoint-3", "name": "Station 1", "type": "checkpoint"},
            "station2": {"id": "checkpoint-4", "name": "Station 2", "type": "checkpoint"},
            "finish": {"id": "checkpoint-5", "name": "Finish Exit", "type": "exit"}
        }
        return stage_mapping.get(stage, self.checkpoints[0])
    
    async def _send_scan_event(self, scan_event: Dict[str, Any]):
        """Send scan event to the API"""
        try:
            response = await self.session.post(
                f"{self.api_url}/api/v1/scan-events",
                json=scan_event,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                return True
            else:
                print(f"❌ Failed to send scan event: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending scan event: {e}")
            return False
    
    async def run_comprehensive_simulation(self, duration_minutes: int):
        """Run comprehensive simulation with all scenarios"""
        print(f"🚀 Starting Comprehensive RFID Simulation for {duration_minutes} minutes")
        print("=" * 60)
        
        # Run simulations concurrently
        tasks = [
            self.simulate_production_line(1, duration_minutes),
            self.simulate_production_line(2, duration_minutes),
            self.simulate_uniform_management(duration_minutes),
            self.simulate_random_scans(duration_minutes, 5),
            self.simulate_bottleneck_scenario(duration_minutes)
        ]
        
        await asyncio.gather(*tasks)
        
        print("=" * 60)
        print("🎉 Comprehensive simulation completed!")


@click.command()
@click.option('--duration', '-d', default=30, help='Simulation duration in minutes')
@click.option('--scenario', '-s', type=click.Choice(['production', 'uniforms', 'random', 'bottleneck', 'comprehensive']), 
              default='comprehensive', help='Simulation scenario')
@click.option('--api-url', '-u', default='http://localhost:8001', help='API base URL')
@click.option('--scan-rate', '-r', default=10, help='Scans per minute for random scenario')
def main(duration: int, scenario: str, api_url: str, scan_rate: int):
    """RFID Data Simulation Tool for StitchOS"""
    
    print("🏭 StitchOS RFID Data Simulator")
    print("=" * 40)
    print(f"Duration: {duration} minutes")
    print(f"Scenario: {scenario}")
    print(f"API URL: {api_url}")
    print("=" * 40)
    
    async def run_simulation():
        simulator = RFIDDataSimulator(api_url)
        
        try:
            if scenario == 'production':
                await simulator.simulate_production_line(1, duration)
            elif scenario == 'uniforms':
                await simulator.simulate_uniform_management(duration)
            elif scenario == 'random':
                await simulator.simulate_random_scans(duration, scan_rate)
            elif scenario == 'bottleneck':
                await simulator.simulate_bottleneck_scenario(duration)
            elif scenario == 'comprehensive':
                await simulator.run_comprehensive_simulation(duration)
                
        finally:
            await simulator.close()
    
    # Run the simulation
    asyncio.run(run_simulation())


if __name__ == "__main__":
    main()