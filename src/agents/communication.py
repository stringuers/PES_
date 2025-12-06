"""
Agent Communication Module
Handles message passing and coordination between agents
"""

import numpy as np
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime


@dataclass
class Message:
    """Message structure for agent communication"""
    sender_id: int
    receiver_id: int
    message_type: str  # 'request', 'offer', 'accept', 'reject', 'status'
    content: Dict[str, Any]
    timestamp: float
    priority: int = 0


class CommunicationProtocol:
    """
    Manages communication between agents in the swarm
    """
    
    def __init__(self):
        self.message_queue = []
        self.message_history = []
        self.broadcast_messages = []
    
    def send_message(self, message: Message):
        """Send a message to the queue"""
        self.message_queue.append(message)
        self.message_history.append(message)
    
    def broadcast(self, sender_id: int, message_type: str, content: Dict[str, Any]):
        """Broadcast message to all agents"""
        broadcast_msg = Message(
            sender_id=sender_id,
            receiver_id=-1,  # -1 indicates broadcast
            message_type=message_type,
            content=content,
            timestamp=datetime.now().timestamp()
        )
        self.broadcast_messages.append(broadcast_msg)
        self.message_history.append(broadcast_msg)
    
    def get_messages_for_agent(self, agent_id: int) -> List[Message]:
        """Retrieve all messages for a specific agent"""
        messages = []
        
        # Direct messages
        for msg in self.message_queue:
            if msg.receiver_id == agent_id:
                messages.append(msg)
        
        # Broadcast messages
        for msg in self.broadcast_messages:
            if msg.sender_id != agent_id:  # Don't send own broadcasts back
                messages.append(msg)
        
        # Clear processed messages
        self.message_queue = [m for m in self.message_queue if m.receiver_id != agent_id]
        
        return sorted(messages, key=lambda x: x.priority, reverse=True)
    
    def clear_old_broadcasts(self, max_age_seconds: float = 60):
        """Remove old broadcast messages"""
        current_time = datetime.now().timestamp()
        self.broadcast_messages = [
            msg for msg in self.broadcast_messages
            if current_time - msg.timestamp < max_age_seconds
        ]


class EnergyNegotiator:
    """
    Handles energy trading negotiations between agents
    """
    
    def __init__(self):
        self.active_offers = {}
        self.completed_trades = []
    
    def create_offer(self, seller_id: int, energy_kwh: float, price_per_kwh: float):
        """Create an energy offer"""
        offer_id = f"{seller_id}_{datetime.now().timestamp()}"
        self.active_offers[offer_id] = {
            'seller_id': seller_id,
            'energy_kwh': energy_kwh,
            'price_per_kwh': price_per_kwh,
            'status': 'open',
            'timestamp': datetime.now().timestamp()
        }
        return offer_id
    
    def accept_offer(self, offer_id: str, buyer_id: int, amount_kwh: float):
        """Accept an energy offer"""
        if offer_id not in self.active_offers:
            return False
        
        offer = self.active_offers[offer_id]
        
        if offer['status'] != 'open':
            return False
        
        if amount_kwh > offer['energy_kwh']:
            amount_kwh = offer['energy_kwh']
        
        # Record trade
        trade = {
            'seller_id': offer['seller_id'],
            'buyer_id': buyer_id,
            'energy_kwh': amount_kwh,
            'price_per_kwh': offer['price_per_kwh'],
            'total_cost': amount_kwh * offer['price_per_kwh'],
            'timestamp': datetime.now().timestamp()
        }
        self.completed_trades.append(trade)
        
        # Update offer
        offer['energy_kwh'] -= amount_kwh
        if offer['energy_kwh'] <= 0:
            offer['status'] = 'completed'
        
        return True
    
    def get_available_offers(self, max_price: float = None) -> List[Dict]:
        """Get all available energy offers"""
        offers = []
        for offer_id, offer in self.active_offers.items():
            if offer['status'] == 'open':
                if max_price is None or offer['price_per_kwh'] <= max_price:
                    offers.append({
                        'offer_id': offer_id,
                        **offer
                    })
        return offers


class ConsensusProtocol:
    """
    Implements consensus mechanisms for swarm decisions
    """
    
    def __init__(self, num_agents: int):
        self.num_agents = num_agents
        self.votes = {}
    
    def start_vote(self, proposal_id: str, proposal: Dict[str, Any]):
        """Start a voting round"""
        self.votes[proposal_id] = {
            'proposal': proposal,
            'votes_for': [],
            'votes_against': [],
            'status': 'open'
        }
    
    def cast_vote(self, proposal_id: str, agent_id: int, vote: bool):
        """Cast a vote (True = for, False = against)"""
        if proposal_id not in self.votes:
            return False
        
        if self.votes[proposal_id]['status'] != 'open':
            return False
        
        if vote:
            self.votes[proposal_id]['votes_for'].append(agent_id)
        else:
            self.votes[proposal_id]['votes_against'].append(agent_id)
        
        # Check if voting is complete
        total_votes = len(self.votes[proposal_id]['votes_for']) + \
                     len(self.votes[proposal_id]['votes_against'])
        
        if total_votes >= self.num_agents:
            self.close_vote(proposal_id)
        
        return True
    
    def close_vote(self, proposal_id: str):
        """Close voting and determine result"""
        if proposal_id not in self.votes:
            return None
        
        vote_data = self.votes[proposal_id]
        votes_for = len(vote_data['votes_for'])
        votes_against = len(vote_data['votes_against'])
        
        # Simple majority
        if votes_for > votes_against:
            vote_data['status'] = 'passed'
            vote_data['result'] = True
        else:
            vote_data['status'] = 'rejected'
            vote_data['result'] = False
        
        return vote_data['result']
    
    def get_vote_result(self, proposal_id: str) -> Dict:
        """Get voting results"""
        if proposal_id not in self.votes:
            return None
        return self.votes[proposal_id]


# Usage example
if __name__ == "__main__":
    # Test communication
    protocol = CommunicationProtocol()
    
    # Agent 0 broadcasts status
    protocol.broadcast(
        sender_id=0,
        message_type='status',
        content={'battery': 75, 'excess_energy': 2.5}
    )
    
    # Agent 1 sends request to Agent 2
    msg = Message(
        sender_id=1,
        receiver_id=2,
        message_type='request',
        content={'energy_needed': 1.5},
        timestamp=datetime.now().timestamp()
    )
    protocol.send_message(msg)
    
    # Agent 2 retrieves messages
    messages = protocol.get_messages_for_agent(2)
    print(f"Agent 2 received {len(messages)} messages")
    
    # Test negotiation
    negotiator = EnergyNegotiator()
    offer_id = negotiator.create_offer(seller_id=0, energy_kwh=3.0, price_per_kwh=0.12)
    negotiator.accept_offer(offer_id, buyer_id=1, amount_kwh=1.5)
    
    print(f"Completed {len(negotiator.completed_trades)} trades")
