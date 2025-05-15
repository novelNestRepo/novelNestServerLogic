from typing import List, Tuple
from ..algorithms.collaborative_filtering import CollaborativeFiltering

class RecommendationService:
    def __init__(self):
        self.collaborative_filtering = CollaborativeFiltering()

    def add_user_rating(self, user_id: str, book_id: str, rating: float) -> None:
        """Add a new user rating to the recommendation system"""
        self.collaborative_filtering.add_rating(user_id, book_id, rating)

    def get_book_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Tuple[str, float]]:
        """Get book recommendations for a user based on collaborative filtering"""
        return self.collaborative_filtering.get_recommendations(user_id, n_recommendations)

    def update_similarity_matrix(self) -> None:
        """Update the user similarity matrix"""
        self.collaborative_filtering.build_similarity_matrix()