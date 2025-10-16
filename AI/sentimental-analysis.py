from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline
import torch
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for Angular frontend

class DatingSentimentAnalyzer:
    def __init__(self):
        # Initialize sentiment analysis pipeline
        # Using distilbert-base-uncased-finetuned-sst-2-english for sentiment analysis
        self.sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            device=0 if torch.cuda.is_available() else -1  # Use GPU if available
        )
        
    def analyze_message(self, content, sender_username):
        """
        Analyze sentiment of a dating message and return score 1-100
        Higher scores indicate more positive/affectionate sentiment
        """
        if not content or len(content.strip()) == 0:
            return {
                'username': sender_username,
                'sentiment': 50,  # Neutral for empty messages
                'confidence': 0.5,
                'raw_prediction': 'NEUTRAL'
            }
        
        try:
            # Analyze sentiment
            result = self.sentiment_pipeline(content)[0]
            
            # Extract label and confidence
            label = result['label']
            confidence = result['score']
            
            # Map to 1-100 scale
            if label == 'POSITIVE':
                # For dating app, boost positive scores slightly
                # since we want to capture affection/interest
                sentiment_score = int(confidence * 100 * 1.1)  # Boost positive by 10%
                sentiment_score = min(100, max(1, sentiment_score))  # Clamp 1-100
            else:
                # For negative, map to lower end but not too harsh for dating
                sentiment_score = int((1 - confidence) * 25 + 25)  # 25-50 range for negative
                sentiment_score = max(1, sentiment_score)  # Minimum 1
            
            # Additional dating-specific adjustments
            sentiment_score = self._dating_context_adjustment(content, sentiment_score)
            
            return {
                'username': sender_username,
                'sentiment': sentiment_score,
                'confidence': confidence,
                'raw_prediction': label,
                'message': content[:50] + '...' if len(content) > 50 else content,
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            # Fallback to basic analysis
            return {
                'username': sender_username,
                'sentiment': 50,
                'confidence': 0.5,
                'raw_prediction': 'ERROR',
                'message': content[:50] + '...' if len(content) > 50 else content,
                'error': str(e)
            }
    
    def _dating_context_adjustment(self, content, base_score):
        """
        Apply dating-specific adjustments to sentiment score
        """
        content_lower = content.lower()
        
        # Boost for common dating positive indicators
        positive_boosters = [
            'love', 'like', 'cute', 'beautiful', 'handsome', 'gorgeous', 
            'amazing', 'wonderful', 'perfect', 'dream', 'heart', 'kiss', 'hug',
            'date', 'meet', 'coffee', 'dinner', 'romantic', 'sweet', 'darling'
        ]
        
        negative_adjusters = ['busy', 'tired', 'late', 'sorry']
        
        # Check for positive boosters
        booster_count = sum(1 for word in positive_boosters if word in content_lower)
        if booster_count > 0:
            base_score = min(100, base_score + (booster_count * 5))
        
        # Check for emojis (simple detection)
        emoji_patterns = ['😊', '😘', '❤️', '💕', '😍', '🥰', '😘', '💋']
        emoji_count = sum(1 for emoji in emoji_patterns if emoji in content)
        if emoji_count > 0:
            base_score = min(100, base_score + (emoji_count * 10))
        
        return base_score

# Initialize analyzer
analyzer = DatingSentimentAnalyzer()

@app.route('/api/sentiment/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Analyze sentiment of a single message
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        sender_username = data.get('senderUsername', 'unknown')
        content = data.get('content', '')
        
        if not sender_username or not content:
            return jsonify({'error': 'Missing senderUsername or content'}), 400
        
        # Analyze sentiment
        result = analyzer.analyze_message(content, sender_username)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/sentiment/batch', methods=['POST'])
def analyze_batch_sentiment():
    """
    Analyze multiple messages at once (for your message thread)
    """
    try:
        data = request.get_json()
        
        if not data or 'messages' not in data:
            return jsonify({'error': 'Missing messages array'}), 400
        
        messages = data['messages']
        if not isinstance(messages, list):
            return jsonify({'error': 'Messages must be an array'}), 400
        
        results = []
        for msg_data in messages:
            sender_username = msg_data.get('senderUsername', 'unknown')
            content = msg_data.get('content', '')
            
            if sender_username and content:
                result = analyzer.analyze_message(content, sender_username)
                results.append(result)
        
        return jsonify({
            'results': results,
            'processed': len(results),
            'total': len(messages)
        })
        
    except Exception as e:
        return jsonify({
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model': 'distilbert-base-uncased-finetuned-sst-2-english',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    print("Starting Dating Sentiment Analysis API...")
    print("Model loaded:", analyzer.sentiment_pipeline.model.config.name_or_path)
    app.run(host='0.0.0.0', port=5002, debug=True)