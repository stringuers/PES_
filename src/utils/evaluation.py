class ProjectEvaluator:
    """
    Comprehensive project evaluation framework
    """
    
    def __init__(self):
        self.results = {}
    
    def evaluate_all(self, simulation_results, user_feedback=None):
        """
        Run all evaluations and generate final score
        """
        # Technical evaluation
        technical_score = self.evaluate_technical(simulation_results)
        
        # Economic evaluation
        economic_score = self.evaluate_economic(simulation_results)
        
        # Environmental evaluation
        environmental_score = self.evaluate_environmental(simulation_results)
        
        # User experience (if available)
        ux_score = self.evaluate_ux(user_feedback) if user_feedback else 80
        
        # Weighted total score
        total_score = (
            technical_score * 0.4 +
            economic_score * 0.25 +
            environmental_score * 0.25 +
            ux_score * 0.1
        )
        
        return {
            'technical': technical_score,
            'economic': economic_score,
            'environmental': environmental_score,
            'ux': ux_score,
            'total': total_score,
            'grade': self.get_grade(total_score)
        }
    
    def evaluate_technical(self, results):
        """
        Evaluate technical performance
        """
        scores = []
        
        # Solar utilization (40 points)
        solar_util = results['solar_usage_pct']
        if solar_util >= 85:
            scores.append(40)
        elif solar_util >= 75:
            scores.append(30)
        elif solar_util >= 65:
            scores.append(20)
        else:
            scores.append(10)
        
        # Forecasting accuracy (30 points)
        if 'forecasting_mape' in results:
            mape = results['forecasting_mape']
            if mape < 10:
                scores.append(30)
            elif mape < 15:
                scores.append(20)
            elif mape < 20:
                scores.append(10)
            else:
                scores.append(5)
        
        # System reliability (30 points)
        uptime = results.get('uptime_pct', 100)
        scores.append(uptime / 100 * 30)
        
        return sum(scores)
    
    def evaluate_economic(self, results):
        """
        Evaluate economic impact
        """
        # Cost savings percentage
        savings_pct = results.get('cost_savings_pct', 0)
        
        if savings_pct >= 35:
            return 100
        elif savings_pct >= 30:
            return 90
        elif savings_pct >= 25:
            return 80
        elif savings_pct >= 20:
            return 70
        else:
            return max(0, savings_pct * 3)
    
    def evaluate_environmental(self, results):
        """
        Evaluate environmental impact
        """
        co2_saved_daily = results.get('co2_saved_kg', 0)
        
        # Target: 150 kg/day for 50 homes
        target = 150
        percentage = (co2_saved_daily / target) * 100
        
        return min(100, percentage)
    
    def evaluate_ux(self, feedback):
        """
        Evaluate user experience
        """
        if not feedback:
            return 80  # Default score
        
        satisfaction = feedback.get('satisfaction_pct', 80)
        engagement = feedback.get('engagement_pct', 70)
        
        return (satisfaction + engagement) / 2
    
    def get_grade(self, score):
        """
        Convert score to letter grade
        """
        if score >= 90:
            return 'A+ (Excellent)'
        elif score >= 80:
            return 'A (Very Good)'
        elif score >= 70:
            return 'B (Good)'
        elif score >= 60:
            return 'C (Satisfactory)'
        else:
            return 'D (Needs Improvement)'