import hashlib
import json
from time import time

class Block:
    """
    A block in the energy trading blockchain
    """
    
    def __init__(self, index, transactions, timestamp, previous_hash):
        self.index = index
        self.transactions = transactions
        self.timestamp = timestamp
        self.previous_hash = previous_hash
        self.nonce = 0
        self.hash = self.calculate_hash()
    
    def calculate_hash(self):
        """
        Calculate SHA-256 hash of block
        """
        block_string = json.dumps({
            'index': self.index,
            'transactions': self.transactions,
            'timestamp': self.timestamp,
            'previous_hash': self.previous_hash,
            'nonce': self.nonce
        }, sort_keys=True)
        
        return hashlib.sha256(block_string.encode()).hexdigest()
    
    def mine_block(self, difficulty=4):
        """
        Proof of work mining
        """
        target = '0' * difficulty
        
        while self.hash[:difficulty] != target:
            self.nonce += 1
            self.hash = self.calculate_hash()
        
        print(f"Block mined: {self.hash}")

class EnergyBlockchain:
    """
    Blockchain for recording peer-to-peer energy transactions
    """
    
    def __init__(self):
        self.chain = [self.create_genesis_block()]
        self.pending_transactions = []
        self.difficulty = 2
    
    def create_genesis_block(self):
        """
        Create first block in chain
        """
        return Block(0, [], time(), "0")
    
    def get_latest_block(self):
        return self.chain[-1]
    
    def add_transaction(self, sender, receiver, amount, price):
        """
        Add energy transaction to pending pool
        """
        transaction = {
            'from': sender,
            'to': receiver,
            'amount_kwh': amount,
            'price': price,
            'timestamp': time()
        }
        
        self.pending_transactions.append(transaction)
        return len(self.chain) + 1  # Block number where transaction will be added
    
    def mine_pending_transactions(self, miner_address):
        """
        Create new block with pending transactions
        """
        if not self.pending_transactions:
            return False
        
        block = Block(
            index=len(self.chain),
            transactions=self.pending_transactions,
            timestamp=time(),
            previous_hash=self.get_latest_block().hash
        )
        
        block.mine_block(self.difficulty)
        self.chain.append(block)
        
        # Mining reward
        self.pending_transactions = [{
            'from': 'system',
            'to': miner_address,
            'amount_kwh': 0.1,
            'price': 0,
            'timestamp': time()
        }]
        
        return True
    
    def get_balance(self, address):
        """
        Calculate balance for an address
        """
        balance = 0
        
        for block in self.chain:
            for transaction in block.transactions:
                if transaction['from'] == address:
                    balance -= transaction['amount_kwh'] * transaction['price']
                if transaction['to'] == address:
                    balance += transaction['amount_kwh'] * transaction['price']
        
        return balance
    
    def is_chain_valid(self):
        """
        Verify blockchain integrity
        """
        for i in range(1, len(self.chain)):
            current_block = self.chain[i]
            previous_block = self.chain[i - 1]
            
            # Check hash
            if current_block.hash != current_block.calculate_hash():
                return False
            
            # Check link to previous block
            if current_block.previous_hash != previous_block.hash:
                return False
        
        return True
